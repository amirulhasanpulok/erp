import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { ReceivePurchaseDto } from './dto';
import { OutboxRepository } from './outbox.repository';
import { OutboxService } from './outbox.service';
import { PurchaseEntity } from './purchase.entity';
import { PurchaseRepository } from './purchase.repository';
@Injectable()
export class PurchaseService {
  constructor(
    private readonly repo: PurchaseRepository,
    private readonly outboxRepository: OutboxRepository,
    private readonly outboxService: OutboxService,
    @InjectDataSource() private readonly dataSource: DataSource
  ) {}
  async receive(dto: ReceivePurchaseDto) {
    const { receipt, outbox } = await this.dataSource.transaction(async (manager) => {
      const receiptRow = await manager.getRepository(PurchaseEntity).save(manager.getRepository(PurchaseEntity).create(dto));
      const outboxRow = await this.outboxRepository.create(
        {
          outletId: dto.outletId,
          eventType: 'PURCHASE_RECEIVED',
          payload: {
            purchaseId: receiptRow.id,
            outletId: receiptRow.outletId,
            productId: receiptRow.productId,
            quantity: receiptRow.quantity,
            total: receiptRow.total
          }
        },
        manager
      );
      return { receipt: receiptRow, outbox: outboxRow };
    });
    await this.outboxService.dispatch(outbox);
    return {
      ...receipt,
      outboxId: outbox.id
    };
  }
  list(outletId?: string) { return this.repo.list(outletId); }
}
