/*
  # Create wallet allowlist tables

  1. New Tables
    - `og_wallets`
      - `wallet_address` (text, primary key) - The wallet address
      - `mints_allowed` (integer) - Number of mints allowed (default 1)
      - `mints_used` (integer) - Number of mints already used
      - `created_at` (timestamp)
    
    - `wl_wallets`
      - `wallet_address` (text, primary key) - The wallet address
      - `mints_allowed` (integer) - Number of mints allowed (default 3)
      - `mints_used` (integer) - Number of mints already used
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for:
      - Public can read their own wallet status
      - Only admin can insert/update records
*/

-- Create OG wallets table
CREATE TABLE IF NOT EXISTS og_wallets (
  wallet_address text PRIMARY KEY,
  mints_allowed integer NOT NULL DEFAULT 1,
  mints_used integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT mints_used_check CHECK (mints_used <= mints_allowed)
);

-- Create WL wallets table
CREATE TABLE IF NOT EXISTS wl_wallets (
  wallet_address text PRIMARY KEY,
  mints_allowed integer NOT NULL DEFAULT 3,
  mints_used integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT mints_used_check CHECK (mints_used <= mints_allowed)
);

-- Enable Row Level Security
ALTER TABLE og_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE wl_wallets ENABLE ROW LEVEL SECURITY;

-- Create policies for OG wallets
CREATE POLICY "Public can read their own OG wallet status"
  ON og_wallets
  FOR SELECT
  USING (auth.jwt() IS NULL OR wallet_address = current_user);

CREATE POLICY "Only admin can insert OG wallets"
  ON og_wallets
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.jwt()->>'role' = 'admin');

CREATE POLICY "Only admin can update OG wallets"
  ON og_wallets
  FOR UPDATE
  TO authenticated
  USING (auth.jwt()->>'role' = 'admin')
  WITH CHECK (auth.jwt()->>'role' = 'admin');

-- Create policies for WL wallets
CREATE POLICY "Public can read their own WL wallet status"
  ON wl_wallets
  FOR SELECT
  USING (auth.jwt() IS NULL OR wallet_address = current_user);

CREATE POLICY "Only admin can insert WL wallets"
  ON wl_wallets
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.jwt()->>'role' = 'admin');

CREATE POLICY "Only admin can update WL wallets"
  ON wl_wallets
  FOR UPDATE
  TO authenticated
  USING (auth.jwt()->>'role' = 'admin')
  WITH CHECK (auth.jwt()->>'role' = 'admin');

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS og_wallets_address_idx ON og_wallets(wallet_address);
CREATE INDEX IF NOT EXISTS wl_wallets_address_idx ON wl_wallets(wallet_address);