
"use client";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookUser } from "lucide-react"; // Changed icon
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function StudentDashboardPage() {
  const { user } = useAuth();

  return (
    <ProtectedRoute allowedRoles={['student']}>
      <div className="space-y-8">
        <section className="pb-4 border-b">
            <h1 className="text-2xl md:text-3xl font-headline font-semibold flex items-center">
                <BookUser className="mr-2 md:mr-3 h-7 w-7 md:h-8 md:w-8 text-primary" /> Welcome, {user?.name || 'Student'}!
            </h1>
            <p className="text-sm md:text-base text-muted-foreground">This is your personal dashboard.</p>
        </section>

        <Card>
            <CardHeader>
                <CardTitle>Explore Yellow Institute</CardTitle>
                <CardDescription>
                    While course features are currently under review, you can explore other parts of our platform.
                </CardDescription>
            </CardHeader>
          <CardContent className="pt-2 text-center">
            <p className="text-muted-foreground mb-4">
              Our main course offerings are being updated. Please check back soon!
            </p>
            <Button asChild>
                <Link href="/">Go to Homepage</Link>
            </Button>
          </CardContent>
        </Card>
        
      </div>
    </ProtectedRoute>
  );
}
