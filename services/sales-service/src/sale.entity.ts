import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
@Entity('sales')
export class SaleEntity {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ name: 'outlet_id', type: 'uuid' }) outletId!: string;
  @Column({ name: 'product_id', type: 'uuid' }) productId!: string;
  @Column({ type: 'numeric', precision: 14, scale: 2 }) quantity!: string;
  @Column({ name: 'invoice_no', type: 'varchar', length: 80 }) invoiceNo!: string;
  @Column({ type: 'numeric', precision: 14, scale: 2 }) total!: string;
  @Column({ name: 'payment_method', type: 'varchar', length: 40 }) paymentMethod!: string;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' }) createdAt!: Date;
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' }) updatedAt!: Date;
}
