// 📁 lib/models/User.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
    email: string;
    password: string;
    isPremium: boolean;
    premiumExpiresAt?: Date;
    planId?: string; // ✅ Yangi maydon qo'shildi
    role: 'user' | 'admin';
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
    // ✅ YANGI MAYDON - Obuna reja ID si
    planId: {
        type: String,
        enum: ['free', 'premium_monthly', 'premium_pro_monthly', 'premium_pro_annual'],
        default: 'free'
    },
    role: { 
        type: String, 
        enum: ['user', 'admin'], 
        default: 'user' 
    }
}, { timestamps: true });

// Index qo'shish (performance uchun)
UserSchema.index({ email: 1 });
UserSchema.index({ isPremium: 1, premiumExpiresAt: 1 });

const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;