// lib/server-utils.ts
import crypto from 'crypto'

export function hashPassword(password: string): string {
  return crypto.pbkdf2Sync(password, 'salt', 100000, 64, 'sha512').toString('hex')
}