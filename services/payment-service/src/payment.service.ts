import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import CryptoJS from 'crypto-js';
import { DataSource } from 'typeorm';
import { InitiatePaymentDto } from './dto';
import { PaymentEntity } from './payment.entity';
import { OutboxRepository } from './outbox.repository';
import { OutboxService } from './outbox.service';
import { PaymentRepository } from './payment.repository';
@Injectable()
export class PaymentService {
  constructor(
    private readonly repo: PaymentRepository,
    private readonly outboxRepository: OutboxRepository,
    private readonly outboxService: OutboxService,
    @InjectDataSource() private readonly dataSource: DataSource
  ) {}

  private getSslCommerzBaseUrl(): string {
    return process.env.SSLCOMMERZ_BASE_URL ?? process.env.SSLCZ_BASE_URL ?? '';
  }

  private getSslCommerzStorePassword(): string {
    return process.env.SSLCOMMERZ_STORE_PASSWORD ?? process.env.SSLCZ_STORE_PASSWORD ?? '';
  }

  async initiate(dto: InitiatePaymentDto) {
    const p = await this.repo.create({ outletId: dto.outletId, orderId: dto.orderId, amount: dto.amount, status: 'initiated' });
    return {
      paymentId: p.id,
      gatewayUrl: `${this.getSslCommerzBaseUrl()}/gwprocess/v4/api.php?tran_id=${p.id}`,
      status: p.status
    };
  }
  async success(orderId: string) {
    const p = await this.repo.findByOrder(orderId);
    if (!p) throw new NotFoundException('Payment not found');
    const { updated, outbox } = await this.dataSource.transaction(async (manager) => {
      p.status = 'confirmed';
      p.gatewayTxnId = `SSL-${Date.now()}`;
      const updatedRow = await manager.getRepository(PaymentEntity).save(p);
      const outboxRow = await this.outboxRepository.create(
        {
          outletId: p.outletId,
          eventType: 'PAYMENT_CONFIRMED',
          payload: { paymentId: p.id, orderId: p.orderId, outletId: p.outletId, amount: p.amount }
        },
        manager
      );
      return { updated: updatedRow as typeof p, outbox: outboxRow };
    });
    await this.outboxService.dispatch(outbox);
    return {
      status: 'confirmed',
      paymentId: updated.id,
      outboxId: outbox.id
    };
  }

  verifyIpnSignature(payload: Record<string, unknown>): { valid: boolean } {
    const verifyKey = String(payload.verify_key ?? '');
    const verifySign = String(payload.verify_sign ?? '');
    if (!verifyKey || !verifySign) {
      return { valid: false };
    }
    const storePassword = this.getSslCommerzStorePassword();
    const fields = verifyKey.split(',');
    const body = fields
      .map((k) => `${k}=${String(payload[k] ?? '')}`)
      .join('&')
      .concat(`&store_passwd=${CryptoJS.MD5(storePassword).toString()}`);
    const hash = CryptoJS.MD5(body).toString();
    return { valid: hash === verifySign };
  }
}
