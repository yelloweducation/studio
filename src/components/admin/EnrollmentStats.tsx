
"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';

export default function EnrollmentStats() {
  // In a real app, this would fetch and display actual stats.
  // For now, it's a placeholder.
  const totalEnrollments = 125; // Dummy data
  const activeStudents = 80;    // Dummy data
  const popularCourse = "Introduction to Web Development"; // Dummy data

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center text-2xl font-headline">
            <BarChart3 className="mr-3 h-7 w-7 text-primary" /> Enrollment Statistics
        </CardTitle>
        <CardDescription>Overview of course enrollments and user activity.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between p-3 bg-muted/50 rounded-md">
          <span className="font-medium">Total Enrollments:</span>
          <span className="text-primary font-semibold">{totalEnrollments}</span>
        </div>
        <div className="flex justify-between p-3 bg-muted/50 rounded-md">
          <span className="font-medium">Active Students:</span>
          <span className="text-primary font-semibold">{activeStudents}</span>
        </div>
        <div className="flex justify-between p-3 bg-muted/50 rounded-md">
          <span className="font-medium">Most Popular Course:</span>
          <span className="text-primary font-semibold">{popularCourse}</span>
        </div>
        <p className="text-sm text-muted-foreground text-center pt-4">
          More detailed statistics and charts would be available here.
        </p>
      </CardContent>
    </Card>
  );
}
