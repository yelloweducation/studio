
"use client";
import React, { useState, useEffect, type FormEvent, type ChangeEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image'; // Added for image preview
import { useAuth } from '@/hooks/useAuth';
import { courses as defaultMockCourses, users as mockUsers, type Course, type PaymentSubmission, type User, initialPaymentSettings, type PaymentSettings } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { ChevronLeft, AlertTriangle, ShoppingCart, UploadCloud, Info, ArrowRight, Home, Banknote, UserCircle as UserCircleIcon, ClipboardList, FileImage } from 'lucide-react'; // Added FileImage
import { Skeleton } from '@/components/ui/skeleton';

const USER_PAYMENT_SUBMISSIONS_KEY = 'adminPaymentSubmissions';
const PAYMENT_SETTINGS_KEY = 'adminPaymentSettingsData';

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const courseId = params.id as string;

  const [isLoadingCourse, setIsLoadingCourse] = useState(true);
  const [currentCourse, setCurrentCourse] = useState<Course | null>(null);
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [screenshotPreviewUrl, setScreenshotPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings | null>(null);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);

  useEffect(() => {
    setIsLoadingSettings(true);
    const storedSettings = localStorage.getItem(PAYMENT_SETTINGS_KEY);
    if (storedSettings) {
      try {
        setPaymentSettings(JSON.parse(storedSettings));
      } catch (e) {
        console.error("Failed to parse payment settings from localStorage", e);
        setPaymentSettings(initialPaymentSettings);
      }
    } else {
      setPaymentSettings(initialPaymentSettings);
    }
    setIsLoadingSettings(false);

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

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({ variant: "destructive", title: "File Too Large", description: "Please upload an image smaller than 5MB." });
        setScreenshotFile(null);
        setScreenshotPreviewUrl(null);
        e.target.value = ''; // Reset file input
        return;
      }
      if (!file.type.startsWith('image/')) {
        toast({ variant: "destructive", title: "Invalid File Type", description: "Please upload an image file (e.g., JPG, PNG)." });
        setScreenshotFile(null);
        setScreenshotPreviewUrl(null);
        e.target.value = ''; // Reset file input
        return;
      }
      setScreenshotFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshotPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setScreenshotFile(null);
      setScreenshotPreviewUrl(null);
    }
  };

  const handleSubmitPaymentProof = async (e: FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated || !user || !currentCourse || !(currentCourse.price && currentCourse.price > 0)) {
      toast({ variant: "destructive", title: "Submission Error", description: "User not authenticated or course/price details missing." });
      return;
    }
    if (!screenshotFile || !screenshotPreviewUrl) {
        toast({ variant: "destructive", title: "Missing Information", description: "Please upload a payment proof screenshot."});
        return;
    }

    setIsSubmitting(true);

    // The screenshotPreviewUrl is already the Data URI
    const newSubmission: PaymentSubmission = {
      id: `ps-${Date.now()}`,
      userId: user.id,
      courseId: currentCourse.id,
      amount: currentCourse.price,
      currency: currentCourse.currency || 'USD',
      screenshotUrl: screenshotPreviewUrl, // This is the Data URI
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

  if (authLoading || isLoadingCourse || isLoadingSettings) {
    return (
      <div className="max-w-2xl mx-auto py-8 px-4">
        <Skeleton className="h-8 w-1/4 mb-6" />
        <Card className="shadow-xl">
          <CardHeader>
            <Skeleton className="h-10 w-3/4 mb-2" />
            <Skeleton className="h-6 w-1/2" />
          </CardHeader>
          <CardContent className="space-y-6">
            <Skeleton className="h-20 w-full" />
            <div className="space-y-2">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-10 w-full" />
            </div>
            <Skeleton className="h-12 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="max-w-lg mx-auto py-6 sm:py-12 text-center">
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
      <div className="flex flex-col flex-grow justify-center items-center text-center pt-6 pb-12 sm:pt-10 sm:pb-10">
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

  const hasPaymentDetails = paymentSettings && (paymentSettings.bankName || paymentSettings.accountNumber || paymentSettings.accountHolderName);

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
                {hasPaymentDetails ? (
                  <>
                    <p className="text-sm text-muted-foreground mb-2">
                        Please make a payment of <strong>{currentCourse.price.toFixed(2)} {currentCourse.currency}</strong> to the following account:
                    </p>
                    {paymentSettings?.bankName && <p className="text-sm text-muted-foreground"><Banknote className="inline-block mr-1.5 h-4 w-4 align-text-bottom"/><strong>Bank:</strong> {paymentSettings.bankName}</p>}
                    {paymentSettings?.accountNumber && <p className="text-sm text-muted-foreground"><ClipboardList className="inline-block mr-1.5 h-4 w-4 align-text-bottom"/><strong>Account No:</strong> {paymentSettings.accountNumber}</p>}
                    {paymentSettings?.accountHolderName && <p className="text-sm text-muted-foreground"><UserCircleIcon className="inline-block mr-1.5 h-4 w-4 align-text-bottom"/><strong>Account Name:</strong> {paymentSettings.accountHolderName}</p>}
                    {paymentSettings?.additionalInstructions && <p className="text-sm text-muted-foreground mt-2"><em>{paymentSettings.additionalInstructions}</em></p>}
                    <p className="text-sm text-muted-foreground mt-3">
                        After making the payment, please upload a screenshot of your transaction receipt below.
                    </p>
                  </>
                ) : (
                   <p className="text-sm text-muted-foreground">
                    Manual payment details have not been configured by the administrator yet. Please check back later or contact support.
                  </p>
                )}
            </div>
            
            <div>
              <Label htmlFor="screenshotFile" className="text-base flex items-center">
                <UploadCloud className="mr-2 h-5 w-5 text-muted-foreground" /> Upload Payment Screenshot
              </Label>
              <Input
                  id="screenshotFile"
                  type="file"
                  accept="image/png, image/jpeg, image/gif, image/webp" // Specify accepted image types
                  onChange={handleFileChange}
                  required
                  className="mt-1 shadow-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                  disabled={!hasPaymentDetails}
              />
              {screenshotPreviewUrl && (
                <div className="mt-3 border p-2 rounded-md inline-block bg-muted/50 shadow-sm">
                  <p className="text-xs text-muted-foreground mb-1">Selected image preview:</p>
                  <Image src={screenshotPreviewUrl} alt="Screenshot preview" width={200} height={150} className="rounded max-h-[150px] w-auto object-contain" />
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Please upload an image of your payment receipt (e.g., JPG, PNG). Max file size: 5MB.
              </p>
            </div>

          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full text-lg py-3" disabled={isSubmitting || !hasPaymentDetails || !screenshotFile}>
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

    
