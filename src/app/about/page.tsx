
// This file is now a Server Component
import type { Metadata } from 'next';
import AboutClient from './about-client'; // Import the new client component

export const metadata: Metadata = {
  title: 'About Us | Yellow Institute',
  description: 'Learn more about Yellow Institute, our mission, vision, and values in providing quality online education.',
};

// This is the Server Component that Next.js will render for the page.
export default function AboutPageContainer() {
  // It renders the Client Component which handles the actual UI and client-side logic.
  return <AboutClient />;
}
