
"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Construction } from 'lucide-react'; // Using a different icon

export default function CourseManagement() {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center text-xl md:text-2xl font-headline">
          <Construction className="mr-2 md:mr-3 h-6 w-6 md:h-7 md:w-7 text-primary" /> Course Management
        </CardTitle>
        <CardDescription>Course management features are currently unavailable.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-center text-muted-foreground py-4">
          The functionality to add, edit, or delete courses has been temporarily disabled.
        </p>
      </CardContent>
    </Card>
  );
}
