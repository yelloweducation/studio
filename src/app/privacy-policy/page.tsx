
// This file is now a Server Component
import type { Metadata } from 'next';
import PrivacyPolicyClient from './privacy-policy-client'; // Import the new client component

export const metadata: Metadata = {
  title: 'Privacy Policy | Yellow Institute',
  description: 'Read the Privacy Policy for Yellow Institute to understand how we collect, use, and protect your personal information.',
};

// This is the Server Component that Next.js will render for the page.
export default function PrivacyPolicyPageContainer() {
  return <PrivacyPolicyClient />;
}
