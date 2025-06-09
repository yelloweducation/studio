
"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Info } from 'lucide-react';

export default function EnrollmentStats() {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center text-xl md:text-2xl font-headline">
            <BarChart3 className="mr-2 md:mr-3 h-6 w-6 md:h-7 md:w-7 text-primary" /> Enrollment Statistics
        </CardTitle>
        <CardDescription>Overview of user activity.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4">
         <div className="flex flex-col items-center justify-center text-center p-4 sm:p-6 bg-muted/30 rounded-md">
            <Info className="h-10 w-10 text-primary mb-3" />
            <p className="text-md font-medium text-foreground">
                Enrollment statistics are currently unavailable.
            </p>
            <p className="text-sm text-muted-foreground mt-1">
                This feature is dependent on course data, which is currently disabled.
            </p>
        </div>
      </CardContent>
    </Card>
  );
}
