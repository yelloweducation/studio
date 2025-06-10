
"use client";
import React, { useState } from 'react';
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import CourseManagement from "@/components/admin/CourseManagement";
import UserManagement from "@/components/admin/UserManagement";
import EnrollmentStats from "@/components/admin/EnrollmentStats";
import VideoManagement from "@/components/admin/VideoManagement";
import ImageManagement from "@/components/admin/ImageManagement";
import CategoryManagement from "@/components/admin/CategoryManagement";
import PaymentSubmissions from "@/components/admin/PaymentSubmissions";
import PaymentSettingsManagement from "@/components/admin/PaymentSettingsManagement";
import LearningPathManagement from "@/components/admin/LearningPathManagement"; // Added
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, BarChart3, Settings as SettingsIcon, Video as VideoIcon, Image as ImageIcon, Shapes, GraduationCap, Menu as MenuIcon, CreditCard, BookOpenCheck } from "lucide-react"; // Added BookOpenCheck
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const adminTabs = [
  { value: "courses", label: "Courses", Icon: GraduationCap },
  { value: "categories", label: "Categories", Icon: Shapes },
  { value: "learningPaths", label: "Paths", Icon: BookOpenCheck }, // Added
  { value: "payments", label: "Payments", Icon: CreditCard },
  { value: "paymentSettings", label: "Payment Config", Icon: SettingsIcon },
  { value: "videos", label: "Videos", Icon: VideoIcon },
  { value: "images", label: "Images", Icon: ImageIcon },
  { value: "users", label: "Users", Icon: Users },
  { value: "stats", label: "Stats", Icon: BarChart3 },
];

export default function AdminDashboardPage() {
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState("courses");

  const currentTab = adminTabs.find(tab => tab.value === activeTab) || adminTabs[0];

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div className="space-y-4 md:space-y-6">
        <section className="pb-2 border-b">
            <h1 className="text-xl md:text-2xl font-headline font-semibold flex items-center">
                <SettingsIcon className="mr-2 h-6 w-6 md:h-7 md:w-7 text-primary" /> Admin Dashboard
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground">Manage your learning platform.</p>
        </section>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {isMobile ? (
            <div className="mb-6">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-between text-base py-3">
                    <span>
                      <currentTab.Icon className="mr-2 h-5 w-5 inline-block" />
                      {currentTab.label}
                    </span>
                    <MenuIcon className="h-5 w-5 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-full max-w-[calc(100vw-2rem)] sm:w-72">
                  {adminTabs.map((tab) => (
                    <DropdownMenuItem
                      key={tab.value}
                      onSelect={() => setActiveTab(tab.value)}
                      className={`py-2.5 px-3 text-base ${activeTab === tab.value ? 'bg-accent text-accent-foreground' : ''}`}
                    >
                      <tab.Icon className="mr-2 h-5 w-5"/> {tab.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-2 mb-6"> {/* Adjusted grid-cols for new tab */}
              {adminTabs.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="py-2.5 px-3 text-sm sm:text-base sm:py-3"
                >
                  <tab.Icon className="mr-2 h-4 w-4 sm:h-5 sm:w-5"/> {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          )}

          <TabsContent value="courses">
            <CourseManagement />
          </TabsContent>
          <TabsContent value="categories">
            <CategoryManagement />
          </TabsContent>
          <TabsContent value="learningPaths">
            <LearningPathManagement />
          </TabsContent>
           <TabsContent value="payments">
            <PaymentSubmissions />
          </TabsContent>
          <TabsContent value="paymentSettings">
            <PaymentSettingsManagement />
          </TabsContent>
          <TabsContent value="videos">
            <VideoManagement />
          </TabsContent>
          <TabsContent value="images">
            <ImageManagement />
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
