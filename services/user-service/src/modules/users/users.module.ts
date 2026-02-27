import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRoleEntity } from './entities/user-role.entity';
import { UserEntity } from './entities/user.entity';
import { JwtAccessGuard } from './auth/jwt-access.guard';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UsersRepository } from './repositories/users.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, UserRoleEntity]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('JWT_ACCESS_SECRET')
      })
    })
  ],
  controllers: [UsersController],
  providers: [UsersService, UsersRepository, JwtAccessGuard]
})
export class UsersModule {}
