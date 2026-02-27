import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { UserRoleEntity } from '../entities/user-role.entity';
import { UserEntity } from '../entities/user.entity';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(UserEntity) private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(UserRoleEntity) private readonly roleRepository: Repository<UserRoleEntity>
  ) {}

  async createUser(data: Partial<UserEntity>, manager?: EntityManager): Promise<UserEntity> {
    const repo = manager ? manager.getRepository(UserEntity) : this.userRepository;
    return repo.save(repo.create(data));
  }

  async findById(id: string): Promise<UserEntity | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    return this.userRepository.findOne({ where: { email: email.toLowerCase().trim() } });
  }

  async list(outletId?: string): Promise<UserEntity[]> {
    if (!outletId) {
      return this.userRepository.find({ order: { createdAt: 'DESC' } });
    }
    return this.userRepository.find({ where: { outletId }, order: { createdAt: 'DESC' } });
  }

  async updateUser(user: UserEntity): Promise<UserEntity> {
    return this.userRepository.save(user);
  }

  async replaceRoles(
    userId: string,
    outletId: string,
    roles: string[],
    manager?: EntityManager
  ): Promise<void> {
    const repo = manager ? manager.getRepository(UserRoleEntity) : this.roleRepository;
    await repo.delete({ userId });
    if (roles.length === 0) {
      return;
    }
    const entities = roles.map((role) => repo.create({ userId, outletId, role }));
    await repo.save(entities);
  }

  async findRoles(userId: string): Promise<UserRoleEntity[]> {
    return this.roleRepository.find({ where: { userId } });
  }
}

