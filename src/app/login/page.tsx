
import type { Metadata } from 'next';
import { LoginForm } from "@/components/auth/LoginForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
// Note: useLanguage hook cannot be used in Server Components directly.
// For this simple page, translations are directly embedded or passed to client components.
// We'll keep the existing translation approach within the client component for now.

export const metadata: Metadata = {
  title: 'Login | Yellow Institute',
  description: 'Login to your Yellow Institute account to access your courses and learning materials.',
};

// This is now a Server Component
export default function LoginPageContainer() {
  // For simplicity, the translations will still be handled by the LoginForm client component.
  // If more server-side translated text was needed here, it would be added directly.
  const loginPageTranslations = {
    en: {
      title: "Login to Yellow Institute",
      description: "Enter your credentials to access your account.",
      noAccount: "Don't have an account?",
      registerHere: "Register here"
    },
    my: {
      title: "Yellow Institute သို့ လော့ဂ်အင်ဝင်ပါ",
      description: "သင်၏အကောင့်သို့ဝင်ရောက်ရန် သင်၏အထောက်အထားများ ထည့်သွင်းပါ။",
      noAccount: "အကောင့်မရှိသေးဘူးလား?",
      registerHere: "ဤနေရာတွင် စာရင်းသွင်းပါ"
    }
  };
  // For this page, we'll assume a default or single language for server-rendered parts,
  // or pass translations to client components if they need more dynamic text from here.
  // Since LoginForm handles its own text, this is okay.
  const t = loginPageTranslations.en; // Example: default to English for server static parts

  return (
    <div className="flex flex-col flex-grow justify-center items-center pt-6 pb-12 sm:pt-12 sm:pb-12">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          {/* For multi-language support in server components, you'd use a library or pass lang prop */}
          <CardTitle className="text-3xl font-headline">{t.title}</CardTitle>
          <CardDescription>{t.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm /> {/* LoginForm is a client component and can use useLanguage */}
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
