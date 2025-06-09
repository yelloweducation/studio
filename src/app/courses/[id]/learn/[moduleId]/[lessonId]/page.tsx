
"use client";
import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Home } from 'lucide-react';

export default function LessonViewerPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center py-10">
      <Card className="w-full max-w-lg shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl sm:text-3xl font-headline text-foreground flex items-center justify-center">
            <AlertTriangle className="mr-3 h-8 w-8 text-destructive" /> Feature Not Available
          </CardTitle>
          <CardDescription className="text-lg">
            Lesson viewing is currently unavailable.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground">
            The lesson viewing functionality has been temporarily disabled.
            Please check back later or explore other features of our platform.
          </p>
          <Button asChild className="w-full sm:w-auto">
            <Link href="/">
              <Home className="mr-2 h-4 w-4" /> Go to Homepage
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
