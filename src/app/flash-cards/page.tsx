
// src/app/flash-cards/page.tsx
import type { Metadata } from 'next';
import FlashCardsClient from './flash-cards-client'; // We will create this client component

export const metadata: Metadata = {
  title: 'Flash Cards | Yellow Institute',
  description: 'Study and learn with interactive flash cards covering various topics.',
};

export default function FlashCardsPageContainer() {
  return <FlashCardsClient />;
}
    