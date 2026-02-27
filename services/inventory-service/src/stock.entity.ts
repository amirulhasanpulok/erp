import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
@Entity('stocks')
export class StockEntity {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ name: 'outlet_id', type: 'uuid' }) outletId!: string;
  @Column({ name: 'product_id', type: 'uuid' }) productId!: string;
  @Column({ type: 'numeric', precision: 14, scale: 2, default: 0 }) quantity!: string;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' }) createdAt!: Date;
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' }) updatedAt!: Date;
}

