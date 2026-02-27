import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('report_metrics')
export class ReportMetricEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'outlet_id', type: 'uuid' })
  outletId!: string;

  @Column({ name: 'event_type', type: 'varchar', length: 80 })
  eventType!: string;

  @Column({ type: 'integer', default: 0 })
  count!: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}

