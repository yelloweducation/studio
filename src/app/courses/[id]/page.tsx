// This file is now a Server Component
import React from 'react';
import type { Metadata, ResolvingMetadata } from 'next';
import { courses as allMockCourses } from '@/data/mockData'; // Renamed for clarity in this file
import CourseDetailClient from './course-detail-client'; // Import the new client component

type Props = {
  params: { id: string }
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const id = params.id;
  // generateMetadata runs on the server, so it uses the initial mockData.
  // In a real app, this would fetch data from a DB/CMS.
  const course = allMockCourses.find((c) => c.id === id);

  if (!course) {
    return {
      title: "Course Not Found | Yellow Institute",
      description: "The course you are looking for could not be found.",
    }
  }

  const previousImages = (await parent).openGraph?.images || [];

  return {
    title: `${course.title} | Yellow Institute`,
    description: `Learn about ${course.title}, a course in ${course.category} taught by ${course.instructor}. ${course.description.substring(0, 150)}...`,
    keywords: [course.title, course.category, course.instructor || 'education', 'course', 'learning', 'Yellow Institute'],
    openGraph: {
      title: course.title,
      description: course.description.substring(0, 120) + '...',
      images: course.imageUrl ? [course.imageUrl, ...previousImages] : previousImages,
      type: 'article', 
      authors: course.instructor ? [course.instructor] : [],
    },
  }
}

// This is the Server Component that Next.js will render for the page.
export default function CoursePage({ params }: Props) {
  // It passes the courseId to the Client Component, which will handle fetching/displaying actual course data.
  return <CourseDetailClient courseId={params.id} />;
}
