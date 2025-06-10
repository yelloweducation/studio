
"use client";
import React, { useState, useEffect, type FormEvent, type ChangeEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image'; 
import { useAuth } from '@/hooks/useAuth';
import { courses as defaultMockCourses, users as mockUsers, type Course, type PaymentSubmission, type User, initialPaymentSettings, type PaymentSettings } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { ChevronLeft, AlertTriangle, ShoppingCart, UploadCloud, Info, ArrowRight, Home, Banknote, UserCircle as UserCircleIcon, ClipboardList, FileImage } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useLanguage, type Language } from '@/contexts/LanguageContext'; // Added

const USER_PAYMENT_SUBMISSIONS_KEY = 'adminPaymentSubmissions';
const PAYMENT_SETTINGS_KEY = 'adminPaymentSettingsData';

const checkoutPageTranslations = {
  en: {
    backToCourseDetails: "Back to Course Details",
    backToCourse: "Back to Course",
    purchaseCourseTitle: "Purchase Course: {title}",
    completePurchaseFor: "Complete your purchase for: {price} {currency}",
    paymentInstructionsTitle: "Payment Instructions",
    pleaseMakePayment: "Please make a payment of <strong>{price} {currency}</strong> to the following account:",
    bank: "Bank:",
    accountNo: "Account No:",
    accountName: "Account Name:",
    afterPaymentUpload: "After making the payment, please upload a screenshot of your transaction receipt below.",
    paymentDetailsNotConfigured: "Manual payment details have not been configured by the administrator yet. Please check back later or contact support.",
    uploadScreenshot: "Upload Payment Screenshot",
    submitPaymentProof: "Submit Payment Proof",
    submitting: "Submitting...",
    authenticationRequired: "Authentication Required",
    loginToProceed: "Please log in to proceed with the course purchase.",
    login: "Login",
    courseNotFound: "Course Not Found",
    courseNotFoundDesc: "The course you are trying to purchase (ID: {courseId}) could not be found.",
    goToHomepage: "Go to Homepage",
    freeCourse: "Free Course",
    freeCourseDesc: "This course is available for free!",
    noPaymentRequired: "No payment is required for \"{title}\". You can start learning right away.",
    goToCourse: "Go to Course",
    fileTooLarge: "File Too Large",
    fileTooLargeDesc: "Please upload an image smaller than 5MB.",
    invalidFileType: "Invalid File Type",
    invalidFileTypeDesc: "Please upload an image file (e.g., JPG, PNG).",
    missingInfo: "Missing Information",
    missingInfoDesc: "Please upload a payment proof screenshot.",
    submissionError: "Submission Error",
    submissionErrorDesc: "User not authenticated or course/price details missing.",
    paymentSubmitted: "Payment Submitted",
    paymentSubmittedDesc: "Your payment proof has been submitted for review.",
    submissionFailed: "Submission Failed",
    submissionFailedDesc: "Could not save your payment submission.",
    imagePreview: "Selected image preview:",
    imageUploadHelp: "Please upload an image of your payment receipt (e.g., JPG, PNG). Max file size: 5MB."
  },
  my: {
    backToCourseDetails: "အတန်းအသေးစိတ်သို့ ပြန်သွားရန်",
    backToCourse: "အတန်းသို့ ပြန်သွားရန်",
    purchaseCourseTitle: "အတန်းဝယ်ယူရန်: {title}",
    completePurchaseFor: "သင်၏ဝယ်ယူမှုကို {price} {currency} ဖြင့် ပြီးအောင်လုပ်ပါ။",
    paymentInstructionsTitle: "ငွေပေးချေမှု ညွှန်ကြားချက်များ",
    pleaseMakePayment: "ကျေးဇူးပြု၍ <strong>{price} {currency}</strong> ကို အောက်ပါအကောင့်သို့ ပေးချေပါ:",
    bank: "ဘဏ်:",
    accountNo: "အကောင့်နံပါတ်:",
    accountName: "အကောင့်အမည်:",
    afterPaymentUpload: "ငွေပေးချေပြီးနောက်၊ သင်၏ငွေလွှဲပြေစာ၏ ဖန်သားပြင်ဓာတ်ပုံကို အောက်တွင် တင်ပေးပါ။",
    paymentDetailsNotConfigured: "စီမံခန့်ခွဲသူမှ လက်ဖြင့်ငွေပေးချေမှုအသေးစိတ်ကို မသတ်မှတ်ရသေးပါ။ နောက်မှပြန်စစ်ဆေးပါ သို့မဟုတ် အကူအညီတောင်းပါ။",
    uploadScreenshot: "ငွေပေးချေမှု ဖန်သားပြင်ဓာတ်ပုံ တင်ရန်",
    submitPaymentProof: "သင်တန်းကြေးသွင်းရန်",
    submitting: "တင်သွင်းနေသည်...",
    authenticationRequired: "အထောက်အထား လိုအပ်သည်",
    loginToProceed: "အတန်းဝယ်ယူမှုကို ဆက်လက်ဆောင်ရွက်ရန် ကျေးဇူးပြု၍ လော့ဂ်အင်ဝင်ပါ။",
    login: "လော့ဂ်အင်",
    courseNotFound: "အတန်း မတွေ့ပါ",
    courseNotFoundDesc: "သင်ဝယ်ယူရန်ကြိုးစားနေသော အတန်း (ID: {courseId}) ကို ရှာမတွေ့ပါ။",
    goToHomepage: "ပင်မစာမျက်နှာသို့ သွားရန်",
    freeCourse: "အခမဲ့ အတန်း",
    freeCourseDesc: "ဤအတန်းသည် အခမဲ့ရရှိနိုင်ပါသည်!",
    noPaymentRequired: "\"{title}\" အတွက် ငွေပေးချေရန် မလိုအပ်ပါ။ သင်ချက်ချင်း စတင်လေ့လာနိုင်ပါသည်။",
    goToCourse: "အတန်းသို့ သွားရန်",
    fileTooLarge: "ဖိုင်အရွယ်အစားကြီးလွန်းသည်",
    fileTooLargeDesc: "5MB ထက်ငယ်သော ပုံကို တင်ပေးပါ။",
    invalidFileType: "ဖိုင်အမျိုးအစား မမှန်ကန်ပါ",
    invalidFileTypeDesc: "ကျေးဇူးပြု၍ ပုံဖိုင် (ဥပမာ JPG, PNG) တင်ပေးပါ။",
    missingInfo: "အချက်အလက် လိုအပ်သည်",
    missingInfoDesc: "ကျေးဇူးပြု၍ ငွေပေးချေမှု အထောက်အထား ဖန်သားပြင်ဓာတ်ပုံ တင်ပေးပါ။",
    submissionError: "တင်သွင်းမှု အမှား",
    submissionErrorDesc: "အသုံးပြုသူ အထောက်အထားမရှိပါ သို့မဟုတ် အတန်း/စျေးနှုန်း အသေးစိတ်များ ပျောက်ဆုံးနေသည်။",
    paymentSubmitted: "ငွေပေးချေမှု တင်သွင်းပြီးပါပြီ",
    paymentSubmittedDesc: "သင်၏ငွေပေးချေမှု အထောက်အထားကို ပြန်လည်သုံးသပ်ရန် တင်သွင်းပြီးပါပြီ။",
    submissionFailed: "တင်သွင်းမှု မအောင်မြင်ပါ",
    submissionFailedDesc: "သင်၏ငွေပေးချေမှု တင်သွင်းမှုကို သိမ်းဆည်းနိုင်ခြင်းမရှိပါ။",
    imagePreview: "ရွေးချယ်ထားသော ပုံကို အကြိုကြည့်ရှုရန်:",
    imageUploadHelp: "ငွေပေးချေမှုပြေစာ၏ပုံတစ်ပုံ (ဥပမာ JPG, PNG) တင်ပါ။ အများဆုံးဖိုင်အရွယ်အစား: 5MB။"
  }
};

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const { language } = useLanguage(); // Added
  const t = checkoutPageTranslations[language]; // Added

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
        toast({ variant: "destructive", title: t.fileTooLarge, description: t.fileTooLargeDesc });
        setScreenshotFile(null);
        setScreenshotPreviewUrl(null);
        e.target.value = ''; 
        return;
      }
      if (!file.type.startsWith('image/')) {
        toast({ variant: "destructive", title: t.invalidFileType, description: t.invalidFileTypeDesc });
        setScreenshotFile(null);
        setScreenshotPreviewUrl(null);
        e.target.value = ''; 
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
      toast({ variant: "destructive", title: t.submissionError, description: t.submissionErrorDesc });
      return;
    }
    if (!screenshotFile || !screenshotPreviewUrl) {
        toast({ variant: "destructive", title: t.missingInfo, description: t.missingInfoDesc});
        return;
    }

    setIsSubmitting(true);

    const newSubmission: PaymentSubmission = {
      id: `ps-${Date.now()}`,
      userId: user.id,
      courseId: currentCourse.id,
      amount: currentCourse.price,
      currency: currentCourse.currency || 'USD',
      screenshotUrl: screenshotPreviewUrl, 
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
      
      toast({ title: t.paymentSubmitted, description: t.paymentSubmittedDesc });
      router.push(`/courses/${courseId}`);
    } catch (error) {
      console.error("Error saving payment submission:", error);
      toast({ variant: "destructive", title: t.submissionFailed, description: t.submissionFailedDesc });
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
              <AlertTriangle className="mr-3 h-8 w-8 text-destructive" /> {t.authenticationRequired}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">{t.loginToProceed}</p>
            <Button asChild>
              <Link href={`/login?redirect=/courses/${courseId}/checkout`}>{t.login}</Link>
            </Button>
             <Button variant="outline" asChild className="ml-2">
                <Link href={`/courses/${courseId}`}>{t.backToCourse}</Link>
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
              <AlertTriangle className="mr-3 h-8 w-8 text-destructive" /> {t.courseNotFound}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-muted-foreground" dangerouslySetInnerHTML={{ __html: t.courseNotFoundDesc.replace('{courseId}', courseId) }}/>
            <Button asChild className="w-full">
                <Link href="/">
                  <Home className="mr-2 h-4 w-4" /> {t.goToHomepage}
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
            <ChevronLeft className="mr-2 h-4 w-4" /> {t.backToCourse}
          </Link>
        </Button>
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl sm:text-3xl font-headline text-foreground flex items-center">
              <Info className="mr-3 h-8 w-8 text-primary" /> {t.freeCourse}
            </CardTitle>
            <CardDescription className="text-lg">
              {t.freeCourseDesc}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-muted-foreground" dangerouslySetInnerHTML={{ __html: t.noPaymentRequired.replace('{title}', currentCourse.title) }} />
            <Button asChild className="w-full">
              <Link href={`/courses/${courseId}`}>{t.goToCourse}</Link>
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
          <ChevronLeft className="mr-2 h-4 w-4" /> {t.backToCourseDetails}
        </Link>
      </Button>

      <Card className="shadow-xl">
        <form onSubmit={handleSubmitPaymentProof}>
          <CardHeader>
            <CardTitle className="text-2xl sm:text-3xl font-headline text-foreground flex items-center">
              <ShoppingCart className="mr-3 h-7 w-7 text-primary" /> {t.purchaseCourseTitle.replace('{title}', currentCourse.title)}
            </CardTitle>
            <CardDescription className="text-lg" dangerouslySetInnerHTML={{ __html: t.completePurchaseFor.replace('{price}', currentCourse.price.toFixed(2)).replace('{currency}', currentCourse.currency || 'USD') }} />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-accent/10 p-4 rounded-md border border-accent/30">
                <h4 className="font-semibold text-foreground mb-2 flex items-center"><Info className="h-5 w-5 mr-2 text-accent" /> {t.paymentInstructionsTitle}</h4>
                {hasPaymentDetails ? (
                  <>
                    <p className="text-sm text-muted-foreground mb-2" dangerouslySetInnerHTML={{ __html: t.pleaseMakePayment.replace('{price}', currentCourse.price.toFixed(2)).replace('{currency}', currentCourse.currency || 'USD') }} />
                    {paymentSettings?.bankName && <p className="text-sm text-muted-foreground"><Banknote className="inline-block mr-1.5 h-4 w-4 align-text-bottom"/><strong>{t.bank}</strong> {paymentSettings.bankName}</p>}
                    {paymentSettings?.accountNumber && <p className="text-sm text-muted-foreground"><ClipboardList className="inline-block mr-1.5 h-4 w-4 align-text-bottom"/><strong>{t.accountNo}</strong> {paymentSettings.accountNumber}</p>}
                    {paymentSettings?.accountHolderName && <p className="text-sm text-muted-foreground"><UserCircleIcon className="inline-block mr-1.5 h-4 w-4 align-text-bottom"/><strong>{t.accountName}</strong> {paymentSettings.accountHolderName}</p>}
                    {paymentSettings?.additionalInstructions && <p className="text-sm text-muted-foreground mt-2"><em>{paymentSettings.additionalInstructions}</em></p>}
                    <p className="text-sm text-muted-foreground mt-3">
                        {t.afterPaymentUpload}
                    </p>
                  </>
                ) : (
                   <p className="text-sm text-muted-foreground">
                    {t.paymentDetailsNotConfigured}
                  </p>
                )}
            </div>
            
            <div>
              <Label htmlFor="screenshotFile" className="text-base flex items-center">
                <UploadCloud className="mr-2 h-5 w-5 text-muted-foreground" /> {t.uploadScreenshot}
              </Label>
              <Input
                  id="screenshotFile"
                  type="file"
                  accept="image/png, image/jpeg, image/gif, image/webp" 
                  onChange={handleFileChange}
                  required
                  className="mt-1 shadow-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                  disabled={!hasPaymentDetails}
              />
              {screenshotPreviewUrl && (
                <div className="mt-3 border p-2 rounded-md inline-block bg-muted/50 shadow-sm">
                  <p className="text-xs text-muted-foreground mb-1">{t.imagePreview}</p>
                  <Image src={screenshotPreviewUrl} alt="Screenshot preview" width={200} height={150} className="rounded max-h-[150px] w-auto object-contain" />
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                {t.imageUploadHelp}
              </p>
            </div>

          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full text-lg py-3" disabled={isSubmitting || !hasPaymentDetails || !screenshotFile}>
              {isSubmitting ? t.submitting : (
                <>
                  {t.submitPaymentProof} <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
