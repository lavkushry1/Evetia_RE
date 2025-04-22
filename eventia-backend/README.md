
# Eventia Backend

This folder contains the backend implementation for the Eventia ticketing platform, built with Supabase as the database and authentication provider.

## Features

- User Authentication
- Event, Stadium, Team Management
- Ticket Booking with Seat Locking
- Manual UPI Payments with UTR Verification
- Admin Dashboard
- QR UPI Settings
- Discount Code Management
- PDF Ticket Generation

## Implementation Details

The backend is implemented using Supabase, which provides:
- PostgreSQL database
- Authentication services
- Storage for files
- Real-time subscriptions
- Edge Functions for custom server-side logic

## Folder Structure

- `/models` - TypeScript interfaces for database models
- `/services` - Business logic for interacting with Supabase
- `/utils` - Utility functions
- `/types` - TypeScript type definitions

## Important Note

This implementation uses Supabase instead of MongoDB, as it provides similar functionality with better integration with the existing frontend.
