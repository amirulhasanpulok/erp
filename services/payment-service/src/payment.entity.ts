import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
@Entity('payments')
export class PaymentEntity {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ name: 'outlet_id', type: 'uuid' }) outletId!: string;
  @Column({ name: 'order_id', type: 'uuid' }) orderId!: string;
  @Column({ type: 'numeric', precision: 14, scale: 2 }) amount!: string;
  @Column({ type: 'varchar', length: 40, default: 'initiated' }) status!: string;
  @Column({ name: 'gateway_txn_id', type: 'varchar', length: 120, nullable: true }) gatewayTxnId?: string | null;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' }) createdAt!: Date;
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' }) updatedAt!: Date;
}

