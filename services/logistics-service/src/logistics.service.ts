import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { CreateShipmentDto, DeliveryWebhookDto } from './dto';
import { LogisticsRepository } from './logistics.repository';
import { OutboxRepository } from './outbox.repository';
import { OutboxService } from './outbox.service';
import { ShipmentEntity } from './shipment.entity';
@Injectable()
export class LogisticsService {
  constructor(
    private readonly repo: LogisticsRepository,
    private readonly outboxRepository: OutboxRepository,
    private readonly outboxService: OutboxService,
    @InjectDataSource() private readonly dataSource: DataSource
  ) {}
  async create(dto: CreateShipmentDto) {
    const trackingId = await this.createProviderShipment(dto.provider, dto.orderId);
    const { shipment, outbox } = await this.dataSource.transaction(async (manager) => {
      const shipmentRow = await manager.getRepository(ShipmentEntity).save(
        manager.getRepository(ShipmentEntity).create({ ...dto, trackingId, status: 'created' })
      );
      const outboxRow = await this.outboxRepository.create(
        {
          outletId: shipmentRow.outletId,
          eventType: 'SHIPMENT_CREATED',
          payload: {
            shipmentId: shipmentRow.id,
            outletId: shipmentRow.outletId,
            orderId: shipmentRow.orderId,
            trackingId: shipmentRow.trackingId
          }
        },
        manager
      );
      return { shipment: shipmentRow, outbox: outboxRow };
    });
    await this.outboxService.dispatch(outbox);
    return {
      ...shipment,
      outboxId: outbox.id
    };
  }
  async cancel(orderId: string) {
    const s = await this.repo.findByOrder(orderId);
    if (!s) throw new NotFoundException('Shipment not found');
    await this.cancelProviderShipment(s.provider, s.trackingId ?? '');
    s.status = 'cancelled';
    await this.repo.save(s);
    return { status: 'cancelled', orderId };
  }
  async webhook(dto: DeliveryWebhookDto) {
    const s = await this.repo.findByOrder(dto.orderId);
    if (!s) throw new NotFoundException('Shipment not found');
    const outbox = await this.dataSource.transaction(async (manager) => {
      s.status = dto.status;
      s.trackingId = dto.trackingId;
      await manager.getRepository(ShipmentEntity).save(s);
      return this.outboxRepository.create(
        {
          outletId: s.outletId,
          eventType: 'DELIVERY_STATUS_UPDATED',
          payload: {
            shipmentId: s.id,
            orderId: s.orderId,
            status: s.status,
            trackingId: s.trackingId,
            outletId: s.outletId
          }
        },
        manager
      );
    });
    await this.outboxService.dispatch(outbox);
    return {
      status: 'updated',
      outboxId: outbox.id
    };
  }

  async tracking(trackingId: string): Promise<{ trackingId: string; status: string; provider: string }> {
    const s = await this.repo.findByTrackingId(trackingId);
    if (!s) throw new NotFoundException('Tracking not found');
    return { trackingId: s.trackingId ?? trackingId, status: s.status, provider: s.provider };
  }

  private async createProviderShipment(provider: string, orderId: string): Promise<string> {
    try {
      if (provider === 'pathao') {
        const url = `${process.env.PATHAO_BASE_URL ?? ''}/aladdin/api/v1/orders`;
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CLIENT-ID': process.env.PATHAO_CLIENT_ID ?? '',
            'X-CLIENT-SECRET': process.env.PATHAO_CLIENT_SECRET ?? ''
          },
          body: JSON.stringify({ merchant_order_id: orderId })
        });
        if (response.ok) {
          const payload = (await response.json()) as { data?: { consignment_id?: string } };
          if (payload.data?.consignment_id) return payload.data.consignment_id;
        }
      }
      if (provider === 'steadfast') {
        const url = `${process.env.STEADFAST_BASE_URL ?? ''}/create_order`;
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Api-Key': process.env.STEADFAST_API_KEY ?? '',
            'Secret-Key': process.env.STEADFAST_SECRET ?? ''
          },
          body: JSON.stringify({ invoice: orderId })
        });
        if (response.ok) {
          const payload = (await response.json()) as { consignment?: { tracking_code?: string } };
          if (payload.consignment?.tracking_code) return payload.consignment.tracking_code;
        }
      }
    } catch {
      return `${provider.toUpperCase()}-${Date.now()}`;
    }
    return `${provider.toUpperCase()}-${Date.now()}`;
  }

  private async cancelProviderShipment(provider: string, trackingId: string): Promise<void> {
    if (!trackingId) return;
    try {
      if (provider === 'pathao') {
        const url = `${process.env.PATHAO_BASE_URL ?? ''}/aladdin/api/v1/orders/cancel`;
        await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CLIENT-ID': process.env.PATHAO_CLIENT_ID ?? '',
            'X-CLIENT-SECRET': process.env.PATHAO_CLIENT_SECRET ?? ''
          },
          body: JSON.stringify({ consignment_id: trackingId })
        });
      }
      if (provider === 'steadfast') {
        const url = `${process.env.STEADFAST_BASE_URL ?? ''}/cancel_order`;
        await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Api-Key': process.env.STEADFAST_API_KEY ?? '',
            'Secret-Key': process.env.STEADFAST_SECRET ?? ''
          },
          body: JSON.stringify({ tracking_code: trackingId })
        });
      }
    } catch {
      return;
    }
  }
}
