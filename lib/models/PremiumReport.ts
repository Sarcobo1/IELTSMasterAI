import mongoose, { Schema, Document } from 'mongoose';

export interface IPremiumReport extends Document {
    title: string;          // Hisobot sarlavhasi
    contentBody: string;    // Hisobotning asosiy matni (yoki katta JSON/HTML matni)
    accessLevel: 'PREMIUM' | 'VIP'; // Kirish darajasi (agar sizda ko'p darajali premium bo'lsa)
    createdAt: Date;
    updatedAt: Date;
}

const PremiumReportSchema: Schema = new Schema({
    title: { type: String, required: true },
    contentBody: { type: String, required: true },
    accessLevel: { 
        type: String, 
        enum: ['PREMIUM', 'VIP'], // FAQAT shu qiymatlarni qabul qilsin
        default: 'PREMIUM' 
    },
}, { timestamps: true }); 

const PremiumReport = mongoose.models.PremiumReport 
    || mongoose.model<IPremiumReport>('PremiumReport', PremiumReportSchema);

export default PremiumReport;