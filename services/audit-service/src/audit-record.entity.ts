import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('audit_records')
export class AuditRecordEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'outlet_id', type: 'uuid', nullable: true })
  outletId?: string | null;

  @Column({ name: 'actor_id', type: 'uuid', nullable: true })
  actorId?: string | null;

  @Column({ name: 'source', type: 'varchar', length: 80 })
  source!: string;

  @Column({ name: 'event_type', type: 'varchar', length: 120 })
  eventType!: string;

  @Column({ name: 'payload', type: 'jsonb' })
  payload!: Record<string, unknown>;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}

