import {
  ConflictException,
  Injectable,
  UnauthorizedException
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectDataSource } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { DataSource, EntityManager } from 'typeorm';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { AuthRepository } from './repositories/auth.repository';
import { JwtAuthPayload } from './types/jwt-auth-payload.type';
import { RefreshTokenEntity } from './entities/refresh-token.entity';

type TokenPair = {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: string;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly repository: AuthRepository,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    @InjectDataSource() private readonly dataSource: DataSource
  ) {}

  async register(dto: RegisterDto): Promise<TokenPair> {
    const existing = await this.repository.findCredentialByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const rounds = this.configService.get<number>('BCRYPT_SALT_ROUNDS', 10);
    const hashed = await bcrypt.hash(dto.password, rounds);

    return this.dataSource.transaction(async (manager) => {
      const credential = await this.repository.createCredential(
        {
          userId: dto.userId,
          outletId: dto.outletId,
          email: dto.email,
          role: dto.role,
          passwordHash: hashed,
          isActive: true
        },
        manager
      );

      return this.issueTokenPair(
        credential.id,
        credential.userId,
        credential.outletId,
        credential.role,
        credential.email,
        manager
      );
    });
  }

  async login(dto: LoginDto): Promise<TokenPair> {
    const credential = await this.repository.findCredentialByEmail(dto.email);
    if (!credential || !credential.isActive || credential.outletId !== dto.outletId) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const matched = await bcrypt.compare(dto.password, credential.passwordHash);
    if (!matched) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.issueTokenPair(
      credential.id,
      credential.userId,
      credential.outletId,
      credential.role,
      credential.email
    );
  }

  async refresh(refreshToken: string): Promise<TokenPair> {
    const payload = this.verifyRefreshToken(refreshToken);
    const credential = await this.repository.findCredentialById(payload.sub);
    if (!credential || !credential.isActive) {
      throw new UnauthorizedException('Credential not available');
    }

    const validTokens = await this.repository.listValidTokensForCredential(credential.id);
    const matchedToken = await this.findMatchedRefreshToken(validTokens, refreshToken);
    if (!matchedToken) {
      throw new UnauthorizedException('Refresh token revoked or invalid');
    }

    return this.dataSource.transaction(async (manager) => {
      await manager.getRepository(RefreshTokenEntity).update({ id: matchedToken.id }, { revoked: true });
      return this.issueTokenPair(
        credential.id,
        credential.userId,
        credential.outletId,
        credential.role,
        credential.email,
        manager
      );
    });
  }

  async logout(refreshToken: string): Promise<void> {
    const payload = this.verifyRefreshToken(refreshToken);
    const validTokens = await this.repository.listValidTokensForCredential(payload.sub);
    const matchedToken = await this.findMatchedRefreshToken(validTokens, refreshToken);
    if (matchedToken) {
      await this.repository.revokeTokenById(matchedToken.id);
    }
  }

  private verifyRefreshToken(token: string): JwtAuthPayload {
    try {
      const payload = this.jwtService.verify<JwtAuthPayload>(token, {
        secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET')
      });
      if (payload.tokenType !== 'refresh') {
        throw new UnauthorizedException('Invalid token type');
      }
      return payload;
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  private async findMatchedRefreshToken(
    validTokens: RefreshTokenEntity[],
    plainToken: string
  ): Promise<RefreshTokenEntity | null> {
    for (const token of validTokens) {
      if (token.expiresAt.getTime() <= Date.now()) {
        continue;
      }
      const matched = await bcrypt.compare(plainToken, token.tokenHash);
      if (matched) {
        return token;
      }
    }
    return null;
  }

  private async issueTokenPair(
    credentialId: string,
    userId: string,
    outletId: string,
    role: string,
    email: string,
    manager?: EntityManager
  ): Promise<TokenPair> {
    const accessPayload: JwtAuthPayload = {
      sub: credentialId,
      userId,
      outletId,
      role,
      email,
      tokenType: 'access'
    };
    const refreshPayload: JwtAuthPayload = { ...accessPayload, tokenType: 'refresh' };

    const accessExpiresIn = this.configService.get<string>('JWT_ACCESS_EXPIRES_IN', '15m');
    const refreshExpiresIn = this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d');

    const accessToken = await this.jwtService.signAsync(accessPayload, {
      secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
      expiresIn: accessExpiresIn
    });
    const refreshToken = await this.jwtService.signAsync(refreshPayload, {
      secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      expiresIn: refreshExpiresIn
    });

    const rounds = this.configService.get<number>('BCRYPT_SALT_ROUNDS', 10);
    const refreshHash = await bcrypt.hash(refreshToken, rounds);
    const expiresAt = this.resolveRefreshExpiryDate(refreshExpiresIn);

    await this.repository.createRefreshToken(
      {
        credentialId,
        outletId,
        tokenHash: refreshHash,
        revoked: false,
        expiresAt
      },
      manager
    );

    return {
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
      expiresIn: accessExpiresIn
    };
  }

  private resolveRefreshExpiryDate(duration: string): Date {
    const now = new Date();
    if (duration.endsWith('d')) {
      const days = Number(duration.slice(0, -1));
      now.setDate(now.getDate() + days);
      return now;
    }
    if (duration.endsWith('h')) {
      const hours = Number(duration.slice(0, -1));
      now.setHours(now.getHours() + hours);
      return now;
    }
    if (duration.endsWith('m')) {
      const minutes = Number(duration.slice(0, -1));
      now.setMinutes(now.getMinutes() + minutes);
      return now;
    }
    now.setDate(now.getDate() + 7);
    return now;
  }
}
