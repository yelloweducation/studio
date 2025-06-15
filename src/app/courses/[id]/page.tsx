
// This file is now a Server Component
import React from 'react';
import type { Metadata, ResolvingMetadata } from 'next';
import { getCourseByIdFromDb } from '@/lib/dbUtils'; 
import CourseDetailClient from './course-detail-client'; 
import { siteConfig } from '@/config/site';

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
      title: `Course Not Found | ${siteConfig.name}`,
      description: "The course you are looking for could not be found.",
    }
  }

  const previousImages = (await parent).openGraph?.images || [];
  const categoryName = course.categoryNameCache; 

  return {
    title: `${course.title} | ${siteConfig.name}`,
    description: `Learn about ${course.title}, a course in ${categoryName || 'General'} taught by ${course.instructor || siteConfig.name}. ${course.description?.substring(0, 150)}...`,
    keywords: [course.title, categoryName || 'education', course.instructor || 'education', 'course', 'learning', siteConfig.name],
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
  
  let courseJsonLd = null;
  if (course) {
    courseJsonLd = {
      '@context': 'https://schema.org',
      '@type': 'Course',
      name: course.title,
      description: course.description,
      image: course.imageUrl || undefined,
      provider: {
        '@type': 'Organization',
        name: siteConfig.name,
        url: siteConfig.url,
      },
      ...(course.instructor && {
        author: {
          '@type': 'Person',
          name: course.instructor,
        },
      }),
      ...(course.price && course.price > 0 && course.currency && {
          offers: {
            "@type": "Offer",
            "price": course.price.toFixed(2),
            "priceCurrency": course.currency,
            "availability": "https://schema.org/OnlineOnly", // Assuming online only
            "url": `${siteConfig.url}/courses/${course.id}` // URL to the course page
          }
      })
    };
  }

  return (
    <>
      {courseJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(courseJsonLd) }}
        />
      )}
      <CourseDetailClient initialCourse={course} courseId={params.id} />
    </>
  );
}
