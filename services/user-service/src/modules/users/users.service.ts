import {
  ConflictException,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserEntity } from './entities/user.entity';
import { UsersRepository } from './repositories/users.repository';

@Injectable()
export class UsersService {
  constructor(
    private readonly repository: UsersRepository,
    @InjectDataSource() private readonly dataSource: DataSource
  ) {}

  async create(dto: CreateUserDto): Promise<Record<string, unknown>> {
    const existing = await this.repository.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Email already in use');
    }

    const created = await this.dataSource.transaction(async (manager) => {
      const user = await this.repository.createUser(
        {
          outletId: dto.outletId,
          fullName: dto.fullName,
          email: dto.email,
          phone: dto.phone ?? null,
          isActive: true
        },
        manager
      );
      await this.repository.replaceRoles(user.id, user.outletId, dto.roles, manager);
      return user;
    });

    const roles = await this.repository.findRoles(created.id);

    return this.toResponse(created, roles.map((r) => r.role));
  }

  async list(outletId?: string): Promise<Record<string, unknown>[]> {
    const users = await this.repository.list(outletId);
    const output: Record<string, unknown>[] = [];
    for (const user of users) {
      const roles = await this.repository.findRoles(user.id);
      output.push(this.toResponse(user, roles.map((r) => r.role)));
    }
    return output;
  }

  async getById(id: string): Promise<Record<string, unknown>> {
    const user = await this.repository.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const roles = await this.repository.findRoles(user.id);
    return this.toResponse(user, roles.map((r) => r.role));
  }

  async update(id: string, dto: UpdateUserDto): Promise<Record<string, unknown>> {
    const user = await this.repository.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (dto.email && dto.email.toLowerCase().trim() !== user.email.toLowerCase().trim()) {
      const conflict = await this.repository.findByEmail(dto.email);
      if (conflict) {
        throw new ConflictException('Email already in use');
      }
    }

    if (dto.fullName !== undefined) user.fullName = dto.fullName;
    if (dto.email !== undefined) user.email = dto.email;
    if (dto.phone !== undefined) user.phone = dto.phone;
    const saved = await this.repository.updateUser(user);

    if (dto.roles) {
      await this.repository.replaceRoles(saved.id, saved.outletId, dto.roles);
    }
    const roles = await this.repository.findRoles(saved.id);

    return this.toResponse(saved, roles.map((r) => r.role));
  }

  async deactivate(id: string): Promise<{ status: string }> {
    const user = await this.repository.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    user.isActive = false;
    await this.repository.updateUser(user);

    return { status: 'deactivated' };
  }

  private toResponse(user: UserEntity, roles: string[]): Record<string, unknown> {
    return {
      id: user.id,
      outletId: user.outletId,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      isActive: user.isActive,
      roles,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
  }
}
