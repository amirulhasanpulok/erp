import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm';

@Index('idx_sales_outlet_id', ['outletId'])
@Index('idx_sales_product_id', ['productId'])
@Index('idx_sales_created_at', ['createdAt'])
@Index('idx_sales_status', ['status'])
@Index('idx_sales_branch_id', ['branchId'])
@Index('idx_sales_customer_id', ['customerId'])
@Entity('sales')
export class SaleEntity {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ name: 'outlet_id', type: 'uuid' }) outletId!: string;
  @Column({ name: 'product_id', type: 'uuid' }) productId!: string;
  @Column({ name: 'branch_id', type: 'uuid', nullable: true }) branchId!: string | null;
  @Column({ name: 'customer_id', type: 'uuid', nullable: true }) customerId!: string | null;
  @Column({ type: 'varchar', length: 40, default: 'completed' }) status!: string;
  @Column({ type: 'numeric', precision: 14, scale: 2 }) quantity!: string;
  @Column({ name: 'invoice_no', type: 'varchar', length: 80 }) invoiceNo!: string;
  @Column({ type: 'numeric', precision: 14, scale: 2 }) total!: string;
  @Column({ name: 'payment_method', type: 'varchar', length: 40 }) paymentMethod!: string;
  @Column({ name: 'created_by', type: 'uuid', nullable: true }) createdBy!: string | null;
  @Column({ name: 'updated_by', type: 'uuid', nullable: true }) updatedBy!: string | null;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' }) createdAt!: Date;
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' }) updatedAt!: Date;
  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true }) deletedAt!: Date | null;
}
