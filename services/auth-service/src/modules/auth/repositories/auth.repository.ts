import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { Repository } from 'typeorm';
import { AuthCredentialEntity } from '../entities/auth-credential.entity';
import { RefreshTokenEntity } from '../entities/refresh-token.entity';

@Injectable()
export class AuthRepository {
  constructor(
    @InjectRepository(AuthCredentialEntity)
    private readonly credentialRepository: Repository<AuthCredentialEntity>,
    @InjectRepository(RefreshTokenEntity)
    private readonly refreshTokenRepository: Repository<RefreshTokenEntity>
  ) {}

  async createCredential(
    data: Partial<AuthCredentialEntity>,
    manager?: EntityManager
  ): Promise<AuthCredentialEntity> {
    const repository = manager
      ? manager.getRepository(AuthCredentialEntity)
      : this.credentialRepository;
    const credential = repository.create({
      ...data,
      email: (data.email ?? '').toLowerCase().trim()
    });
    return repository.save(credential);
  }

  async findCredentialByEmail(email: string): Promise<AuthCredentialEntity | null> {
    return this.credentialRepository.findOne({
      where: { email: email.toLowerCase().trim() }
    });
  }

  async findCredentialById(id: string): Promise<AuthCredentialEntity | null> {
    return this.credentialRepository.findOne({ where: { id } });
  }

  async createRefreshToken(
    data: Partial<RefreshTokenEntity>,
    manager?: EntityManager
  ): Promise<RefreshTokenEntity> {
    const repository = manager
      ? manager.getRepository(RefreshTokenEntity)
      : this.refreshTokenRepository;
    const entity = repository.create(data);
    return repository.save(entity);
  }

  async listValidTokensForCredential(credentialId: string): Promise<RefreshTokenEntity[]> {
    return this.refreshTokenRepository.find({
      where: { credentialId, revoked: false }
    });
  }

  async listTokensForCredential(credentialId: string): Promise<RefreshTokenEntity[]> {
    return this.refreshTokenRepository.find({
      where: { credentialId }
    });
  }

  async revokeTokenById(id: string): Promise<void> {
    await this.refreshTokenRepository.update({ id }, { revoked: true });
  }

  async revokeAllTokensForCredential(
    credentialId: string,
    manager?: EntityManager
  ): Promise<void> {
    const repository = manager
      ? manager.getRepository(RefreshTokenEntity)
      : this.refreshTokenRepository;
    await repository.update({ credentialId, revoked: false }, { revoked: true });
  }
}
