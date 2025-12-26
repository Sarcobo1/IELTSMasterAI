// types/globals.d.ts

// =================================================================
// 1. Crisp Chat va Global Window (Frontend uchun)
// =================================================================
interface Window {
  $crisp: any[];
  CRISP_WEBSITE_ID: string;
}

// =================================================================
// 2. MongoDB Ulanish Holatini saqlash (Node.js/Backend uchun)
// =================================================================
import type { Mongoose } from 'mongoose'; // Faqat tipni import qilish

// Node.js ning global obyektini kengaytirish
declare global {
  namespace NodeJS {
    interface Global {
      mongoose: {
        conn: Mongoose | null;
        promise: Promise<Mongoose> | null;
      };
    }
  }
}

// =================================================================
// 3. Express Request interfeysini kengaytirish (Agar Express ishlatilsa)
// =================================================================
declare module 'express' {
  export interface Request {
    user?: {
      id: string;
      email: string;
      name?: string;
      role?: string;
      isPremium?: boolean;
    };
  }
}

// =================================================================
// 4. Next.js Request interfeysini kengaytirish
//    (App Router - NextRequest yoki Pages Router - NextApiRequest)
// =================================================================

import { NextApiRequest as DefaultNextApiRequest } from 'next';
import { NextRequest as DefaultNextRequest } from 'next/server';

declare module 'next' {
  // Pages Router uchun
  export interface NextApiRequest extends DefaultNextApiRequest {
    user?: {
      id: string;
      email: string;
      name?: string;
      role?: string;
      isPremium?: boolean;
    };
  }
}

declare module 'next/server' {
  // App Router (Route Handler) uchun
  export interface NextRequest extends DefaultNextRequest {
     user?: {
      id: string;
      email: string;
      name?: string;
      role?: string;
      isPremium?: boolean;
    };
  }
}


// =================================================================
// 5. NextAuth.js uchun
// =================================================================
import { DefaultSession, DefaultUser } from 'next-auth';
import { JWT as DefaultJWT } from 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role?: string;
      isPremium?: boolean;
    } & DefaultSession['user'];
  }

  interface User extends DefaultUser {
    id: string;
    role?: string;
    isPremium?: boolean;
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    id: string;
    role?: string;
    isPremium?: boolean;
  }
}