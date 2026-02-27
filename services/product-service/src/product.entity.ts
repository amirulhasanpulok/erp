import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
@Entity('products')
export class ProductEntity {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ name: 'outlet_id', type: 'uuid' }) outletId!: string;
  @Column({ type: 'varchar', length: 60, unique: true }) sku!: string;
  @Column({ type: 'varchar', length: 60, unique: true }) barcode!: string;
  @Column({ type: 'varchar', length: 200 }) name!: string;
  @Column({ type: 'boolean', default: true }) active!: boolean;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' }) createdAt!: Date;
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' }) updatedAt!: Date;
}

