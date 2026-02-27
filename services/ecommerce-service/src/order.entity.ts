import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
@Entity('ecom_orders')
export class EcommerceOrderEntity {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ name: 'outlet_id', type: 'uuid' }) outletId!: string;
  @Column({ name: 'product_id', type: 'uuid' }) productId!: string;
  @Column({ type: 'numeric', precision: 14, scale: 2 }) quantity!: string;
  @Column({ name: 'customer_name', type: 'varchar', length: 140 }) customerName!: string;
  @Column({ name: 'customer_phone', type: 'varchar', length: 40 }) customerPhone!: string;
  @Column({ type: 'numeric', precision: 14, scale: 2 }) total!: string;
  @Column({ type: 'varchar', length: 40, default: 'pending' }) status!: string;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' }) createdAt!: Date;
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' }) updatedAt!: Date;
}
