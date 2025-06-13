
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
import { LogIn, Loader2 } from "lucide-react"; // Added Loader2
import { useLanguage } from '@/contexts/LanguageContext'; // Added

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const loginFormTranslations = {
  en: {
    emailLabel: "Email",
    emailPlaceholder: "student@example.com",
    passwordLabel: "Password",
    passwordPlaceholder: "••••••••",
    loginButton: "Login",
    loggingInButton: "Logging in...",
    toastSuccessTitle: "Login Successful",
    toastSuccessDescription: (name: string) => `Welcome back, ${name}!`,
    toastFailureTitle: "Login Failed",
    toastFailureDescription: "Invalid email or password.",
    toastErrorTitle: "Login Error",
    toastErrorDescription: "An unexpected error occurred.",
  },
  my: {
    emailLabel: "အီးမေးလ်",
    emailPlaceholder: "student@example.com",
    passwordLabel: "စကားဝှက်",
    passwordPlaceholder: "••••••••",
    loginButton: "ဝင်ရန်",
    loggingInButton: "ဝင်ရောက်နေသည်...",
    toastSuccessTitle: "လော့ဂ်အင် အောင်မြင်သည်",
    toastSuccessDescription: (name: string) => `${name}၊ ပြန်လည်ကြိုဆိုပါသည်။`,
    toastFailureTitle: "လော့ဂ်အင် မအောင်မြင်ပါ",
    toastFailureDescription: "အီးမေးလ် သို့မဟုတ် စကားဝှက် မှားနေပါသည်။",
    toastErrorTitle: "လော့ဂ်အင် အမှား",
    toastErrorDescription: "မမျှော်လင့်သောအမှားတစ်ခု ဖြစ်ပွားခဲ့သည်။",
  }
};

export function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const { language } = useLanguage(); // Added
  const t = loginFormTranslations[language]; // Added

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit: SubmitHandler<LoginFormValues> = async (data) => {
    try {
      const user = await login(data.email, data.password);
      if (user) {
        toast({ title: t.toastSuccessTitle, description: t.toastSuccessDescription(user.name!) });
        if (user.role === 'admin') {
          router.push('/dashboard/admin');
        } else if (user.role === 'student') {
          router.push('/dashboard/student');
        } else {
          console.warn(`User ${user.name} logged in with an unexpected role: ${user.role}. Redirecting to home.`);
          router.push('/');
        }
      } else {
        toast({ variant: "destructive", title: t.toastFailureTitle, description: t.toastFailureDescription });
      }
    } catch (error) {
      toast({ variant: "destructive", title: t.toastErrorTitle, description: t.toastErrorDescription });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t.emailLabel}</FormLabel>
              <FormControl>
                <Input type="email" placeholder={t.emailPlaceholder} {...field} />
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
                <Input type="password" placeholder={t.passwordPlaceholder} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-md hover:shadow-sm active:translate-y-px transition-all duration-150" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? (
            <><Loader2 className="mr-2 h-5 w-5 animate-spin" />{t.loggingInButton}</>
          ) : (
            <><LogIn className="mr-2 h-5 w-5" /> {t.loginButton}</>
          )}
        </Button>
      </form>
    </Form>
  );
}
