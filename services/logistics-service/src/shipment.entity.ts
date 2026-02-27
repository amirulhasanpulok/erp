import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
@Entity('shipments')
export class ShipmentEntity {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ name: 'outlet_id', type: 'uuid' }) outletId!: string;
  @Column({ name: 'order_id', type: 'uuid' }) orderId!: string;
  @Column({ type: 'varchar', length: 30 }) provider!: string;
  @Column({ name: 'tracking_id', type: 'varchar', length: 120, nullable: true }) trackingId?: string | null;
  @Column({ type: 'varchar', length: 30, default: 'created' }) status!: string;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' }) createdAt!: Date;
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' }) updatedAt!: Date;
}

