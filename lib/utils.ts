// src/lib/utils.ts

import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Parolni xeshlovchi funksiya (Supabase autentifikatsiyasi uchun)
export function hashPassword(password: string): string {
  // Build-time muammolarni oldini olish uchun 'crypto' ni dinamik import qilish
  const crypto = require('crypto') 
  return crypto.pbkdf2Sync(password, 'salt', 100000, 64, 'sha512').toString('hex')
}