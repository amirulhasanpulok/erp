import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { CreateSaleDto } from './dto';
import { OutboxRepository } from './outbox.repository';
import { OutboxService } from './outbox.service';
import { SaleEntity } from './sale.entity';
import { SalesRepository } from './sales.repository';
@Injectable()
export class SalesService {
  constructor(
    private readonly repo: SalesRepository,
    private readonly outboxRepository: OutboxRepository,
    private readonly outboxService: OutboxService,
    @InjectDataSource() private readonly dataSource: DataSource
  ) {}
  async create(dto: CreateSaleDto) {
    const invoiceNo = `INV-${Date.now()}`;
    const { sale, outbox } = await this.dataSource.transaction(async (manager) => {
      const saleRow = await manager.getRepository(SaleEntity).save(
        manager.getRepository(SaleEntity).create({
          outletId: dto.outletId,
          productId: dto.productId,
          quantity: dto.quantity,
          total: dto.total,
          paymentMethod: dto.paymentMethod,
          invoiceNo
        })
      );
      const outboxRow = await this.outboxRepository.create(
        {
          outletId: dto.outletId,
          eventType: 'SALE_CREATED',
          payload: {
            saleId: saleRow.id,
            outletId: dto.outletId,
            productId: dto.productId,
            quantity: dto.quantity,
            total: dto.total
          }
        },
        manager
      );
      return { sale: saleRow, outbox: outboxRow };
    });
    await this.outboxService.dispatch(outbox);
    return {
      ...sale,
      outboxId: outbox.id
    };
  }
  list(outletId?: string) { return this.repo.list(outletId); }
}
