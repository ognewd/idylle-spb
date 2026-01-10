#!/bin/bash
# Упрощенная команда для очистки данных

PGPASSWORD='wendw@@422ewd!' psql -U idylle_user -d idylle_spb -h localhost << 'EOF'
TRUNCATE TABLE 
  wishlist_items,
  seasonal_discount_categories,
  seasonal_discount_products,
  seasonal_discounts,
  reviews,
  product_variants,
  product_images,
  product_categories,
  products,
  payment_methods,
  orders,
  order_items,
  newsletter,
  filter_options,
  filter_groups,
  chat_sessions,
  chat_messages,
  categories,
  brands,
  addresses,
  users,
  settings
CASCADE;
EOF
