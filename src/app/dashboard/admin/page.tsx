
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
import LearningPathManagement from "@/components/admin/LearningPathManagement";
import DataSeeding from "@/components/admin/DataSeeding"; // Added
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, BarChart3, Settings as SettingsIcon, Video as VideoIcon, Image as ImageIcon, Shapes, GraduationCap, Menu as MenuIcon, CreditCard, BookOpenCheck, DatabaseZap } from "lucide-react"; // Added DatabaseZap
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLanguage, type Language } from '@/contexts/LanguageContext';

const adminDashboardTranslations = {
  en: {
    title: "Admin Dashboard",
    description: "Manage your learning platform.",
    courses: "Courses",
    categories: "Categories",
    learningPaths: "Paths",
    payments: "Payments",
    paymentConfig: "Payment Config",
    videos: "Videos",
    images: "Images",
    users: "Users",
    stats: "Stats",
    dataSeed: "Data Seed", // Added
  },
  my: {
    title: "အက်ဒမင် ဒက်ရှ်ဘုတ်",
    description: "သင်၏ လေ့လာရေး ပလက်ဖောင်းကို စီမံပါ။",
    courses: "အတန်းများ",
    categories: "အမျိုးအစားများ",
    learningPaths: "လမ်းကြောင်းများ",
    payments: "ငွေပေးချေမှုများ",
    paymentConfig: "ငွေပေးချေမှု ဆက်တင်",
    videos: "ဗီဒီယိုများ",
    images: "ပုံများ",
    users: "အသုံးပြုသူများ",
    stats: "စာရင်းအင်း",
    dataSeed: "ဒေတာထည့်သွင်းရန်", // Added
  }
};

const adminTabsConfig = (t: typeof adminDashboardTranslations.en) => [
  { value: "courses", label: t.courses, Icon: GraduationCap },
  { value: "categories", label: t.categories, Icon: Shapes },
  { value: "learningPaths", label: t.learningPaths, Icon: BookOpenCheck },
  { value: "payments", label: t.payments, Icon: CreditCard },
  { value: "paymentSettings", label: t.paymentConfig, Icon: SettingsIcon },
  { value: "videos", label: t.videos, Icon: VideoIcon },
  { value: "images", label: t.images, Icon: ImageIcon },
  { value: "users", label: t.users, Icon: Users },
  { value: "stats", label: t.stats, Icon: BarChart3 },
  { value: "dataSeed", label: t.dataSeed, Icon: DatabaseZap }, // Added
];

export default function AdminDashboardPage() {
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState("courses");
  const { language } = useLanguage();
  const t = adminDashboardTranslations[language];
  const adminTabs = adminTabsConfig(t);

  const currentTab = adminTabs.find(tab => tab.value === activeTab) || adminTabs[0];

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div className="space-y-4 md:space-y-6">
        <section className="pb-2 border-b">
            <h1 className="text-xl md:text-2xl font-headline font-semibold flex items-center">
                <SettingsIcon className="mr-2 h-6 w-6 md:h-7 md:w-7 text-primary" /> {t.title}
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground">{t.description}</p>
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
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-10 gap-2 mb-6">
              {adminTabs.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="py-2.5 px-3 text-sm sm:text-base sm:py-3"
                >
                  <tab.Icon className="mr-1.5 h-4 w-4 sm:h-5 sm:w-5"/> {tab.label}
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
          <TabsContent value="dataSeed"> {/* Added */}
            <DataSeeding />
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedRoute>
  );
}
