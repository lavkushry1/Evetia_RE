import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('discounts')
export class Discount {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  code: string;

  @Column()
  amount: number;

  @Column({ nullable: true })
  description: string;

  @Column({ default: 100 })
  maxUses: number;

  @Column({ default: 0 })
  usesCount: number;

  @Column({ type: 'timestamp with time zone', nullable: true })
  expiryDate: Date;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @Column({ default: true })
  isActive: boolean;

  isExpired(): boolean {
    if (!this.isActive) return true;
    if (this.usesCount >= this.maxUses) return true;
    if (this.expiryDate && new Date() > this.expiryDate) return true;
    return false;
  }

  isValid(): boolean {
    return !this.isExpired();
  }

  applyDiscount(amount: number): number {
    if (!this.isValid()) return amount;
    return Math.max(0, amount - this.amount);
  }
} 