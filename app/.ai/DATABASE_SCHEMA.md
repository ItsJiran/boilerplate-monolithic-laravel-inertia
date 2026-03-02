# Database Schema Documentation

This document provides a comprehensive overview of the database schema for the App Boilerplate, based on the migration files located in `database/migrations`.

> [!CAUTION]
> **CONTAINERIZED ENVIRONMENT ONLY**
> Jangan pernah menjalankan `php artisan migrate:fresh`, `php artisan db:seed`, atau perintah destruktif database lainnya secara langsung di host machine.
> Kita menggunakan environment Docker container. 

## Core System Tables

### `users`
- `id` (PK)
- `name` (string)
- `username` (string)
- `email` (string, unique)
- `email_verified_at` (timestamp, nullable)
- `password` (string)
- `profile_path` (string, nullable)
- `remember_token`
- `softDeletes`
- `timestamps`

### `roles`
- `id` (PK)
- `name` (string)
- `slug` (string)
- `description` (string, nullable)
- `timestamps`
- `softDeletes`

### `user_roles`
- `id` (PK)
- `user_id` (FK -> users)
- `role_id` (FK -> roles)
- `assigned_at` (timestamp)
- `timestamps`

## Notification System

### `notifications`
- `id` (PK)
- `type` (string)
- `title` (string)
- `body` (text, nullable)
- `meta_json` (json, nullable)
- `timestamps`

### `notification_user`
- `id` (PK)
- `notification_id` (FK -> notifications, cascade)
- `user_id` (FK -> users, cascade)
- `read_at` (timestamp, nullable)
- `timestamps`
- Unique Index: [`notification_id`, `user_id`]
- Index: [`user_id`, `read_at`]

## System Support Tables

### `cache`
- Standard Laravel cache table structure

### `jobs`
- Standard Laravel jobs table structure

### `sessions`
- Standard Laravel sessions table structure
- `user_id` (FK, nullable, index)
- `ip_address`
- `user_agent`
- `payload`
- `last_activity` (index)

### `password_reset_tokens`
- Standard Laravel password reset tokens table
