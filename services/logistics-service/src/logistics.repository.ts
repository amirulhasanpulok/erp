import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ShipmentEntity } from './shipment.entity';
@Injectable()
export class LogisticsRepository {
  constructor(@InjectRepository(ShipmentEntity) private readonly repo: Repository<ShipmentEntity>) {}
  create(data: Partial<ShipmentEntity>): Promise<ShipmentEntity> { return this.repo.save(this.repo.create(data)); }
  findByOrder(orderId: string): Promise<ShipmentEntity | null> { return this.repo.findOne({ where: { orderId } }); }
  findByTrackingId(trackingId: string): Promise<ShipmentEntity | null> { return this.repo.findOne({ where: { trackingId } }); }
  save(e: ShipmentEntity): Promise<ShipmentEntity> { return this.repo.save(e); }
}
