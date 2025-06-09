
"use client";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import CourseManagement from "@/components/admin/CourseManagement";
import UserManagement from "@/components/admin/UserManagement";
import EnrollmentStats from "@/components/admin/EnrollmentStats";
import VideoManagement from "@/components/admin/VideoManagement"; // Added
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ListOrdered, Users, BarChart3, Settings, Video as VideoIcon } from "lucide-react"; // Added VideoIcon

export default function AdminDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div className="space-y-6 md:space-y-8">
        <section className="pb-4 border-b">
            <h1 className="text-2xl md:text-3xl font-headline font-semibold flex items-center">
                <Settings className="mr-2 md:mr-3 h-7 w-7 md:h-8 md:w-8 text-primary" /> Admin Dashboard
            </h1>
            <p className="text-sm md:text-base text-muted-foreground">Manage your learning platform.</p>
        </section>

        <Tabs defaultValue="courses" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 gap-2 mb-6">
            <TabsTrigger value="courses" className="py-2.5 px-3 text-sm sm:text-base sm:py-3">
              <ListOrdered className="mr-2 h-4 w-4 sm:h-5 sm:w-5"/> Manage Courses
            </TabsTrigger>
            <TabsTrigger value="videos" className="py-2.5 px-3 text-sm sm:text-base sm:py-3">
              <VideoIcon className="mr-2 h-4 w-4 sm:h-5 sm:w-5"/> Manage Videos
            </TabsTrigger>
            <TabsTrigger value="users" className="py-2.5 px-3 text-sm sm:text-base sm:py-3">
              <Users className="mr-2 h-4 w-4 sm:h-5 sm:w-5"/> Manage Users
            </TabsTrigger>
            <TabsTrigger value="stats" className="py-2.5 px-3 text-sm sm:text-base sm:py-3">
              <BarChart3 className="mr-2 h-4 w-4 sm:h-5 sm:w-5"/> View Stats
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="courses">
            <CourseManagement />
          </TabsContent>
          <TabsContent value="videos">
            <VideoManagement />
          </TabsContent>
          <TabsContent value="users">
            <UserManagement />
          </TabsContent>
          <TabsContent value="stats">
            <EnrollmentStats />
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedRoute>
  );
}
