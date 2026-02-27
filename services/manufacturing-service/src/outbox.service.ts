import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { EventsPublisher } from './events/events.publisher';
import { OutboxEventEntity } from './outbox.entity';
import { OutboxRepository } from './outbox.repository';
@Injectable()
export class OutboxService implements OnModuleInit, OnModuleDestroy {
  private timer?: NodeJS.Timeout;
  constructor(private readonly publisher: EventsPublisher, private readonly repo: OutboxRepository) {}
  async dispatch(outbox: OutboxEventEntity): Promise<void> {
    this.publisher.publish(outbox.eventType, 'manufacturing-service', outbox.payload);
    await this.repo.markPublished(outbox.id);
  }

  onModuleInit(): void {
    this.timer = setInterval(() => {
      void this.republishPending();
    }, 10000);
  }

  onModuleDestroy(): void {
    if (this.timer) clearInterval(this.timer);
  }

  private async republishPending(): Promise<void> {
    const pending = await this.repo.listPending(100);
    for (const row of pending) {
      await this.dispatch(row);
    }
  }
}
