
"use client"; // Make it a client component to use hooks
import { LoginForm } from "@/components/auth/LoginForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useLanguage, type Language } from '@/contexts/LanguageContext'; // Added

const loginPageTranslations = {
  en: {
    title: "Login to Yellow Institute",
    description: "Enter your credentials to access your account.",
    noAccount: "Don't have an account?",
    registerHere: "Register here"
  },
  my: {
    title: "Yellow Institute သို့ လော့ဂ်အင်ဝင်ပါ", // Login to Yellow Institute
    description: "သင်၏အကောင့်သို့ဝင်ရောက်ရန် သင်၏အထောက်အထားများ ထည့်သွင်းပါ။", // Enter your credentials to access your account.
    noAccount: "အကောင့်မရှိသေးဘူးလား?", // Don't have an account?
    registerHere: "ဤနေရာတွင် စာရင်းသွင်းပါ" // Register here
  }
};

export default function LoginPage() {
  const { language } = useLanguage(); // Added
  const t = loginPageTranslations[language]; // Added

  return (
    <div className="flex flex-col flex-grow justify-center items-center pt-6 pb-12 sm:pt-12 sm:pb-12">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-headline">{t.title}</CardTitle>
          <CardDescription>{t.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
          <p className="mt-6 text-center text-sm text-muted-foreground">
            {t.noAccount}{' '}
            <Button variant="link" asChild className="text-primary p-0 h-auto">
              <Link href="/register">{t.registerHere}</Link>
            </Button>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
