import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
@Entity('purchase_receipts')
export class PurchaseEntity {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ name: 'outlet_id', type: 'uuid' }) outletId!: string;
  @Column({ name: 'product_id', type: 'uuid' }) productId!: string;
  @Column({ type: 'numeric', precision: 14, scale: 2 }) quantity!: string;
  @Column({ name: 'supplier_name', type: 'varchar', length: 150 }) supplierName!: string;
  @Column({ type: 'numeric', precision: 14, scale: 2 }) total!: string;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' }) createdAt!: Date;
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' }) updatedAt!: Date;
}
