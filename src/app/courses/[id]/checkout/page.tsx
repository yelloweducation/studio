
"use client";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

// This page is no longer used in the non-payment version of the application.
// It's kept as a minimal placeholder.

export default function CheckoutPage() {
  return (
    <div className="max-w-2xl mx-auto py-8">
      <Button variant="outline" asChild className="mb-6">
        <Link href="/">
          <ChevronLeft className="mr-2 h-4 w-4" /> Back to Home
        </Link>
      </Button>

      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl sm:text-3xl font-headline text-foreground flex items-center">
            <AlertTriangle className="mr-3 h-8 w-8 text-destructive" /> Checkout Not Available
          </CardTitle>
          <CardDescription className="text-lg">
            This feature is not currently enabled.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground">
            The payment and checkout system is not active in this version of the application.
            All courses are currently available for free.
          </p>
          <Button asChild className="w-full">
            <Link href="/">Explore Courses</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
