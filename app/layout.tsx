import type { Metadata } from 'next'
import './globals.css'
import '@/styles/leaflet-setup.css'
import { AppProviders } from './providers'
import Logo from '@/public/FitnestLogo.png'

export const metadata: Metadata = {
  title: 'FitNest Admin',
  description: 'FitNest Fitness Management Admin Panel',
  generator: 'v0.app',
  icons: {
    icon: Logo.src,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // SF Pro is bundled via @font-face in globals.css — avoid next/font/google so
  // Docker/CI builds do not need to fetch fonts.googleapis.com at compile time.
  return (
    <html lang="az">
      <body className="font-sans antialiased">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  )
}
