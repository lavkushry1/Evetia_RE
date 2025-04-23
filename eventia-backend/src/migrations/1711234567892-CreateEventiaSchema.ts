import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateEventiaSchema1711234567892 implements MigrationInterface {
    name = 'CreateEventiaSchema1711234567892'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create bookings table
        await queryRunner.query(`
            CREATE TABLE public.bookings (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID NOT NULL,
                event_id UUID NOT NULL,
                seats JSONB NOT NULL,
                total_amount INTEGER NOT NULL,
                discount_applied INTEGER,
                final_amount INTEGER NOT NULL,
                booking_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                status TEXT NOT NULL CHECK (status IN ('pending', 'confirmed', 'cancelled')),
                payment_id UUID,
                created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
            );
        `);

        // Create delivery_details table
        await queryRunner.query(`
            CREATE TABLE public.delivery_details (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
                name TEXT NOT NULL,
                phone TEXT NOT NULL,
                address TEXT NOT NULL,
                city TEXT NOT NULL,
                pincode TEXT NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
            );
        `);

        // Create events table
        await queryRunner.query(`
            CREATE TABLE public.events (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                title TEXT NOT NULL,
                description TEXT NOT NULL,
                start_date TIMESTAMP WITH TIME ZONE NOT NULL,
                end_date TIMESTAMP WITH TIME ZONE NOT NULL,
                location TEXT NOT NULL,
                venue_id UUID,
                image_url TEXT,
                price_range TEXT,
                categories TEXT[],
                seats_available INTEGER NOT NULL,
                total_seats INTEGER NOT NULL,
                is_featured BOOLEAN NOT NULL DEFAULT false,
                is_active BOOLEAN NOT NULL DEFAULT true,
                created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
            );
        `);

        // Create booking_payments table
        await queryRunner.query(`
            CREATE TABLE public.booking_payments (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
                amount INTEGER NOT NULL,
                utr_number TEXT,
                payment_date TIMESTAMP WITH TIME ZONE,
                status TEXT NOT NULL CHECK (status IN ('pending', 'verified', 'rejected', 'refunded')),
                verified_by UUID,
                created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
            );
        `);

        // Create upi_settings table
        await queryRunner.query(`
            CREATE TABLE public.upi_settings (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                upiVPA TEXT NOT NULL,
                discountAmount INTEGER NOT NULL DEFAULT 0,
                isActive BOOLEAN NOT NULL DEFAULT true,
                created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
            );
        `);

        // Create stadiums table
        await queryRunner.query(`
            CREATE TABLE public.stadiums (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                name TEXT NOT NULL,
                location TEXT NOT NULL,
                capacity INTEGER NOT NULL,
                description TEXT,
                image_url TEXT,
                ar_model_url TEXT,
                created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
            );
        `);

        // Create seats table
        await queryRunner.query(`
            CREATE TABLE public.seats (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                stadium_id UUID NOT NULL REFERENCES public.stadiums(id) ON DELETE CASCADE,
                section TEXT NOT NULL,
                row TEXT NOT NULL,
                number TEXT NOT NULL,
                price INTEGER NOT NULL,
                category TEXT NOT NULL CHECK (category IN ('general', 'premium', 'vip')),
                is_available BOOLEAN NOT NULL DEFAULT true,
                created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
            );
        `);

        // Create teams table
        await queryRunner.query(`
            CREATE TABLE public.teams (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                name TEXT NOT NULL,
                short_name TEXT NOT NULL,
                logo_url TEXT,
                description TEXT,
                created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
            );
        `);

        // Enable Row Level Security
        await queryRunner.query(`
            ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
            ALTER TABLE public.delivery_details ENABLE ROW LEVEL SECURITY;
            ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
            ALTER TABLE public.booking_payments ENABLE ROW LEVEL SECURITY;
            ALTER TABLE public.upi_settings ENABLE ROW LEVEL SECURITY;
            ALTER TABLE public.stadiums ENABLE ROW LEVEL SECURITY;
            ALTER TABLE public.seats ENABLE ROW LEVEL SECURITY;
            ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
        `);

        // Create policies for bookings
        await queryRunner.query(`
            CREATE POLICY "Users can view their own bookings" 
            ON public.bookings 
            FOR SELECT 
            USING (user_id = auth.uid());

            CREATE POLICY "Users can create their own bookings" 
            ON public.bookings 
            FOR INSERT 
            WITH CHECK (user_id = auth.uid());
        `);

        // Create policies for delivery details
        await queryRunner.query(`
            CREATE POLICY "Users can view their own delivery details" 
            ON public.delivery_details 
            FOR SELECT 
            USING (booking_id IN (SELECT id FROM public.bookings WHERE user_id = auth.uid()));

            CREATE POLICY "Users can create their own delivery details" 
            ON public.delivery_details 
            FOR INSERT 
            WITH CHECK (booking_id IN (SELECT id FROM public.bookings WHERE user_id = auth.uid()));
        `);

        // Create public access policy for events
        await queryRunner.query(`
            CREATE POLICY "Public can view active events" 
            ON public.events 
            FOR SELECT 
            USING (is_active = true);
        `);

        // Create policy for booking payments
        await queryRunner.query(`
            CREATE POLICY "Users can view their own payments" 
            ON public.booking_payments 
            FOR SELECT 
            USING (booking_id IN (SELECT id FROM public.bookings WHERE user_id = auth.uid()));

            CREATE POLICY "Users can create their own payments" 
            ON public.booking_payments 
            FOR INSERT 
            WITH CHECK (booking_id IN (SELECT id FROM public.bookings WHERE user_id = auth.uid()));
        `);

        // Create policy for UPI settings
        await queryRunner.query(`
            CREATE POLICY "Anyone can view active UPI settings" 
            ON public.upi_settings 
            FOR SELECT 
            USING (isActive = true);
        `);

        // Create public access policy for stadiums
        await queryRunner.query(`
            CREATE POLICY "Public can view stadiums" 
            ON public.stadiums 
            FOR SELECT 
            USING (true);
        `);

        // Create public access policy for seats
        await queryRunner.query(`
            CREATE POLICY "Public can view seats" 
            ON public.seats 
            FOR SELECT 
            USING (true);
        `);

        // Create public access policy for teams
        await queryRunner.query(`
            CREATE POLICY "Public can view teams" 
            ON public.teams 
            FOR SELECT 
            USING (true);
        `);

        // Insert default UPI settings
        await queryRunner.query(`
            INSERT INTO public.upi_settings (upiVPA, discountAmount, isActive)
            VALUES ('eventia@okicici', 0, true);
        `);

        // Insert sample stadium data
        await queryRunner.query(`
            INSERT INTO public.stadiums (name, location, capacity, description)
            VALUES ('Wankhede Stadium', 'Mumbai, India', 33000, 'Iconic cricket stadium in the heart of Mumbai');
        `);

        // Insert sample teams
        await queryRunner.query(`
            INSERT INTO public.teams (name, short_name, description)
            VALUES 
                ('Mumbai Indians', 'MI', 'Five-time IPL champions based in Mumbai'),
                ('Chennai Super Kings', 'CSK', 'Four-time IPL champions based in Chennai'),
                ('Royal Challengers Bangalore', 'RCB', 'Popular team based in Bangalore');
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop policies
        await queryRunner.query(`
            DROP POLICY IF EXISTS "Users can view their own bookings" ON public.bookings;
            DROP POLICY IF EXISTS "Users can create their own bookings" ON public.bookings;
            DROP POLICY IF EXISTS "Users can view their own delivery details" ON public.delivery_details;
            DROP POLICY IF EXISTS "Users can create their own delivery details" ON public.delivery_details;
            DROP POLICY IF EXISTS "Public can view active events" ON public.events;
            DROP POLICY IF EXISTS "Users can view their own payments" ON public.booking_payments;
            DROP POLICY IF EXISTS "Users can create their own payments" ON public.booking_payments;
            DROP POLICY IF EXISTS "Anyone can view active UPI settings" ON public.upi_settings;
            DROP POLICY IF EXISTS "Public can view stadiums" ON public.stadiums;
            DROP POLICY IF EXISTS "Public can view seats" ON public.seats;
            DROP POLICY IF EXISTS "Public can view teams" ON public.teams;
        `);

        // Drop tables
        await queryRunner.query(`
            DROP TABLE IF EXISTS public.teams;
            DROP TABLE IF EXISTS public.seats;
            DROP TABLE IF EXISTS public.stadiums;
            DROP TABLE IF EXISTS public.upi_settings;
            DROP TABLE IF EXISTS public.booking_payments;
            DROP TABLE IF EXISTS public.events;
            DROP TABLE IF EXISTS public.delivery_details;
            DROP TABLE IF EXISTS public.bookings;
        `);
    }
} 