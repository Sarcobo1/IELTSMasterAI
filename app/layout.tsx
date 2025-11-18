import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import Script from "next/script"


const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'IELTS MaterAI',
  description: 'Created with v0',
  generator: 'AUROX',
  icons: {
    icon: [
      {
        url: '/icon.webp',
        type: 'image/webp',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <Script
  src="https://www.googletagmanager.com/gtag/js?id=G-3Y8E096913"
  strategy="afterInteractive"
/>
<Script id="ga4" strategy="afterInteractive">
  {`
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-3Y8E096913');
  `}
</Script>

      <body className="font-sans antialiased">
        {children}
        <Analytics /> 
      </body>
    </html>
  )
}
