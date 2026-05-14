-- ============================================
-- Teuhidu Nur — Price Size Migration
-- Run this in the Supabase SQL Editor
-- ============================================
-- 
-- This migration updates ALL products from old sizes to new sizes:
-- Musk: 5ml, 10ml, 50ml → 3ml, 6ml, 9ml
-- Spray: 30ml, 50ml, 100ml → 30ml, 50ml (removes 100ml)
--
-- IMPORTANT: Since old prices can't be automatically mapped to new sizes,
-- this script REMOVES old musk keys and sets placeholder prices of 0 for new keys.
-- You MUST update actual prices via the admin panel after running this.
-- Spray 30ml and 50ml prices are preserved. Only 100ml is removed.
-- ============================================

-- Step 1: Update musk prices — remove old keys (5, 10, 50) and add new keys (3, 6, 9) with 0 placeholder
UPDATE products
SET prices = jsonb_set(
  -- First, remove 100ml from spray if it exists
  CASE 
    WHEN prices->'spray' IS NOT NULL AND prices->'spray' ? '100'
    THEN jsonb_set(prices, '{spray}', (prices->'spray') - '100')
    ELSE prices
  END,
  '{musk}',
  CASE
    WHEN prices->'musk' IS NOT NULL AND (prices->'musk') != 'null'::jsonb
    THEN jsonb_build_object('3', 0, '6', 0, '9', 0)
    ELSE prices->'musk'
  END
)
WHERE prices->'musk' IS NOT NULL AND (prices->'musk') != 'null'::jsonb;

-- Step 2: For products that only have spray (no musk), just remove 100ml
UPDATE products
SET prices = jsonb_set(
  prices,
  '{spray}',
  (prices->'spray') - '100'
)
WHERE (prices->'musk' IS NULL OR (prices->'musk') = 'null'::jsonb)
  AND prices->'spray' IS NOT NULL 
  AND prices->'spray' ? '100';

-- Step 3: Verify the migration
-- Run this SELECT to check all products have correct price structure
SELECT 
  id,
  name,
  prices->'musk' as musk_prices,
  prices->'spray' as spray_prices
FROM products
ORDER BY name;

-- ============================================
-- AFTER RUNNING THIS MIGRATION:
-- 1. Open the admin panel
-- 2. Edit each product
-- 3. Set the correct prices for 3ml, 6ml, 9ml musk sizes
-- 4. Verify spray prices (30ml, 50ml) are correct
-- ============================================
