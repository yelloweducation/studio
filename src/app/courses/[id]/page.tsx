
// This file is now a Server Component
import React from 'react';
import type { Metadata, ResolvingMetadata } from 'next';
import { getCourseByIdFromDb } from '@/lib/dbUtils'; // Use mock data functions
import CourseDetailClient from './course-detail-client'; 

type Props = {
  params: { id: string }
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const id = params.id;
  const course = await getCourseByIdFromDb(id); // Now fetches from mock data

  if (!course) {
    return {
      title: "Course Not Found | Yellow Institute",
      description: "The course you are looking for could not be found.",
    }
  }

  const previousImages = (await parent).openGraph?.images || [];
  const categoryName = course.category; // Use 'category' from mock Course type

  return {
    title: `${course.title} | Yellow Institute`,
    description: `Learn about ${course.title}, a course in ${categoryName || 'General'} taught by ${course.instructor || 'Yellow Institute'}. ${course.description?.substring(0, 150)}...`,
    keywords: [course.title, categoryName || 'education', course.instructor || 'education', 'course', 'learning', 'Yellow Institute'],
    openGraph: {
      title: course.title,
      description: course.description?.substring(0, 120) + '...',
      images: course.imageUrl ? [course.imageUrl, ...previousImages] : previousImages,
      type: 'article', 
      authors: course.instructor ? [course.instructor] : [],
    },
  }
}

export default function CoursePage({ params }: Props) {
  return <CourseDetailClient courseId={params.id} />;
}
