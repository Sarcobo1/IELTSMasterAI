// 📁 lib/models/User.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
    email: string;
    password: string;
    isPremium: boolean;
    premiumExpiresAt?: Date;
    planId?: string;
    role: 'user' | 'admin';
    uploadCount: number;        // ✅ Yuklash hisoblagichi
    lastUploadDate?: Date;      // ✅ Oxirgi yuklash sanasi
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema: Schema = new Schema({
    email: { 
        type: String, 
        required: true, 
        unique: true,
        lowercase: true,
        trim: true
        // ❌ index: true ni olib tashladik
    },
    password: { 
        type: String, 
        required: true 
    },
    isPremium: { 
        type: Boolean, 
        default: false 
    },
    premiumExpiresAt: { 
        type: Date,
        default: null
    },
    planId: {
        type: String,
        enum: ['free', 'premium_monthly', 'premium_pro_monthly', 'premium_pro_annual'],
        default: 'free'
    },
    role: { 
        type: String, 
        enum: ['user', 'admin'], 
        default: 'user' 
    },
    // ✅ YANGI MAYDONLAR - Yuklash limiti uchun
    uploadCount: {
        type: Number,
        default: 0
    },
    lastUploadDate: {
        type: Date,
        default: null
    }
}, { timestamps: true });

// Index qo'shish (performance uchun)
// ❌ email indexini olib tashladik (unique: true o'zi index yaratadi)
UserSchema.index({ isPremium: 1, premiumExpiresAt: 1 });
UserSchema.index({ lastUploadDate: 1 }); // ✅ Yangi index

const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;