import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { AdjustStockDto } from './dto';
import { OutboxRepository } from './outbox.repository';
import { OutboxService } from './outbox.service';
import { StockEntity } from './stock.entity';
import { StockRepository } from './stock.repository';
@Injectable()
export class StockService {
  constructor(
    private readonly repo: StockRepository,
    private readonly outboxRepository: OutboxRepository,
    private readonly outboxService: OutboxService,
    @InjectDataSource() private readonly dataSource: DataSource
  ) {}
  async adjust(dto: AdjustStockDto): Promise<{ status: string; quantity: string }> {
    const { quantity, outbox } = await this.dataSource.transaction(async (manager) => {
      const stockRepo = manager.getRepository(StockEntity);
      const existing = await stockRepo.findOne({ where: { outletId: dto.outletId, productId: dto.productId } });
      const current = Number(existing?.quantity ?? '0');
      const next = current + Number(dto.delta);
      const entity = existing ?? stockRepo.create({ outletId: dto.outletId, productId: dto.productId, quantity: '0' });
      entity.quantity = next.toFixed(2);
      await stockRepo.save(entity);
      const outbox = await this.outboxRepository.create(
        {
          outletId: dto.outletId,
          eventType: 'STOCK_UPDATED',
          payload: {
            outletId: dto.outletId,
            productId: dto.productId,
            quantity: entity.quantity,
            delta: dto.delta
          }
        },
        manager
      );
      return { quantity: entity.quantity, outbox };
    });
    await this.outboxService.dispatch(outbox);
    return { status: `updated:${outbox.id}`, quantity };
  }
}
