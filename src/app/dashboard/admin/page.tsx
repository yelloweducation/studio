
"use client";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import CourseManagement from "@/components/admin/CourseManagement";
import UserManagement from "@/components/admin/UserManagement";
import EnrollmentStats from "@/components/admin/EnrollmentStats";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ListOrdered, Users, BarChart3, Settings } from "lucide-react";

export default function AdminDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div className="space-y-8">
        <section className="pb-4 border-b">
            <h1 className="text-3xl font-headline font-semibold flex items-center">
                <Settings className="mr-3 h-8 w-8 text-primary" /> Admin Dashboard
            </h1>
            <p className="text-muted-foreground">Manage your learning platform.</p>
        </section>

        <Tabs defaultValue="courses" className="w-full">
          <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 mb-6">
            <TabsTrigger value="courses" className="py-3 text-base">
              <ListOrdered className="mr-2 h-5 w-5"/> Manage Courses
            </TabsTrigger>
            <TabsTrigger value="users" className="py-3 text-base">
              <Users className="mr-2 h-5 w-5"/> Manage Users
            </TabsTrigger>
            <TabsTrigger value="stats" className="py-3 text-base">
              <BarChart3 className="mr-2 h-5 w-5"/> View Stats
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="courses">
            <CourseManagement />
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
