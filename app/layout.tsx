import type { Metadata, Viewport } from 'next'
import { Inter, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from 'sonner'
import './globals.css'

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter"
})

const geistMono = Geist_Mono({ 
  subsets: ["latin"],
  variable: "--font-geist-mono"
})

export const metadata: Metadata = {
  title: 'Epicenter Cooperative Society | A Pathway to Financial Freedom',
  description: 'Epicenter Cooperative Society empowers individuals to become financially astute and self-reliant through systematic, enduring, and accessible investment strategies.',
  keywords: ['cooperative', 'investment', 'financial freedom', 'savings', 'Nigeria', 'Epicenter Church'],
  authors: [{ name: 'Epicenter Cooperative Society' }],
  openGraph: {
    title: 'Epicenter Cooperative Society',
    description: 'A Pathway to Financial Freedom - Empowering members through consistent, small-scale investments.',
    type: 'website',
  },
}

export const viewport: Viewport = {
  themeColor: '#D4A017',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${geistMono.variable} bg-background`}>
      <body className="font-sans antialiased min-h-screen">
        {children}
        <Toaster position="top-right" richColors />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
