
import type { Metadata } from 'next';
import { RegisterForm } from "@/components/auth/RegisterForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: 'Register | Yellow Institute',
  description: 'Create an account with Yellow Institute to start your learning journey today. Join our community of learners and educators.',
};

// This is now a Server Component
export default function RegisterPageContainer() {
  const registerPageTranslations = {
    en: {
      title: "Create your Yellow Institute Account",
      description: "Join our community of learners and educators.",
      hasAccount: "Already have an account?",
      loginHere: "Login here"
    },
    my: {
      title: "သင်၏ Yellow Institute အကောင့်ကို ဖန်တီးပါ",
      description: "ကျွန်ုပ်တို့၏ သင်ယူသူများနှင့် ပညာပေးသူများ အသိုင်းအဝိုင်းသို့ ချိတ်ဆက်ပါ။",
      hasAccount: "အကောင့်ရှိပြီးသားလား?",
      loginHere: "ဤနေရာတွင် လော့ဂ်အင်ဝင်ပါ"
    }
  };
  // Default to English for server static parts or implement a more complex i18n solution
  const t = registerPageTranslations.en; 

  return (
    <div className="flex flex-col flex-grow justify-center items-center pt-6 pb-12 sm:pt-12 sm:pb-12">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-headline">{t.title}</CardTitle>
          <CardDescription>{t.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <RegisterForm /> {/* RegisterForm is a client component and can use useLanguage */}
          <p className="mt-6 text-center text-sm text-muted-foreground">
            {t.hasAccount}{' '}
            <Button variant="link" asChild className="text-primary p-0 h-auto">
              <Link href="/login">{t.loginHere}</Link>
            </Button>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
