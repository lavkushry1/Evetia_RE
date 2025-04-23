import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateAdminAndDiscountTables1711234567891 implements MigrationInterface {
    name = 'CreateAdminAndDiscountTables1711234567891'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create admins table
        await queryRunner.query(`
            CREATE TABLE public.admins (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
            );
        `);

        // Create discounts table
        await queryRunner.query(`
            CREATE TABLE public.discounts (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                code TEXT UNIQUE NOT NULL,
                amount INTEGER NOT NULL,
                description TEXT,
                max_uses INTEGER NOT NULL DEFAULT 100,
                uses_count INTEGER NOT NULL DEFAULT 0,
                expiry_date TIMESTAMP WITH TIME ZONE,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
                is_active BOOLEAN DEFAULT true NOT NULL
            );
        `);

        // Insert default admin user
        await queryRunner.query(`
            INSERT INTO public.admins (email, password_hash) 
            VALUES ('admin@example.com', '$2a$10$uSaK.nlYhVoEPJHYGZXGZu0otrVh/AXm0EAz4QLJX6BBCjVuD/QXC');
        `);

        // Enable Row Level Security
        await queryRunner.query(`
            ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
            ALTER TABLE public.discounts ENABLE ROW LEVEL SECURITY;
        `);

        // Create policies
        await queryRunner.query(`
            CREATE POLICY "Only authenticated users can view admins" 
            ON public.admins 
            FOR SELECT 
            USING (auth.role() = 'authenticated');

            CREATE POLICY "Anyone can view active discounts" 
            ON public.discounts 
            FOR SELECT 
            USING (is_active = true);

            CREATE POLICY "Only authenticated users can manage discounts" 
            ON public.discounts 
            FOR ALL 
            USING (auth.role() = 'authenticated');
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop policies
        await queryRunner.query(`
            DROP POLICY IF EXISTS "Only authenticated users can view admins" ON public.admins;
            DROP POLICY IF EXISTS "Anyone can view active discounts" ON public.discounts;
            DROP POLICY IF EXISTS "Only authenticated users can manage discounts" ON public.discounts;
        `);

        // Drop tables
        await queryRunner.query(`
            DROP TABLE IF EXISTS public.discounts;
            DROP TABLE IF EXISTS public.admins;
        `);
    }
} 