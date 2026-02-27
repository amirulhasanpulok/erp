import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('outbox_events')
export class OutboxEventEntity {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ name: 'outlet_id', type: 'uuid' }) outletId!: string;
  @Column({ name: 'event_type', type: 'varchar', length: 80 }) eventType!: string;
  @Column({ type: 'jsonb' }) payload!: Record<string, unknown>;
  @Column({ type: 'varchar', length: 20, default: 'pending' }) status!: string;
  @Column({ name: 'published_at', type: 'timestamptz', nullable: true }) publishedAt?: Date | null;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' }) createdAt!: Date;
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' }) updatedAt!: Date;
}

