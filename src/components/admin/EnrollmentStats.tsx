
"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Users, BookOpen, Activity, Info } from 'lucide-react';
import { enrollments, users, courses } from '@/data/mockData'; // Using mock data for now

export default function EnrollmentStats() {
  const totalUsers = users.length;
  const totalCourses = courses.length;
  const totalEnrollments = enrollments.length;
  // Note: In a real app, these would be dynamic calculations based on live data.

  // Placeholder for more detailed stats if needed later
  // const activeCourses = courses.filter(c => c.modules && c.modules.length > 0).length;
  // const averageProgress = totalEnrollments > 0 
  //   ? enrollments.reduce((acc, curr) => acc + curr.progress, 0) / totalEnrollments 
  //   : 0;


  if (totalCourses === 0 && !courses) { // Check if courses feature is disabled implicitly
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
                    This feature is dependent on course data, which is currently disabled or not available.
                </p>
            </div>
        </CardContent>
        </Card>
    );
  }


  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center text-xl md:text-2xl font-headline">
            <BarChart3 className="mr-2 md:mr-3 h-6 w-6 md:h-7 md:w-7 text-primary" /> Enrollment Statistics
        </CardTitle>
        <CardDescription>Overview of user activity based on current data.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="bg-card hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalUsers}</div>
              <p className="text-xs text-muted-foreground">Registered users on the platform.</p>
            </CardContent>
          </Card>
          <Card className="bg-card hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCourses}</div>
              <p className="text-xs text-muted-foreground">Available courses.</p>
            </CardContent>
          </Card>
          <Card className="bg-card hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Enrollments</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalEnrollments}</div>
              <p className="text-xs text-muted-foreground">Across all courses.</p>
            </CardContent>
          </Card>
        </div>
        {/* Add more detailed charts or stats visualizations here if needed */}
         <p className="text-sm text-center text-muted-foreground pt-4">
            More detailed statistics and charts will be available in future updates.
        </p>
      </CardContent>
    </Card>
  );
}
