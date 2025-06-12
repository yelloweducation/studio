
import React from 'react';
import type { Course } from '@/lib/dbUtils'; // Changed import from mockData to dbUtils (Prisma type)
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookMarked, Users, ExternalLink } from 'lucide-react';

interface CourseCardProps {
  course: Course; // This will now be the Prisma Course type
}

const CourseCard = React.memo(({ course }: CourseCardProps) => {
  return (
    <Card className="flex flex-col overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 h-full">
      <CardHeader className="p-0">
        {course.imageUrl && (
          <div className="aspect-[16/9] relative w-full">
            <Image 
              src={course.imageUrl} 
              alt={course.title} 
              layout="fill" 
              objectFit="cover" 
              data-ai-hint={course.dataAiHint || 'education learning'}
            />
          </div>
        )}
        <div className="p-6">
          <CardTitle className="font-headline text-xl mb-1">{course.title}</CardTitle>
          <CardDescription className="text-sm text-muted-foreground flex items-center">
            <BookMarked size={16} className="mr-2 text-primary" /> {course.categoryNameCache || 'Uncategorized'} {/* Use categoryNameCache */}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="flex-grow px-6 pb-4">
        <p className="text-sm text-foreground/80 mb-3 line-clamp-3">{course.description}</p> {/* Added line-clamp */}
        <div className="text-xs text-muted-foreground flex items-center">
          <Users size={14} className="mr-2 text-primary" /> Instructor: {course.instructor}
        </div>
      </CardContent>
      <CardFooter className="px-6 pb-6">
        <Button asChild className="w-full bg-accent text-accent-foreground hover:bg-accent/90 shadow-md hover:shadow-sm active:translate-y-px transition-all duration-150">
          <Link href={`/courses/${course.id}`}>View Course <ExternalLink size={16} className="ml-2" /></Link>
        </Button>
      </CardFooter>
    </Card>
  );
});

CourseCard.displayName = 'CourseCard';

export default CourseCard;
