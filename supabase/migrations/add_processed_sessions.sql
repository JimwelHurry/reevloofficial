-- Add processed_sessions column to profiles table
alter table profiles add column if not exists processed_sessions text[] default array[]::text[];
