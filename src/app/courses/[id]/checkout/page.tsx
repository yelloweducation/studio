
"use client";
import { useParams, useRouter } from 'next/navigation';
import { courses as allCourses, type Course, type PaymentSettings } from '@/data/mockData';
import { useEffect, useState, type ChangeEvent } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Loader2, AlertTriangle, Landmark, Copy, Check, UploadCloud, FileImage } from 'lucide-react';
import Link from 'next/link';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input'; // Added for file input styling
import { Label } from '@/components/ui/label'; // Added for file input label

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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);

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
        router.replace(`/courses/${courseId}`);
        return;
    }
    setCourse(foundCourse);

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

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setSelectedFile(file);
      setFileName(file.name);
      toast({ title: "File Selected", description: `${file.name} is ready for you to send.`});
    } else {
      setSelectedFile(null);
      setFileName(null);
    }
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

  const defaultPaymentInstructions = `1. Make the payment to the bank account details provided above.
2. Ensure to include your email or the course name ("${course.title}") in the payment reference or description.
3. After completing the payment, select your payment proof (screenshot) using the button below.
4. Finally, contact our support team with your name, email, the course you paid for, and attach the payment proof to finalize your enrollment.`;


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
                <p className="whitespace-pre-line">{paymentSettings.paymentInstructions || defaultPaymentInstructions}</p>
              </div>
            </div>

            <div>
                <h3 className="text-xl font-semibold mb-2">Attach Payment Proof (Screenshot)</h3>
                <div className="p-4 border rounded-lg bg-muted/30 space-y-3">
                    <Label htmlFor="paymentProof" className="text-sm font-medium text-foreground">
                        Select your payment screenshot:
                    </Label>
                    <Input 
                        id="paymentProof" 
                        type="file" 
                        accept="image/*" 
                        onChange={handleFileChange} 
                        className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
                    />
                    {fileName && (
                        <div className="text-sm text-muted-foreground flex items-center">
                            <FileImage className="mr-2 h-4 w-4 text-green-600" />
                            Selected: <span className="font-medium text-foreground ml-1">{fileName}</span>
                        </div>
                    )}
                    <p className="text-xs text-muted-foreground">
                        After selecting, please remember to send this file to our support team as mentioned in the instructions.
                    </p>
                </div>
            </div>
            
            <div className="text-sm text-muted-foreground p-3 border-l-4 border-primary bg-primary/10 rounded-r-md">
                <strong>Important:</strong> This is a manual payment process. Your enrollment will be confirmed once payment is verified by our team.
                After making the payment and contacting support with your proof, please allow some time for processing. You can start learning once your enrollment is active.
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
