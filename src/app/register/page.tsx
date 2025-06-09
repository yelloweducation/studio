
import { RegisterForm } from "@/components/auth/RegisterForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function RegisterPage() {
  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-200px)] py-12">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-headline">Create your Yellow Institute Account</CardTitle>
          <CardDescription>Join our community of learners and educators.</CardDescription>
        </CardHeader>
        <CardContent>
          <RegisterForm />
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Button variant="link" asChild className="text-primary p-0 h-auto">
              <Link href="/login">Login here</Link>
            </Button>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
