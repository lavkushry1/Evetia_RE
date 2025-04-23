import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Team } from './team.model';
import { Stadium } from './stadium.model';
import { Booking } from './booking.model';

@Entity('events')
export class Event {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ type: 'timestamp' })
  date: Date;

  @Column({ length: 200, nullable: true })
  description: string;

  @Column({ length: 200, nullable: true })
  image: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column()
  capacity: number;

  @Column('simple-array', { default: [] })
  bookedSeats: string[];

  @Column({ default: true })
  isActive: boolean;

  @ManyToOne(() => Team, team => team.homeEvents)
  @JoinColumn({ name: 'homeTeamId' })
  homeTeam: Team;

  @Column()
  homeTeamId: string;

  @ManyToOne(() => Team, team => team.awayEvents)
  @JoinColumn({ name: 'awayTeamId' })
  awayTeam: Team;

  @Column()
  awayTeamId: string;

  @ManyToOne(() => Stadium, stadium => stadium.events)
  @JoinColumn({ name: 'stadiumId' })
  stadium: Stadium;

  @Column()
  stadiumId: string;

  @OneToMany(() => Booking, booking => booking.event)
  bookings: Booking[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 