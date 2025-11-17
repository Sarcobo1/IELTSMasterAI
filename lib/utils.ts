// src/lib/utils.ts

import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import crypto from 'crypto'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Password hashing function (for Supabase auth)
export function hashPassword(password: string): string {
  return crypto.pbkdf2Sync(password, 'salt', 100000, 64, 'sha512').toString('hex')
}