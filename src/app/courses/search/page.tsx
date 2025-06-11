
// This file is now a Server Component
import type { Metadata } from 'next';
import React, { Suspense } from 'react'; // Added React
import SearchCoursesClient from './search-client'; // We will create this client component

export const metadata: Metadata = {
  title: 'Explore Courses | Yellow Institute',
  description: 'Search and discover a wide range of online courses in technology, business, and more. Find your next learning adventure at Yellow Institute.',
  keywords: ['courses', 'search courses', 'online learning', 'education', 'find courses', 'Yellow Institute'],
};

// This is the Server Component that Next.js will render for the page.
export default function SearchCoursesPageContainer() { // Renamed from SearchCoursesPage
  // It renders the Client Component which handles the actual UI and client-side logic.
  return (
    <Suspense fallback={<SearchPageInitialSkeleton />}>
      <SearchCoursesClient />
    </Suspense>
  );
}

// Skeleton can remain here or be moved to the client component, but for Suspense it's fine here
function SearchPageInitialSkeleton() {
  // ... (keep existing skeleton code)
  // NOTE: For brevity, the full skeleton code from the original file is assumed here.
  // If it was in the original `SearchCoursesPage` function, it should be kept or moved appropriately.
  // For this example, I'm assuming it's part of the server component.
  return (
    <div className="space-y-4 md:space-y-6 pt-0"> 
      <section className="pb-4 md:pb-6 border-b">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4 items-end">
          <div className="md:col-span-2">
            <div className="h-4 w-1/4 mb-1 rounded-md bg-muted animate-pulse" />
            <div className="h-10 w-full rounded-md bg-muted animate-pulse" />
          </div>
          <div>
            <div className="h-4 w-1/4 mb-1 rounded-md bg-muted animate-pulse" />
            <div className="h-10 w-full rounded-md bg-muted animate-pulse" />
          </div>
        </div>
      </section>
       <section className="py-4 md:py-6">
         <div className="h-7 w-1/3 mb-4 rounded-md bg-muted animate-pulse" /> 
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3].map(i => <div key={`feat-skel-${i}`} className="h-72 w-full rounded-lg bg-muted animate-pulse" />)}
         </div>
       </section>
       <section className="py-4 md:py-6">
        <div className="h-7 w-1/2 mb-4 rounded-md bg-muted animate-pulse" /> 
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={`cat-skel-${i}`} className="bg-card rounded-lg shadow-md animate-pulse">
                <div className="w-full h-24 sm:h-32 rounded-t-lg bg-muted" />
                <div className="p-3 pt-4">
                  <div className="h-5 w-3/4 mx-auto rounded-md bg-muted" />
                </div>
              </div>
            ))}
          </div>
      </section>
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {[1, 2, 3].map(i => (
          <div key={`course-skel-${i}`} className="flex flex-col overflow-hidden shadow-lg rounded-lg bg-card animate-pulse">
            <div className="p-0">
              <div className="aspect-[16/9] w-full bg-muted" />
              <div className="p-6">
                <div className="h-6 w-3/4 mb-2 rounded-md bg-muted" />
                <div className="h-4 w-1/2 rounded-md bg-muted" />
              </div>
            </div>
            <div className="flex-grow px-6 pb-4">
              <div className="h-4 w-full mb-1 rounded-md bg-muted" />
              <div className="h-4 w-5/6 mb-3 rounded-md bg-muted" />
              <div className="h-3 w-1/3 rounded-md bg-muted" />
            </div>
            <div className="px-6 pb-6">
              <div className="h-10 w-full rounded-md bg-muted" />
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
