/**
 * a) Module Name: Database Schema and Row-Level Security Policies
 * b) Date of Code: October 8, 2026
 * c) Programmer's Name: Peter Kimberley
 * d) Brief Description: PostgreSQL SQL migration script establishing relational schema for
 *    profiles and trips tables with Row-Level Security (RLS) enforcement.
 * e) Important Tables & Policies:
 *    - public.profiles: User metadata table linked 1:1 to auth.users with ON DELETE CASCADE.
 *    - public.trips: Travel trip records linked to profiles via user_id foreign key.
 *    - RLS Policies: Guarantees user isolation (auth.uid() = user_id) on SELECT, INSERT, UPDATE, DELETE.
 * f) Important Data Structures:
 *    - UUID: 128-bit random identifiers (gen_random_uuid()) preventing sequential ID enumeration.
 *    - TIMESTAMPTZ: UTC-standardized timestamps for created_at and updated_at.
 * g) Algorithm & Justification:
 *    - Database Kernel Row-Level Security vs Application Logic: Enforcing security directly
 *      in the PostgreSQL query planner physically prevents unauthorized data access regardless
 *      of any application-level query bugs.
 */

-- 1. Profiles Table
CREATE TABLE public.profiles (
  id uuid NOT NULL REFERENCES auth.users on delete cascade,
  email text NOT NULL,
  display_name text,
  avatar_url text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  PRIMARY KEY (id)
);

-- Set up Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2. Trips Table
CREATE TABLE public.trips (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  user_id uuid NOT NULL REFERENCES public.profiles(id) on delete cascade,
  title text NOT NULL,
  destination text NOT NULL,
  start_date date,
  end_date date,
  description text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  PRIMARY KEY (id)
);

-- Set up Row Level Security (RLS)
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;

-- Basic policies (users can only read/write their own data)
CREATE POLICY "Users can view their own profile." ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view their own trips." ON public.trips FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own trips." ON public.trips FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own trips." ON public.trips FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own trips." ON public.trips FOR DELETE USING (auth.uid() = user_id);
