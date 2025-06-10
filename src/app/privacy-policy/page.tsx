
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-2xl mx-auto py-8">
      <Button variant="outline" asChild className="mb-6">
        <Link href="/">
          <ChevronLeft className="mr-2 h-4 w-4" /> Back to Home
        </Link>
      </Button>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl md:text-3xl font-headline">Privacy Policy</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Welcome to the Yellow Institute Privacy Policy page. Your privacy is important to us.
          </p>
          <p>
            This policy outlines how we collect, use, and protect your personal information
            when you use our platform and services. We are committed to ensuring that your
            information is secure and handled with care.
          </p>
          <h3 className="text-lg font-semibold font-headline pt-2">Information We Collect</h3>
          <p>
            We may collect information such as your name, email address, and course progress
            to provide and improve our services. Payment information is handled securely
            by our payment processors and is not stored directly by us.
          </p>
          <h3 className="text-lg font-semibold font-headline pt-2">How We Use Information</h3>
          <p>
            Your information is used to manage your account, provide access to courses,
            process payments, communicate with you, and improve our platform.
          </p>
          <h3 className="text-lg font-semibold font-headline pt-2">Data Security</h3>
          <p>
            We implement a variety of security measures to maintain the safety of your
            personal information.
          </p>
          <h3 className="text-lg font-semibold font-headline pt-2">Contact Us</h3>
          <p>
            If you have any questions regarding this privacy policy, you may contact us
            using the information on our (future) contact page.
          </p>
          <p className="text-sm text-muted-foreground pt-4">
            This is a placeholder Privacy Policy. More detailed content will be added here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
