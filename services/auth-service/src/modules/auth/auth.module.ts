import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAccessGuard } from './guards/jwt-access.guard';
import { AuthRepository } from './repositories/auth.repository';
import { AuthCredentialEntity } from './entities/auth-credential.entity';
import { RefreshTokenEntity } from './entities/refresh-token.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([AuthCredentialEntity, RefreshTokenEntity]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('JWT_ACCESS_SECRET')
      })
    })
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthRepository, JwtAccessGuard]
})
export class AuthModule {}

