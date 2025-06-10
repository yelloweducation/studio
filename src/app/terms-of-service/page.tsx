
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';

export default function TermsOfServicePage() {
  return (
    <div className="max-w-2xl mx-auto py-8">
      <Button variant="outline" asChild className="mb-6">
        <Link href="/">
          <ChevronLeft className="mr-2 h-4 w-4" /> Back to Home
        </Link>
      </Button>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl md:text-3xl font-headline">Terms of Service</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Welcome to the Yellow Institute Terms of Service. By accessing or using our platform,
            you agree to be bound by these terms.
          </p>
          <h3 className="text-lg font-semibold font-headline pt-2">1. Account Registration</h3>
          <p>
            You must provide accurate information when creating an account. You are responsible
            for maintaining the confidentiality of your account and password.
          </p>
          <h3 className="text-lg font-semibold font-headline pt-2">2. Course Enrollment and Access</h3>
          <p>
            Course enrollment may be subject to payment. We grant you a limited, non-exclusive,
            non-transferable license to access and view the course content for which you have
            paid all required fees.
          </p>
          <h3 className="text-lg font-semibold font-headline pt-2">3. User Conduct</h3>
          <p>
            You agree not to use the platform for any unlawful purpose or in any way that
            could damage, disable, overburden, or impair the platform.
          </p>
          <h3 className="text-lg font-semibold font-headline pt-2">4. Intellectual Property</h3>
          <p>
            All content on the platform, including courses, text, graphics, logos, and software,
            is the property of Yellow Institute or its content suppliers and protected by
            international copyright laws.
          </p>
           <h3 className="text-lg font-semibold font-headline pt-2">5. Disclaimers</h3>
          <p>
            The platform and its content are provided "as is" without warranty of any kind.
            We do not guarantee that the platform will be error-free or uninterrupted.
          </p>
          <h3 className="text-lg font-semibold font-headline pt-2">6. Changes to Terms</h3>
          <p>
            We reserve the right to modify these terms at any time. Your continued use of the
            platform after such changes constitutes your acceptance of the new terms.
          </p>
          <p className="text-sm text-muted-foreground pt-4">
            This is a placeholder Terms of Service. More detailed content will be added here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
