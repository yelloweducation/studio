
// This file is now a Server Component
import type { Metadata } from 'next';
import TermsOfServiceClient from './terms-of-service-client'; // Import the new client component

export const metadata: Metadata = {
  title: 'Terms of Service | Yellow Institute',
  description: 'Review the Terms of Service for Yellow Institute before using our platform and services.',
};

// This is the Server Component that Next.js will render for the page.
export default function TermsOfServicePageContainer() {
  return <TermsOfServiceClient />;
}
