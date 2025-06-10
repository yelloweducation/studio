
// This file is now a Server Component
import type { Metadata } from 'next';
import PersonalityTestsClient from './personality-tests-client'; // Import the new client component

export const metadata: Metadata = {
  title: 'Personality Tests | Yellow Institute',
  description: 'Discover more about yourself with our personality tests. Explore learning styles, career paths, and team roles.',
};

// This is the Server Component that Next.js will render for the page.
export default function PersonalityTestsPageContainer() {
  return <PersonalityTestsClient />;
}
