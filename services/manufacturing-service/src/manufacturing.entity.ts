import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
@Entity('manufacturing_jobs')
export class ManufacturingEntity {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ name: 'outlet_id', type: 'uuid' }) outletId!: string;
  @Column({ name: 'product_id', type: 'uuid' }) productId!: string;
  @Column({ type: 'numeric', precision: 14, scale: 2 }) quantity!: string;
  @Column({ type: 'varchar', length: 30, default: 'completed' }) status!: string;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' }) createdAt!: Date;
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' }) updatedAt!: Date;
}

