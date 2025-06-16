
"use client";
import React, { useState } from 'react';
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { Settings as SettingsIcon } from "lucide-react";
import CourseManagement from "@/components/admin/CourseManagement";
import UserManagement from "@/components/admin/UserManagement";
import EnrollmentStats from "@/components/admin/EnrollmentStats";
import ImageManagement from "@/components/admin/ImageManagement";
import CategoryManagement from "@/components/admin/CategoryManagement";
import PaymentSubmissions from "@/components/admin/PaymentSubmissions";
import PaymentSettingsManagement from "@/components/admin/PaymentSettingsManagement";
import LearningPathManagement from "@/components/admin/LearningPathManagement";
import QuizManagement from "@/components/admin/QuizManagement";
import DataSeeding from "@/components/admin/DataSeeding";
import SiteContentManagement from "@/components/admin/SiteContentManagement";
import VideoManagement from "@/components/admin/VideoManagement";
import CertificateManagement from "@/components/admin/CertificateManagement";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, BarChart3, ImageIcon as ImageIconLucide, Shapes, GraduationCap, Menu as MenuIcon, CreditCard, BookOpenCheck, DatabaseZap, FileText, PlaySquare, Award, FileQuestion } from "lucide-react";
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
    description: "Manage your learning platform. Data is sourced from your Neon/Postgres database via Prisma (videos from localStorage).",
    courses: "Courses",
    categories: "Categories",
    learningPaths: "Paths",
    quizzes: "Quizzes",
    payments: "Payments",
    paymentConfig: "Payment Config",
    videos: "Videos",
    images: "Images",
    users: "Users",
    stats: "Stats",
    dataSeed: "Data Seed",
    siteContent: "Site Content",
    certificates: "Certificates",
  },
  my: {
    title: "အက်ဒမင် ဒက်ရှ်ဘုတ်",
    description: "သင်၏ လေ့လာရေး ပလက်ဖောင်းကို စီမံပါ။ ဒေတာများကို Prisma မှတစ်ဆင့် သင်၏ Neon/Postgres ဒေတာဘေ့စ်မှ ရယူထားပါသည်။ (ဗီဒီယိုများ localStorage မှ)",
    courses: "အတန်းများ",
    categories: "အမျိုးအစားများ",
    learningPaths: "လမ်းကြောင်းများ",
    quizzes: "စာမေးပွဲငယ်များ",
    payments: "ငွေပေးချေမှုများ",
    paymentConfig: "ငွေပေးချေမှု ဆက်တင်",
    videos: "ဗီဒီယိုများ",
    images: "ပုံများ",
    users: "အသုံးပြုသူများ",
    stats: "စာရင်းအင်း",
    dataSeed: "ဒေတာထည့်သွင်းရန်",
    siteContent: "စာမျက်နှာ အကြောင်းအရာ",
    certificates: "လက်မှတ်များ",
  }
};

const adminTabsConfig = (t: typeof adminDashboardTranslations.en) => [
  { value: "courses", label: t.courses, Icon: GraduationCap, Component: CourseManagement },
  { value: "categories", label: t.categories, Icon: Shapes, Component: CategoryManagement },
  { value: "learningPaths", label: t.learningPaths, Icon: BookOpenCheck, Component: LearningPathManagement },
  { value: "quizzes", label: t.quizzes, Icon: FileQuestion, Component: QuizManagement },
  { value: "videos", label: t.videos, Icon: PlaySquare, Component: VideoManagement },
  { value: "images", label: t.images, Icon: ImageIconLucide, Component: ImageManagement },
  { value: "siteContent", label: t.siteContent, Icon: FileText, Component: SiteContentManagement },
  { value: "users", label: t.users, Icon: Users, Component: UserManagement },
  { value: "certificates", label: t.certificates, Icon: Award, Component: CertificateManagement },
  { value: "payments", label: t.payments, Icon: CreditCard, Component: PaymentSubmissions },
  { value: "paymentSettings", label: t.paymentConfig, Icon: SettingsIcon, Component: PaymentSettingsManagement },
  { value: "stats", label: t.stats, Icon: BarChart3, Component: EnrollmentStats },
  { value: "dataSeed", label: t.dataSeed, Icon: DatabaseZap, Component: DataSeeding },
];

export default function AdminDashboardPage() {
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState("courses");
  const { language } = useLanguage();
  const t = adminDashboardTranslations[language];
  const adminTabs = adminTabsConfig(t);

  const CurrentActiveTab = adminTabs.find(tab => tab.value === activeTab) || adminTabs[0];

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
                  <Button variant="outline" className="w-full justify-between text-base py-3 shadow-sm">
                    <span className="flex items-center">
                      <CurrentActiveTab.Icon className="mr-2 h-5 w-5 inline-block" />
                      {CurrentActiveTab.label}
                    </span>
                    <MenuIcon className="h-5 w-5 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-[calc(100vw-2rem)] max-w-xs sm:max-w-sm md:max-w-md">
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
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-12 gap-1 md:gap-2 mb-6 h-auto flex-wrap">
              {adminTabs.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="py-2 px-2.5 md:py-2.5 md:px-3 text-xs sm:text-sm h-auto whitespace-normal" 
                >
                  <tab.Icon className="mr-1.5 h-4 w-4"/> {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          )}

          {adminTabs.map((tab) => (
            <TabsContent key={tab.value} value={tab.value}>
              <tab.Component />
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </ProtectedRoute>
  );
}

    