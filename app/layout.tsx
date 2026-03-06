import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import '../src/globals.css'
import { QueryProvider } from '../src/lib/react-query/QueryProvider'
import AuthProvider from '../src/context/AuthProvider'
import { NotificationProvider } from '../src/context/NotificationContext'
import NotificationManager from '../src/components/NotificationManager'
import { Toaster } from '../src/components/ui/toaster'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

export const viewport: Viewport = {
  themeColor: '#7928CA',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export const metadata: Metadata = {
  metadataBase: new URL('https://aura-hh.vercel.app'),
  title: 'Aura | Connect with your vibe',
  description: 'A modern social media application powered by Next.js, MongoDB, and NextAuth',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Aura',
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/assets/images/aura-logo.png',
  },
  openGraph: {
    title: 'Aura',
    description: 'A modern social media application',
    url: 'https://aura-hh.vercel.app',
    siteName: 'Aura',
    images: [
      {
        url: '/assets/images/aura-og.png',
        width: 1200,
        height: 630,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-inter`}>
        <QueryProvider>
          <AuthProvider>
            <NotificationProvider>
              {children}
              <NotificationManager />
              <Toaster />
            </NotificationProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  )
}
