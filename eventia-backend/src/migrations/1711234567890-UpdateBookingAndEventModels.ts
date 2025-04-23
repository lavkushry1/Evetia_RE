import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateBookingAndEventModels1711234567890 implements MigrationInterface {
    name = 'UpdateBookingAndEventModels1711234567890'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add seats column to bookings table
        await queryRunner.query(`ALTER TABLE "bookings" ADD "seats" text NOT NULL DEFAULT ''`);
        
        // Update bookedSeats column in events table
        await queryRunner.query(`ALTER TABLE "events" DROP COLUMN "bookedSeats"`);
        await queryRunner.query(`ALTER TABLE "events" ADD "bookedSeats" text NOT NULL DEFAULT ''`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove seats column from bookings table
        await queryRunner.query(`ALTER TABLE "bookings" DROP COLUMN "seats"`);
        
        // Revert bookedSeats column in events table
        await queryRunner.query(`ALTER TABLE "events" DROP COLUMN "bookedSeats"`);
        await queryRunner.query(`ALTER TABLE "events" ADD "bookedSeats" integer NOT NULL DEFAULT '0'`);
    }
} 