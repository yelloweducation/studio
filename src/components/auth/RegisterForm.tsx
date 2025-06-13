
"use client";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { UserPlus, Loader2 } from "lucide-react"; // Added Loader2
import React, { useState, useEffect } from 'react'; 
import type { User as PrismaUserType } from '@prisma/client';
import { useLanguage } from '@/contexts/LanguageContext'; // Added

const registerSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

const registerFormTranslations = {
  en: {
    nameLabel: "Full Name",
    namePlaceholder: "John Doe",
    emailLabel: "Email",
    emailPlaceholder: "john.doe@example.com",
    passwordLabel: "Password",
    passwordPlaceholder: "••••••••",
    confirmPasswordLabel: "Confirm Password",
    registerButton: "Register",
    processingButton: "Processing...",
    toastSuccessTitle: "Registration Successful",
    toastSuccessDescription: (name: string) => `Welcome, ${name}!`,
    toastFailureTitle: "Registration Failed",
    toastFailureDescription: "Please check your details and try again.",
    toastErrorTitle: "Registration Error",
    toastErrorUserExists: "This email address is already in use.",
    toastErrorUserCreation: "Could not create user. Please try again.",
    toastErrorUnexpected: "An unexpected error occurred during registration.",
    toastStateIssueTitle: "Registration State Issue",
    toastStateIssueDescription: "Please try logging in manually.",
  },
  my: {
    nameLabel: "အမည်အပြည့်အစုံ",
    namePlaceholder: "ဥပမာ - အောင်အောင်",
    emailLabel: "အီးမေးလ်",
    emailPlaceholder: "john.doe@example.com",
    passwordLabel: "စကားဝှက်",
    passwordPlaceholder: "••••••••",
    confirmPasswordLabel: "စကားဝှက်ကို အတည်ပြုပါ",
    registerButton: "စာရင်းသွင်းရန်",
    processingButton: "လုပ်ဆောင်နေသည်...",
    toastSuccessTitle: "စာရင်းသွင်းခြင်း အောင်မြင်သည်",
    toastSuccessDescription: (name: string) => `${name}၊ ကြိုဆိုပါသည်။`,
    toastFailureTitle: "စာရင်းသွင်းခြင်း မအောင်မြင်ပါ",
    toastFailureDescription: "သင်၏အချက်အလက်များကို စစ်ဆေးပြီး ထပ်မံကြိုးစားပါ။",
    toastErrorTitle: "စာရင်းသွင်းခြင်း အမှား",
    toastErrorUserExists: "ဤအီးမေးလ်လိပ်စာကို အသုံးပြုပြီးသားဖြစ်ပါသည်။",
    toastErrorUserCreation: "အသုံးပြုသူကို ဖန်တီး၍မရပါ။ ထပ်မံကြိုးစားပါ။",
    toastErrorUnexpected: "စာရင်းသွင်းနေစဉ် မမျှော်လင့်သော အမှားတစ်ခု ဖြစ်ပွားခဲ့သည်။",
    toastStateIssueTitle: "စာရင်းသွင်းမှု အခြေအနေ ပြဿနာ",
    toastStateIssueDescription: "ကျေးဇူးပြု၍ ကိုယ်တိုင်လော့ဂ်အင်ဝင်ကြည့်ပါ။",
  }
};


export function RegisterForm() {
  const { register, isAuthenticated, loading: authLoading } = useAuth(); 
  const router = useRouter();
  const { toast } = useToast();
  const [registrationSuccessUser, setRegistrationSuccessUser] = useState<PrismaUserType | null>(null);
  const { language } = useLanguage(); // Added
  const t = registerFormTranslations[language]; // Added

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit: SubmitHandler<RegisterFormValues> = async (data) => {
    setRegistrationSuccessUser(null); 
    try {
      const user = await register(data.name, data.email, data.password);
      if (user) {
        setRegistrationSuccessUser(user);
      } else {
        toast({ variant: "destructive", title: t.toastFailureTitle, description: t.toastFailureDescription });
      }
    } catch (error: any) {
      let errorMessage = t.toastErrorUnexpected;
      if (error.message === "UserAlreadyExists") {
        errorMessage = t.toastErrorUserExists;
      } else if (error.message === "UserCreationFailure") {
        errorMessage = t.toastErrorUserCreation;
      } else if (error.message) {
        errorMessage = error.message; // Use specific error message if available
      }
      toast({ variant: "destructive", title: t.toastErrorTitle, description: errorMessage });
      setRegistrationSuccessUser(null); 
    }
  };

  useEffect(() => {
    if (registrationSuccessUser && isAuthenticated && !authLoading) {
      toast({ title: t.toastSuccessTitle, description: t.toastSuccessDescription(registrationSuccessUser.name!) });
      router.push('/dashboard/student');
      setRegistrationSuccessUser(null); 
    } else if (registrationSuccessUser && !isAuthenticated && !authLoading) {
      console.warn("Registration successful, but AuthContext.isAuthenticated is false after loading.");
      toast({ variant: "destructive", title: t.toastStateIssueTitle, description: t.toastStateIssueDescription });
      router.push('/login'); 
      setRegistrationSuccessUser(null); 
    }
  }, [registrationSuccessUser, isAuthenticated, authLoading, router, toast, t]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t.nameLabel}</FormLabel>
              <FormControl>
                <Input placeholder={t.namePlaceholder} {...field} disabled={form.formState.isSubmitting || authLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t.emailLabel}</FormLabel>
              <FormControl>
                <Input type="email" placeholder={t.emailPlaceholder} {...field} disabled={form.formState.isSubmitting || authLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t.passwordLabel}</FormLabel>
              <FormControl>
                <Input type="password" placeholder={t.passwordPlaceholder} {...field} disabled={form.formState.isSubmitting || authLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t.confirmPasswordLabel}</FormLabel>
              <FormControl>
                <Input type="password" placeholder={t.passwordPlaceholder} {...field} disabled={form.formState.isSubmitting || authLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-md hover:shadow-sm active:translate-y-px transition-all duration-150" disabled={form.formState.isSubmitting || authLoading}>
          {form.formState.isSubmitting || authLoading ? (
            <><Loader2 className="mr-2 h-5 w-5 animate-spin" />{t.processingButton}</>
          ) : (
            <><UserPlus className="mr-2 h-5 w-5" /> {t.registerButton}</>
          )}
        </Button>
      </form>
    </Form>
  );
}
