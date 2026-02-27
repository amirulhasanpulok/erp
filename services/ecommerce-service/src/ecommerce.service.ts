import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { PlaceOrderDto } from './dto';
import { EcommerceRepository } from './ecommerce.repository';
import { EcommerceOrderEntity } from './order.entity';
import { OutboxRepository } from './outbox.repository';
import { OutboxService } from './outbox.service';
@Injectable()
export class EcommerceService {
  constructor(
    private readonly repo: EcommerceRepository,
    private readonly outboxRepository: OutboxRepository,
    private readonly outboxService: OutboxService,
    @InjectDataSource() private readonly dataSource: DataSource
  ) {}
  async place(dto: PlaceOrderDto) {
    const { order, outbox } = await this.dataSource.transaction(async (manager) => {
      const orderRow = await manager.getRepository(EcommerceOrderEntity).save(
        manager.getRepository(EcommerceOrderEntity).create({ ...dto, status: 'pending' })
      );
      const outboxRow = await this.outboxRepository.create(
        {
          outletId: orderRow.outletId,
          eventType: 'ECOM_ORDER_PLACED',
          payload: {
            orderId: orderRow.id,
            outletId: orderRow.outletId,
            productId: orderRow.productId,
            quantity: orderRow.quantity,
            total: orderRow.total
          }
        },
        manager
      );
      return { order: orderRow, outbox: outboxRow };
    });
    await this.outboxService.dispatch(outbox);
    let paymentRedirectUrl: string | null = null;
    try {
      const paymentServiceUrl = process.env.PAYMENT_SERVICE_URL ?? 'http://payment-service:3015';
      const response = await fetch(`${paymentServiceUrl}/api/v1/payments/initiate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-internal-key': process.env.INTERNAL_SERVICE_KEY ?? ''
        },
        body: JSON.stringify({
          outletId: order.outletId,
          orderId: order.id,
          amount: order.total,
          customerName: dto.customerName,
          customerPhone: dto.customerPhone
        })
      });
      if (response.ok) {
        const payload = (await response.json()) as { gatewayUrl?: string };
        paymentRedirectUrl = payload.gatewayUrl ?? null;
      }
    } catch {
      paymentRedirectUrl = null;
    }
    return {
      ...order,
      outboxId: outbox.id,
      paymentRedirectUrl
    };
  }
  list(outletId?: string) { return this.repo.list(outletId); }
  async tracking(orderId: string) {
    const order = await this.repo.findById(orderId);
    if (!order) throw new NotFoundException('Order not found');
    return {
      orderId: order.id,
      outletId: order.outletId,
      status: order.status,
      total: order.total,
      updatedAt: order.updatedAt
    };
  }
}
