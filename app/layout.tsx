// app/layout.tsx

import { type Metadata } from "next";
import Navigation from "@/components/navigation";
import { AuthProvider } from "@/context/AuthContext"; 
import "./globals.css";

export const metadata: Metadata = {
    title: "IELTS MasterAI",
    description: "Ielts Practice with AI tools",
    // Mana bu qator har qanday avtomatik generator nomini "yopib" yuboradi:
    generator: "Next.js",
    applicationName: "IELTS MasterAI",
    // Ijtimoiy tarmoqlar uchun maxsus:
    openGraph: {
        title: "IELTS MasterAI",
        description: "Ielts Practice with AI tools",
        type: "website",
        siteName: "IELTS MasterAI",
    },
    twitter: {
        card: "summary_large_image",
        title: "IELTS MasterAI",
        description: "Ielts Practice with AI tools",
    },
};
export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
})
 {
    return (
        <html lang="en">
            <head>
                <link 
                    href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" 
                    rel="stylesheet" 
                />
            </head>
            <body className="font-sans antialiased">
                <AuthProvider> 
                    <Navigation /> 
                    <main>{children}</main>
                </AuthProvider>
            </body>
        </html>
    );
}