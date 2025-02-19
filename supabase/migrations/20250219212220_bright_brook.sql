/*
  # Fix duplicate policy names

  1. Changes
    - Drop existing policies with duplicate names
    - Recreate policies with unique names for each table
  
  2. Security
    - Maintain same security rules but with unique policy names
    - Ensure admin-only access for modifications
    - Allow public read access
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Enable read access for all users" ON og_wallets;
DROP POLICY IF EXISTS "Enable insert for admin users" ON og_wallets;
DROP POLICY IF EXISTS "Enable update for admin users" ON og_wallets;
DROP POLICY IF EXISTS "Enable delete for admin users" ON og_wallets;
DROP POLICY IF EXISTS "Enable read access for all users" ON wl_wallets;
DROP POLICY IF EXISTS "Enable insert for admin users" ON wl_wallets;
DROP POLICY IF EXISTS "Enable update for admin users" ON wl_wallets;
DROP POLICY IF EXISTS "Enable delete for admin users" ON wl_wallets;

-- Create new policies for OG wallets with unique names
CREATE POLICY "og_wallets_read_access"
  ON og_wallets FOR SELECT
  TO public
  USING (true);

CREATE POLICY "og_wallets_insert_admin"
  ON og_wallets FOR INSERT
  TO authenticated
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "og_wallets_update_admin"
  ON og_wallets FOR UPDATE
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "og_wallets_delete_admin"
  ON og_wallets FOR DELETE
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');

-- Create new policies for WL wallets with unique names
CREATE POLICY "wl_wallets_read_access"
  ON wl_wallets FOR SELECT
  TO public
  USING (true);

CREATE POLICY "wl_wallets_insert_admin"
  ON wl_wallets FOR INSERT
  TO authenticated
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "wl_wallets_update_admin"
  ON wl_wallets FOR UPDATE
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "wl_wallets_delete_admin"
  ON wl_wallets FOR DELETE
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');