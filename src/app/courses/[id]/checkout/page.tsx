
"use client";
import React, { useState, useEffect, type FormEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { courses as defaultMockCourses, users as mockUsers, type Course, type PaymentSubmission, type User } from '@/data/mockData'; // Added User
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { ChevronLeft, AlertTriangle, ShoppingCart, UploadCloud, Info, ArrowRight, Home } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const USER_PAYMENT_SUBMISSIONS_KEY = 'adminPaymentSubmissions'; // Using admin key as admin manages them

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const courseId = params.id as string;

  const [isLoadingCourse, setIsLoadingCourse] = useState(true);
  const [currentCourse, setCurrentCourse] = useState<Course | null>(null);
  const [screenshotUrl, setScreenshotUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setIsLoadingCourse(true);
    let coursesToUse: Course[] = [];
    try {
      const storedCoursesString = localStorage.getItem('adminCourses');
      if (storedCoursesString) {
        const parsedCourses = JSON.parse(storedCoursesString) as Course[];
        coursesToUse = Array.isArray(parsedCourses) ? parsedCourses : defaultMockCourses;
      } else {
        coursesToUse = defaultMockCourses;
      }
    } catch (error) {
      console.error("Error loading courses for checkout:", error);
      coursesToUse = defaultMockCourses;
    }
    
    const foundCourse = coursesToUse.find(c => c.id === courseId);
    setCurrentCourse(foundCourse || null);
    setIsLoadingCourse(false);
  }, [courseId]);

  const handleSubmitPaymentProof = (e: FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated || !user || !currentCourse || !(currentCourse.price && currentCourse.price > 0)) {
      toast({ variant: "destructive", title: "Submission Error", description: "User not authenticated or course/price details missing." });
      return;
    }
    if (!screenshotUrl.trim()) {
        toast({ variant: "destructive", title: "Missing Information", description: "Please provide a screenshot URL."});
        return;
    }

    setIsSubmitting(true);

    const newSubmission: PaymentSubmission = {
      id: `ps-${Date.now()}`,
      userId: user.id,
      courseId: currentCourse.id,
      amount: currentCourse.price,
      currency: currentCourse.currency || 'USD',
      screenshotUrl: screenshotUrl,
      status: 'pending',
      submittedAt: new Date().toISOString(),
    };

    try {
      let submissions: PaymentSubmission[] = [];
      const storedSubmissions = localStorage.getItem(USER_PAYMENT_SUBMISSIONS_KEY);
      if (storedSubmissions) {
        const parsed = JSON.parse(storedSubmissions);
        if (Array.isArray(parsed)) {
            submissions = parsed;
        }
      }
      submissions.push(newSubmission);
      localStorage.setItem(USER_PAYMENT_SUBMISSIONS_KEY, JSON.stringify(submissions));
      
      toast({ title: "Payment Submitted", description: "Your payment proof has been submitted for review." });
      router.push(`/courses/${courseId}`);
    } catch (error) {
      console.error("Error saving payment submission:", error);
      toast({ variant: "destructive", title: "Submission Failed", description: "Could not save your payment submission." });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || isLoadingCourse) {
    return (
      <div className="max-w-2xl mx-auto py-8 px-4">
        <Skeleton className="h-8 w-1/4 mb-6" /> {/* Back button */}
        <Card className="shadow-xl">
          <CardHeader>
            <Skeleton className="h-10 w-3/4 mb-2" /> {/* Title */}
            <Skeleton className="h-6 w-1/2" /> {/* Description */}
          </CardHeader>
          <CardContent className="space-y-6">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
            <div className="space-y-2">
                <Skeleton className="h-4 w-1/4" /> {/* Label */}
                <Skeleton className="h-10 w-full" /> {/* Input */}
            </div>
            <Skeleton className="h-12 w-full" /> {/* Submit Button */}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="max-w-lg mx-auto py-12 text-center">
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl font-headline flex items-center justify-center">
              <AlertTriangle className="mr-3 h-8 w-8 text-destructive" /> Authentication Required
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">Please log in to proceed with the course purchase.</p>
            <Button asChild>
              <Link href={`/login?redirect=/courses/${courseId}/checkout`}>Login</Link>
            </Button>
             <Button variant="outline" asChild className="ml-2">
                <Link href={`/courses/${courseId}`}>Back to Course</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (!currentCourse) {
     return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center py-10">
        <Card className="w-full max-w-lg shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl sm:text-3xl font-headline text-foreground flex items-center justify-center">
              <AlertTriangle className="mr-3 h-8 w-8 text-destructive" /> Course Not Found
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-muted-foreground">
              The course you are trying to purchase (ID: {courseId}) could not be found.
            </p>
            <Button asChild className="w-full">
                <Link href="/">
                  <Home className="mr-2 h-4 w-4" /> Go to Homepage
                </Link>
              </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!currentCourse.price || currentCourse.price <= 0) {
    return (
      <div className="max-w-2xl mx-auto py-8 px-4">
        <Button variant="outline" asChild className="mb-6">
          <Link href={`/courses/${courseId}`}>
            <ChevronLeft className="mr-2 h-4 w-4" /> Back to Course
          </Link>
        </Button>
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl sm:text-3xl font-headline text-foreground flex items-center">
              <Info className="mr-3 h-8 w-8 text-primary" /> Free Course
            </CardTitle>
            <CardDescription className="text-lg">
              This course is available for free!
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-muted-foreground">
              No payment is required for "{currentCourse.title}". You can start learning right away.
            </p>
            <Button asChild className="w-full">
              <Link href={`/courses/${courseId}`}>Go to Course</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }


  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <Button variant="outline" asChild className="mb-6">
        <Link href={`/courses/${courseId}`}>
          <ChevronLeft className="mr-2 h-4 w-4" /> Back to Course Details
        </Link>
      </Button>

      <Card className="shadow-xl">
        <form onSubmit={handleSubmitPaymentProof}>
          <CardHeader>
            <CardTitle className="text-2xl sm:text-3xl font-headline text-foreground flex items-center">
              <ShoppingCart className="mr-3 h-7 w-7 text-primary" /> Purchase Course: {currentCourse.title}
            </CardTitle>
            <CardDescription className="text-lg">
              Complete your purchase for: {currentCourse.price.toFixed(2)} {currentCourse.currency}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-accent/10 p-4 rounded-md border border-accent/30">
                <h4 className="font-semibold text-foreground mb-2 flex items-center"><Info className="h-5 w-5 mr-2 text-accent" /> Payment Instructions</h4>
                <p className="text-sm text-muted-foreground">
                    This is a manual payment process. Please make a payment of <strong>{currentCourse.price.toFixed(2)} {currentCourse.currency}</strong> to the designated account (details provided by the institute).
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                    After making the payment, upload a screenshot of your transaction receipt URL below.
                </p>
            </div>
            
            <div>
              <Label htmlFor="screenshotUrl" className="text-base">Screenshot URL of Payment Proof</Label>
              <div className="relative mt-1">
                <UploadCloud className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                    id="screenshotUrl"
                    type="url"
                    value={screenshotUrl}
                    onChange={(e) => setScreenshotUrl(e.target.value)}
                    placeholder="https://example.com/your-screenshot.png"
                    required
                    className="pl-10 shadow-sm"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">Please upload your screenshot to an image hosting service (e.g., Imgur) and paste the direct link here.</p>
            </div>

          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full text-lg py-3" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : (
                <>
                  Submit Payment Proof <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
