import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Event } from './event.model';

@Entity('teams')
export class Team {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 200, nullable: true })
  description: string;

  @Column({ length: 200, nullable: true })
  image: string;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => Event, event => event.homeTeam)
  homeEvents: Event[];

  @OneToMany(() => Event, event => event.awayTeam)
  awayEvents: Event[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 