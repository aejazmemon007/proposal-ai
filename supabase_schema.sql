-- =========================================================
-- PROPOSALAI CLOUD DATABASE SCHEMA FOR SUPABASE
-- Run this in your Supabase Project: SQL Editor -> New Query -> Run
-- =========================================================

-- 1. Create Profiles Table (Linked with Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  profession TEXT,
  experience TEXT,
  currency TEXT DEFAULT 'INR',
  business_name TEXT,
  website TEXT,
  phone TEXT,
  location TEXT,
  logo_url TEXT,
  primary_color TEXT DEFAULT '#7c3aed',
  color_mode TEXT DEFAULT 'gradient',
  gradient_from TEXT DEFAULT '#7c3aed',
  gradient_to TEXT DEFAULT '#4f46e5',
  gradient_angle INT DEFAULT 135,
  hide_watermark BOOLEAN DEFAULT FALSE,
  tagline TEXT,
  upi_id TEXT DEFAULT 'proposal.ai@upi',
  upi_name TEXT,
  bank_name TEXT,
  account_number TEXT,
  ifsc_code TEXT,
  subscription TEXT DEFAULT 'free',
  usage_this_month INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create Proposals Table
CREATE TABLE IF NOT EXISTS public.proposals (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  project_name TEXT NOT NULL,
  client_name TEXT NOT NULL,
  client_email TEXT,
  status TEXT DEFAULT 'draft',
  price NUMERIC DEFAULT 0,
  currency TEXT DEFAULT 'INR',
  pricing_model TEXT DEFAULT 'fixed',
  template_id TEXT DEFAULT 'modern-minimal',
  public_token TEXT,
  content JSONB,
  brief_analysis JSONB,
  view_count INT DEFAULT 0,
  viewed_at TIMESTAMP WITH TIME ZONE,
  accepted_at TIMESTAMP WITH TIME ZONE,
  rejected_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create Clients Table
CREATE TABLE IF NOT EXISTS public.clients (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  company TEXT,
  phone TEXT,
  status TEXT DEFAULT 'lead',
  total_revenue NUMERIC DEFAULT 0,
  currency TEXT DEFAULT 'INR',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create Transactions Table (Subscription Purchases & UTR Verifications)
CREATE TABLE IF NOT EXISTS public.transactions (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  user_name TEXT,
  user_email TEXT NOT NULL,
  business_name TEXT,
  plan_id TEXT NOT NULL,
  plan_name TEXT NOT NULL,
  billing_cycle TEXT DEFAULT 'monthly',
  amount NUMERIC NOT NULL,
  payment_method TEXT,
  utr_number TEXT,
  status TEXT DEFAULT 'verified',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- 6. Policies for Profiles (Safe Idempotent Policy Management)
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 7. Policies for Proposals
DROP POLICY IF EXISTS "Users can manage their own proposals" ON public.proposals;
CREATE POLICY "Users can manage their own proposals"
  ON public.proposals FOR ALL
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Public can view proposals via public token" ON public.proposals;
CREATE POLICY "Public can view proposals via public token"
  ON public.proposals FOR SELECT
  USING (public_token IS NOT NULL);

-- 8. Policies for Clients
DROP POLICY IF EXISTS "Users can manage their own clients" ON public.clients;
CREATE POLICY "Users can manage their own clients"
  ON public.clients FOR ALL
  USING (auth.uid() = user_id);

-- 9. Policies for Transactions
DROP POLICY IF EXISTS "Users can view their own transactions" ON public.transactions;
CREATE POLICY "Users can view their own transactions"
  ON public.transactions FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert transactions on checkout" ON public.transactions;
CREATE POLICY "Users can insert transactions on checkout"
  ON public.transactions FOR INSERT
  WITH CHECK (true);

-- 10. Auto-create profile trigger on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'firstName',
    NEW.raw_user_meta_data->>'lastName'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

