
// This file is now a Server Component
import type { Metadata, ResolvingMetadata } from 'next';
import { getLearningPathsFromDb, getCoursesFromDb } from '@/lib/dbUtils'; // Use mock data functions
import LearningPathDetailClient from './learning-path-detail-client'; 

type Props = {
  params: { id: string }
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const id = params.id;
  const allPaths = await getLearningPathsFromDb(); // Now from mock data
  const learningPath = allPaths.find((p) => p.id === id);

  if (!learningPath) {
    return {
      title: "Learning Path Not Found | Yellow Institute",
      description: "The learning path you are looking for could not be found.",
    }
  }

  const allCourses = await getCoursesFromDb(); // Now from mock data
  const pathCourseIds = learningPath.courseIds || [];
  const pathCourses = allCourses.filter(course => pathCourseIds.includes(course.id));
  const courseTitles = pathCourses.map(c => c.title).slice(0, 3);

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

export default function LearningPathPageContainer({ params }: Props) {
  return <LearningPathDetailClient pathId={params.id} />;
}
