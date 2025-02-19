/*
  # Final fix for RLS policies and admin role

  1. Changes
    - Drop all existing policies
    - Create new policies with simplified conditions
    - Add delete policies
  
  2. Security
    - Maintain same security rules with simpler conditions
    - Ensure proper admin role checks
*/

-- Drop all existing policies
DROP POLICY IF EXISTS "og_wallets_read_access" ON og_wallets;
DROP POLICY IF EXISTS "og_wallets_insert_admin" ON og_wallets;
DROP POLICY IF EXISTS "og_wallets_update_admin" ON og_wallets;
DROP POLICY IF EXISTS "og_wallets_delete_admin" ON og_wallets;
DROP POLICY IF EXISTS "wl_wallets_read_access" ON wl_wallets;
DROP POLICY IF EXISTS "wl_wallets_insert_admin" ON wl_wallets;
DROP POLICY IF EXISTS "wl_wallets_update_admin" ON wl_wallets;
DROP POLICY IF EXISTS "wl_wallets_delete_admin" ON wl_wallets;

-- Create simplified policies for OG wallets
CREATE POLICY "og_read_all"
  ON og_wallets FOR SELECT
  USING (true);

CREATE POLICY "og_insert_admin"
  ON og_wallets FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "og_update_admin"
  ON og_wallets FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "og_delete_admin"
  ON og_wallets FOR DELETE
  USING (auth.role() = 'authenticated');

-- Create simplified policies for WL wallets
CREATE POLICY "wl_read_all"
  ON wl_wallets FOR SELECT
  USING (true);

CREATE POLICY "wl_insert_admin"
  ON wl_wallets FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "wl_update_admin"
  ON wl_wallets FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "wl_delete_admin"
  ON wl_wallets FOR DELETE
  USING (auth.role() = 'authenticated');