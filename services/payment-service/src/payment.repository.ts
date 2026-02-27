import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentEntity } from './payment.entity';
@Injectable()
export class PaymentRepository {
  constructor(@InjectRepository(PaymentEntity) private readonly repo: Repository<PaymentEntity>) {}
  create(data: Partial<PaymentEntity>): Promise<PaymentEntity> { return this.repo.save(this.repo.create(data)); }
  findByOrder(orderId: string): Promise<PaymentEntity | null> { return this.repo.findOne({ where: { orderId } }); }
  save(p: PaymentEntity): Promise<PaymentEntity> { return this.repo.save(p); }
}

