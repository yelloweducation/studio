
"use client";
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { serverUpdateUserProfile, serverChangeCurrentUserPassword } from '@/actions/authActions';
import { Loader2, UserCircle, Lock, Save, Image as ImageIcon } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from '@/contexts/LanguageContext';
import type { User as PrismaUserType } from '@prisma/client';


const profileFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  bio: z.string().max(500, "Bio can be up to 500 characters.").optional().nullable(),
  avatarUrl: z.string().url({ message: "Please enter a valid URL." }).optional().nullable(),
});
type ProfileFormValues = z.infer<typeof profileFormSchema>;

const passwordFormSchema = z.object({
  currentPassword: z.string().min(1, { message: "Current password is required." }),
  newPassword: z.string().min(6, { message: "New password must be at least 6 characters." }),
  confirmNewPassword: z.string(),
}).refine(data => data.newPassword === data.confirmNewPassword, {
  message: "New passwords don't match.",
  path: ["confirmNewPassword"],
});
type PasswordFormValues = z.infer<typeof passwordFormSchema>;

const settingsTranslations = {
  en: {
    pageTitle: "Account Settings",
    pageDescription: "Manage your profile information and password.",
    profileTab: "Profile",
    securityTab: "Security",
    updateProfileTitle: "Update Profile",
    updateProfileDescription: "Change your name, bio, or avatar URL.",
    nameLabel: "Full Name",
    bioLabel: "Bio (Optional)",
    bioPlaceholder: "Tell us a little about yourself...",
    avatarUrlLabel: "Avatar URL (Optional)",
    avatarUrlPlaceholder: "https://example.com/avatar.png",
    saveProfileButton: "Save Profile Changes",
    savingProfileButton: "Saving...",
    profileUpdateSuccess: "Profile updated successfully!",
    profileUpdateError: "Failed to update profile.",
    changePasswordTitle: "Change Password",
    changePasswordDescription: "Update your account password.",
    currentPasswordLabel: "Current Password",
    newPasswordLabel: "New Password",
    confirmNewPasswordLabel: "Confirm New Password",
    updatePasswordButton: "Update Password",
    updatingPasswordButton: "Updating...",
    passwordUpdateSuccess: "Password changed successfully!",
    passwordUpdateError: "Failed to change password.",
    passwordMismatchError: "Incorrect current password.",
    loadingUser: "Loading user data...",
  },
  my: {
    pageTitle: "အကောင့် ဆက်တင်များ",
    pageDescription: "သင်၏ ပရိုဖိုင်အချက်အလက်နှင့် စကားဝှက်ကို စီမံပါ။",
    profileTab: "ပရိုဖိုင်",
    securityTab: "လုံခြုံရေး",
    updateProfileTitle: "ပရိုဖိုင် အပ်ဒိတ်လုပ်ရန်",
    updateProfileDescription: "သင်၏အမည်၊ ကိုယ်ရေးအကျဉ်း သို့မဟုတ် ကိုယ်ပွားရုပ်ပုံ URL ကို ပြောင်းလဲပါ။",
    nameLabel: "အမည်အပြည့်အစုံ",
    bioLabel: "ကိုယ်ရေးအကျဉ်း (ရွေးချယ်နိုင်)",
    bioPlaceholder: "သင့်အကြောင်း အနည်းငယ် ပြောပြပါ...",
    avatarUrlLabel: "ကိုယ်ပွားရုပ်ပုံ URL (ရွေးချယ်နိုင်)",
    avatarUrlPlaceholder: "https://example.com/avatar.png",
    saveProfileButton: "ပရိုဖိုင် အပြောင်းအလဲများ သိမ်းဆည်းရန်",
    savingProfileButton: "သိမ်းဆည်းနေသည်...",
    profileUpdateSuccess: "ပရိုဖိုင်ကို အောင်မြင်စွာ အပ်ဒိတ်လုပ်ပြီးပါပြီ!",
    profileUpdateError: "ပရိုဖိုင် အပ်ဒိတ်လုပ်ရန် မအောင်မြင်ပါ။",
    changePasswordTitle: "စကားဝှက် ပြောင်းရန်",
    changePasswordDescription: "သင်၏အကောင့် စကားဝှက်ကို အပ်ဒိတ်လုပ်ပါ။",
    currentPasswordLabel: "လက်ရှိ စကားဝှက်",
    newPasswordLabel: "စကားဝှက်အသစ်",
    confirmNewPasswordLabel: "စကားဝှက်အသစ်ကို အတည်ပြုပါ",
    updatePasswordButton: "စကားဝှက် အပ်ဒိတ်လုပ်ရန်",
    updatingPasswordButton: "အပ်ဒိတ်လုပ်နေသည်...",
    passwordUpdateSuccess: "စကားဝှက်ကို အောင်မြင်စွာ ပြောင်းလဲပြီးပါပြီ!",
    passwordUpdateError: "စကားဝှက် ပြောင်းလဲရန် မအောင်မြင်ပါ။",
    passwordMismatchError: "လက်ရှိ စကားဝှက် မှားနေပါသည်။",
    loadingUser: "အသုံးပြုသူ အချက်အလက် တင်နေသည်...",
  }
};

export default function SettingsClient() {
  const { user, loading: authLoading, updateContextUser } = useAuth();
  const { toast } = useToast();
  const { language } = useLanguage();
  const t = settingsTranslations[language];

  const [isProfileSubmitting, setIsProfileSubmitting] = useState(false);
  const [isPasswordSubmitting, setIsPasswordSubmitting] = useState(false);

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: '',
      bio: '',
      avatarUrl: '',
    },
  });

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    },
  });

  useEffect(() => {
    if (user) {
      profileForm.reset({
        name: user.name || '',
        bio: user.bio || '',
        avatarUrl: user.avatarUrl || '',
      });
    }
  }, [user, profileForm]);

  const handleProfileSubmit = async (values: ProfileFormValues) => {
    if (!user) return;
    setIsProfileSubmitting(true);
    try {
      const updatedUser = await serverUpdateUserProfile(user.id, {
        name: values.name,
        bio: values.bio,
        avatarUrl: values.avatarUrl,
      });
      if (updatedUser) {
        updateContextUser(updatedUser); // Update context
        toast({ title: t.profileUpdateSuccess });
      } else {
        toast({ variant: "destructive", title: t.profileUpdateError });
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: t.profileUpdateError, description: error.message });
    } finally {
      setIsProfileSubmitting(false);
    }
  };

  const handlePasswordSubmit = async (values: PasswordFormValues) => {
    if (!user) return;
    setIsPasswordSubmitting(true);
    try {
      const result = await serverChangeCurrentUserPassword(user.id, {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
        confirmNewPassword: values.confirmNewPassword,
      });
      if (result.success) {
        toast({ title: t.passwordUpdateSuccess });
        passwordForm.reset(); // Clear form on success
      } else {
        toast({ variant: "destructive", title: t.passwordUpdateError, description: result.message });
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: t.passwordUpdateError, description: error.message });
    } finally {
      setIsPasswordSubmitting(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="flex justify-center items-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-muted-foreground">{t.loadingUser}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <header>
        <h1 className="text-2xl md:text-3xl font-headline font-semibold">{t.pageTitle}</h1>
        <p className="text-muted-foreground">{t.pageDescription}</p>
      </header>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="profile">{t.profileTab}</TabsTrigger>
          <TabsTrigger value="security">{t.securityTab}</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center">
                <UserCircle className="mr-2 h-5 w-5 text-primary" /> {t.updateProfileTitle}
              </CardTitle>
              <CardDescription>{t.updateProfileDescription}</CardDescription>
            </CardHeader>
            <Form {...profileForm}>
              <form onSubmit={profileForm.handleSubmit(handleProfileSubmit)}>
                <CardContent className="space-y-4">
                  <FormField
                    control={profileForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t.nameLabel}</FormLabel>
                        <FormControl>
                          <Input placeholder="Your full name" {...field} disabled={isProfileSubmitting} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={profileForm.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t.bioLabel}</FormLabel>
                        <FormControl>
                          <Textarea placeholder={t.bioPlaceholder} {...field} value={field.value ?? ''} disabled={isProfileSubmitting} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={profileForm.control}
                    name="avatarUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center">
                          <ImageIcon className="mr-2 h-4 w-4 text-muted-foreground" /> {t.avatarUrlLabel}
                        </FormLabel>
                        <FormControl>
                          <Input type="url" placeholder={t.avatarUrlPlaceholder} {...field} value={field.value ?? ''} disabled={isProfileSubmitting} />
                        </FormControl>
                        <FormMessage />
                         {field.value && <img src={field.value} alt="Avatar Preview" className="mt-2 h-20 w-20 rounded-full object-cover border" />}
                      </FormItem>
                    )}
                  />
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={isProfileSubmitting} className="w-full sm:w-auto">
                    {isProfileSubmitting ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{t.savingProfileButton}</>
                    ) : (
                      <><Save className="mr-2 h-4 w-4" />{t.saveProfileButton}</>
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Lock className="mr-2 h-5 w-5 text-primary" /> {t.changePasswordTitle}
              </CardTitle>
              <CardDescription>{t.changePasswordDescription}</CardDescription>
            </CardHeader>
            <Form {...passwordForm}>
              <form onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)}>
                <CardContent className="space-y-4">
                  <FormField
                    control={passwordForm.control}
                    name="currentPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t.currentPasswordLabel}</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} disabled={isPasswordSubmitting} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={passwordForm.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t.newPasswordLabel}</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} disabled={isPasswordSubmitting} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={passwordForm.control}
                    name="confirmNewPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t.confirmNewPasswordLabel}</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} disabled={isPasswordSubmitting} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={isPasswordSubmitting} className="w-full sm:w-auto">
                    {isPasswordSubmitting ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{t.updatingPasswordButton}</>
                    ) : (
                      <><Save className="mr-2 h-4 w-4" />{t.updatePasswordButton}</>
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
