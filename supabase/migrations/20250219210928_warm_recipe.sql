/*
  # Fix RLS policies for admin access

  1. Changes
    - Drop existing RLS policies
    - Create new policies that properly handle admin access
    - Add delete policies for admin users
  
  2. Security
    - Ensure admin users can perform all CRUD operations
    - Maintain public read-only access for wallet status checks
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Public can read their own OG wallet status" ON og_wallets;
DROP POLICY IF EXISTS "Only admin can insert OG wallets" ON og_wallets;
DROP POLICY IF EXISTS "Only admin can update OG wallets" ON og_wallets;
DROP POLICY IF EXISTS "Public can read their own WL wallet status" ON wl_wallets;
DROP POLICY IF EXISTS "Only admin can insert WL wallets" ON wl_wallets;
DROP POLICY IF EXISTS "Only admin can update WL wallets" ON wl_wallets;

-- Create new policies for OG wallets
CREATE POLICY "Enable read access for all users"
  ON og_wallets FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Enable insert for admin users"
  ON og_wallets FOR INSERT
  TO authenticated
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Enable update for admin users"
  ON og_wallets FOR UPDATE
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Enable delete for admin users"
  ON og_wallets FOR DELETE
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');

-- Create new policies for WL wallets
CREATE POLICY "Enable read access for all users"
  ON wl_wallets FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Enable insert for admin users"
  ON wl_wallets FOR INSERT
  TO authenticated
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Enable update for admin users"
  ON wl_wallets FOR UPDATE
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Enable delete for admin users"
  ON wl_wallets FOR DELETE
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');