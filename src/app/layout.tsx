
import type { Metadata, Viewport } from 'next'; // Added Viewport
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { LanguageProvider } from '@/contexts/LanguageContext'; // Added
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Poppins, PT_Sans } from 'next/font/google';
import { headers } from 'next/headers'; // Import headers
import { siteConfig } from '@/config/site'; // Assuming you'll create this

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-poppins',
  display: 'swap',
});

const ptSans = PT_Sans({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-pt-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: process.env.NEXT_PUBLIC_SITE_URL ? new URL(process.env.NEXT_PUBLIC_SITE_URL) : undefined,
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: ["education", "online learning", "courses", "tech education", "yellow institute", "e-learning", "study tools", "flashcards"],
  authors: [{ name: "Yellow Institute Team", url: siteConfig.url }],
  creator: "Yellow Institute Team",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  manifest: '/manifest.json',
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: siteConfig.ogImage ? [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: `${siteConfig.name} - Online Learning Platform`,
      },
    ] : undefined,
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    images: siteConfig.ogImage ? [siteConfig.ogImage] : undefined,
    creator: siteConfig.links?.twitter ? `@${siteConfig.links.twitter.split('/').pop()}` : undefined,
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  }
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FACC15' }, 
    { media: '(prefers-color-scheme: dark)', color: '#423A0E' },  
  ],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = headers().get('next-url') || '';

  return (
    <html lang="en" suppressHydrationWarning className={`${poppins.variable} ${ptSans.variable}`}>
      <head>
      </head>
      <body className="font-body antialiased flex flex-col min-h-screen">
        <ThemeProvider>
          <AuthProvider>
            <LanguageProvider>
              <Header />
              {pathname === '/videos' ? (
                children
              ) : (
                <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                  {children}
                </main>
              )}
              <Footer />
              <Toaster />
            </LanguageProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
