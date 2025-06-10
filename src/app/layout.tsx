
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
  // metadataBase: new URL('https://your-production-domain.com'), // IMPORTANT: Update this!
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: ["education", "online learning", "courses", "tech education", "yellow institute", "e-learning", "study tools", "flashcards"],
  authors: [{ name: "Yellow Institute Team", url: "https://your-production-domain.com" }], // IMPORTANT: Update this!
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
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FACC15' }, // Yellow-500 for light mode
    { media: '(prefers-color-scheme: dark)', color: '#423A0E' },  // Darker variant for dark mode
  ],
  manifest: '/manifest.json', // You'll need to create public/manifest.json
  openGraph: {
    type: "website",
    locale: "en_US", // Default locale
    // url: "https://your-production-domain.com", // IMPORTANT: Update this!
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
    // images: [ // Add a default OG image
    //   {
    //     url: "https://your-production-domain.com/og-image.png", // IMPORTANT: Create and update this!
    //     width: 1200,
    //     height: 630,
    //     alt: "Yellow Institute - Online Learning Platform",
    //   },
    // ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    // images: ["https://your-production-domain.com/og-image.png"], // IMPORTANT: Create and update this!
    // creator: "@yourTwitterHandle", // IMPORTANT: Add your Twitter handle
  },
  icons: { // Add favicon links
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  }
};

// Separate viewport export
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1, // Optional: Prevents zooming, consider accessibility
  themeColor: [ // Match metadata themeColor for consistency
    { media: '(prefers-color-scheme: light)', color: '#FACC15' },
    { media: '(prefers-color-scheme: dark)', color: '#423A0E' },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = headers().get('next-url') || ''; // Get current pathname

  return (
    <html lang="en" suppressHydrationWarning className={`${poppins.variable} ${ptSans.variable}`}>
      <head>
        {/* Viewport meta tag is now handled by the viewport export */}
        {/* Other head tags like preconnects can be added here if needed */}
      </head>
      <body className="font-body antialiased flex flex-col min-h-screen">
        <ThemeProvider>
          <AuthProvider>
            <LanguageProvider> {/* Added LanguageProvider */}
              {/* Header and Footer already have internal logic to hide on /videos */}
              <Header />
              {pathname === '/videos' ? (
                children // Render children directly for the /videos page
              ) : (
                <main className="flex-grow container mx-auto px-4 py-8">
                  {children} {/* Wrap other pages in the main container */}
                </main>
              )}
              <Footer />
              <Toaster />
            </LanguageProvider> {/* Closed LanguageProvider */}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
