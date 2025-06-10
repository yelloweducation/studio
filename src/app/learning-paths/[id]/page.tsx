
// This file is now a Server Component
import type { Metadata, ResolvingMetadata } from 'next';
import { initialLearningPaths, courses as defaultMockCourses } from '@/data/mockData';
import LearningPathDetailClient from './learning-path-detail-client'; // Import the new client component

type Props = {
  params: { id: string }
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const id = params.id;
  // Note: In a real app, fetch this from your CMS or database
  // For generateMetadata, we can't use localStorage, so we rely on the initial mock data.
  const learningPath = initialLearningPaths.find((p) => p.id === id);

  if (!learningPath) {
    return {
      title: "Learning Path Not Found | Yellow Institute",
      description: "The learning path you are looking for could not be found.",
    }
  }

  const pathCourses = defaultMockCourses.filter(course => learningPath.courseIds.includes(course.id));
  const courseTitles = pathCourses.map(c => c.title).slice(0, 3); // Get first 3 course titles for description

  const previousImages = (await parent).openGraph?.images || []

  return {
    title: `${learningPath.title} | Yellow Institute`,
    description: `${learningPath.description.substring(0, 150)}${learningPath.description.length > 150 ? '...' : ''} Includes courses like ${courseTitles.join(', ')}.`,
    keywords: [learningPath.title, 'learning path', 'education', ...courseTitles, 'Yellow Institute'],
    openGraph: {
      title: learningPath.title,
      description: learningPath.description.substring(0, 120) + '...',
      images: learningPath.imageUrl ? [learningPath.imageUrl, ...previousImages] : previousImages,
      type: 'article',
    },
  }
}

// This is the Server Component that Next.js will render for the page.
export default function LearningPathPageContainer({ params }: Props) {
  // It passes the pathId to the Client Component.
  return <LearningPathDetailClient pathId={params.id} />;
}
