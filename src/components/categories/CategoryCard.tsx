
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { Category } from '@/lib/dbUtils'; 
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import * as LucideIcons from 'lucide-react';
import { isValidLucideIcon } from '@/lib/utils'; 

interface CategoryCardProps {
  category: Category;
}

const CategoryCard = React.memo(({ category }: CategoryCardProps) => {
  const IconComponent = category.iconName && isValidLucideIcon(category.iconName) 
    ? LucideIcons[category.iconName] as React.ElementType 
    : LucideIcons.Shapes; 

  return (
    <Link href={`/courses/search?category=${encodeURIComponent(category.name)}`} passHref> 
      <Card className="group flex flex-col items-center justify-start text-center p-0 rounded-lg shadow-lg hover:shadow-xl active:shadow-md transform hover:-translate-y-1 active:translate-y-px transition-all duration-150 h-full overflow-hidden cursor-pointer">
        {category.imageUrl && (
          <div className="w-full h-24 sm:h-32 relative">
            <Image
              src={category.imageUrl}
              alt={category.name}
              layout="fill"
              objectFit="cover"
              data-ai-hint={category.dataAiHint || 'category item'}
              className="rounded-t-lg"
            />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-150"></div>
          </div>
        )}
        <CardHeader className="p-3 pt-4 flex-grow w-full">
          <CardTitle className="text-sm sm:text-md font-semibold font-headline flex flex-col items-center justify-center">
            <IconComponent className="mb-1 h-5 w-5 sm:h-6 sm:w-6 text-primary group-hover:text-accent transition-colors" />
            {category.name}
          </CardTitle>
        </CardHeader>
      </Card>
    </Link>
  );
});

CategoryCard.displayName = 'CategoryCard';

export default CategoryCard;
