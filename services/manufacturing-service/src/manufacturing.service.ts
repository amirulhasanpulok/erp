import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { CompleteManufactureDto } from './dto';
import { ManufacturingEntity } from './manufacturing.entity';
import { ManufacturingRepository } from './manufacturing.repository';
import { OutboxRepository } from './outbox.repository';
import { OutboxService } from './outbox.service';
@Injectable()
export class ManufacturingService {
  constructor(
    private readonly repo: ManufacturingRepository,
    private readonly outboxRepository: OutboxRepository,
    private readonly outboxService: OutboxService,
    @InjectDataSource() private readonly dataSource: DataSource
  ) {}
  async complete(dto: CompleteManufactureDto) {
    const { job, outbox } = await this.dataSource.transaction(async (manager) => {
      const jobRow = await manager.getRepository(ManufacturingEntity).save(
        manager.getRepository(ManufacturingEntity).create({ ...dto, status: 'completed' })
      );
      const outboxRow = await this.outboxRepository.create(
        {
          outletId: jobRow.outletId,
          eventType: 'MANUFACTURE_COMPLETED',
          payload: {
            manufactureId: jobRow.id,
            outletId: jobRow.outletId,
            productId: jobRow.productId,
            quantity: jobRow.quantity
          }
        },
        manager
      );
      return { job: jobRow, outbox: outboxRow };
    });
    await this.outboxService.dispatch(outbox);
    return {
      ...job,
      outboxId: outbox.id
    };
  }
  list(outletId?: string) { return this.repo.list(outletId); }
}
