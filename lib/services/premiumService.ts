import connectToMongo from '../mongodb';
import User from '../models/User';
export async function checkUserPremiumStatus(userId: string): Promise<{ isPremium: boolean, exists: boolean, expiresAt: string | null }> {
    await connectToMongo();
    // isPremium va premiumExpiresAt ni tanlab olish
    const user = await User.findById(userId).select('isPremium premiumExpiresAt');
    if (!user) {
        return { isPremium: false, exists: false, expiresAt: null };
    }
    const now = new Date();
    const expires = user.premiumExpiresAt;
    // Premium faolmi? (isPremium true bo'lsa va muddati o'tmagan bo'lsa)
    const isCurrentlyPremium = user.isPremium && expires && new Date(expires) > now;
    return {
        isPremium: isCurrentlyPremium,
        exists: true,
        expiresAt: isCurrentlyPremium ? expires.toISOString() : null,
    };
}
// 💡 Bu status endi muddatini hisobga olgan holda aniqlanadi.