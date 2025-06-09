
"use client";
import { useParams, useRouter } from 'next/navigation';
import { courses as allCourses, type Course, type PaymentSettings } from '@/data/mockData';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Loader2, AlertTriangle, Landmark, Copy, Check } from 'lucide-react';
import Link from 'next/link';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useToast } from '@/hooks/use-toast';

const PAYMENT_SETTINGS_KEY = 'paymentSettings';

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
  const { toast } = useToast();

  const [course, setCourse] = useState<Course | null>(null);
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    // Load course details
    const storedCourses = localStorage.getItem('adminCourses');
    let coursesToUse = allCourses;
    if (storedCourses) {
      try {
        coursesToUse = JSON.parse(storedCourses) as Course[];
      } catch (e) { console.error("Failed to parse adminCourses for checkout", e); }
    }
    const foundCourse = coursesToUse.find(c => c.id === courseId);
    
    if (!foundCourse) {
      setError("Course not found or invalid.");
      setIsLoading(false);
      return;
    }
    if (!foundCourse.price || foundCourse.price <= 0) {
        // Redirect if course is free or has no price
        router.replace(`/courses/${courseId}`);
        return;
    }
    setCourse(foundCourse);

    // Load payment settings
    const storedPaymentSettings = localStorage.getItem(PAYMENT_SETTINGS_KEY);
    if (storedPaymentSettings) {
      try {
        setPaymentSettings(JSON.parse(storedPaymentSettings));
      } catch (e) {
        console.error("Failed to parse payment settings", e);
        setError("Payment configuration error. Please contact support.");
      }
    } else {
      setError("Payment methods are not configured. Please contact support.");
    }
    setIsLoading(false);
  }, [courseId, router]);

  const handleCopy = (textToCopy: string, fieldName: string) => {
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopiedField(fieldName);
      toast({ title: "Copied!", description: `${fieldName} copied to clipboard.` });
      setTimeout(() => setCopiedField(null), 2000);
    }).catch(err => {
      console.error('Failed to copy: ', err);
      toast({ variant: "destructive", title: "Copy Failed", description: "Could not copy to clipboard." });
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <h1 className="text-2xl font-semibold text-foreground">Loading checkout...</h1>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center">
        <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
        <h1 className="text-2xl font-semibold text-destructive mb-2">Checkout Error</h1>
        <p className="text-muted-foreground mb-6">{error}</p>
        <Button asChild variant="outline">
          <Link href={course ? `/courses/${course.id}` : "/"}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            {course ? "Back to Course" : "Back to Home"}
          </Link>
        </Button>
      </div>
    );
  }

  if (!course || !paymentSettings) {
    // This case should ideally be caught by earlier error checks
    return (
         <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center">
            <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
            <h1 className="text-2xl font-semibold text-destructive mb-2">Information Missing</h1>
            <p className="text-muted-foreground mb-6">Course or payment details are unavailable.</p>
             <Button asChild variant="outline">
                <Link href="/"> Back to Home </Link>
            </Button>
        </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="max-w-2xl mx-auto py-8">
        <Button variant="outline" asChild className="mb-6">
          <Link href={`/courses/${course.id}`}>
            <ChevronLeft className="mr-2 h-4 w-4" /> Back to Course Details
          </Link>
        </Button>

        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl sm:text-3xl font-headline text-foreground">Enroll in: {course.title}</CardTitle>
            <CardDescription className="text-lg">
              Total Amount: <span className="font-semibold text-primary">{course.price?.toLocaleString()} {course.currency}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-3 flex items-center">
                <Landmark className="mr-2 h-6 w-6 text-accent" /> Bank Payment Details
              </h3>
              <div className="space-y-3 p-4 border rounded-lg bg-muted/30">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-muted-foreground">Bank Name:</p>
                    <p className="text-lg font-medium">{paymentSettings.bankName}</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleCopy(paymentSettings.bankName, 'Bank Name')}>
                    {copiedField === 'Bank Name' ? <Check className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5" />}
                  </Button>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-muted-foreground">Account Number:</p>
                    <p className="text-lg font-medium">{paymentSettings.bankAccountNumber}</p>
                  </div>
                   <Button variant="ghost" size="icon" onClick={() => handleCopy(paymentSettings.bankAccountNumber, 'Account Number')}>
                    {copiedField === 'Account Number' ? <Check className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5" />}
                  </Button>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2">Payment Instructions</h3>
              <div className="p-4 border rounded-lg bg-muted/30 prose prose-sm dark:prose-invert max-w-none">
                <p>{paymentSettings.paymentInstructions || "Please make the payment to the account details above. Ensure to include your email or course name in the payment reference. After completing the payment, contact our support team with proof of payment to finalize your enrollment."}</p>
              </div>
            </div>
            
            <div className="text-sm text-muted-foreground p-3 border-l-4 border-primary bg-primary/10 rounded-r-md">
                <strong>Important:</strong> This is a manual payment process. Your enrollment will be confirmed once payment is verified by our team.
                After making the payment, please allow some time for processing. You can start learning once your enrollment is active.
            </div>

          </CardContent>
          <CardFooter>
            <Button size="lg" className="w-full" onClick={() => router.push(`/courses/${course.id}`)}>
              I Understand, Back to Course
            </Button>
          </CardFooter>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
