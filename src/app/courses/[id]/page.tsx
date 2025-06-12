
// This file is now a Server Component
import React from 'react';
import type { Metadata, ResolvingMetadata } from 'next';
import { getCourseByIdFromDb } from '@/lib/dbUtils'; 
import CourseDetailClient from './course-detail-client'; 

type Props = {
  params: { id: string }
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const id = params.id;
  const course = await getCourseByIdFromDb(id); 

  if (!course) {
    return {
      title: "Course Not Found | Yellow Institute",
      description: "The course you are looking for could not be found.",
    }
  }

  const previousImages = (await parent).openGraph?.images || [];
  const categoryName = course.categoryNameCache; 

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

// Server component: fetch data and pass to client component
export default async function CoursePageContainer({ params }: Props) {
  const course = await getCourseByIdFromDb(params.id); // Fetch full course data here
  // Note: CourseDetailClient will handle displaying "Not Found" if course is null
  return <CourseDetailClient initialCourse={course} courseId={params.id} />;
}
