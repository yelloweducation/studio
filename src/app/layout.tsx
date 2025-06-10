
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
  title: 'Yellow Institute',
  description: 'Your journey to knowledge starts here at Yellow Institute.',
  // Viewport configuration removed from here
};

// Separate viewport export
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
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
