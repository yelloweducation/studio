
"use client";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { UserPlus } from "lucide-react";
import React, { useState, useEffect } from 'react'; // Added useState and useEffect
import type { User as PrismaUserType } from '@prisma/client'; // Import User type

const registerSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const { register, isAuthenticated, loading: authLoading } = useAuth(); // Added isAuthenticated, authLoading
  const router = useRouter();
  const { toast } = useToast();
  const [registrationSuccessUser, setRegistrationSuccessUser] = useState<PrismaUserType | null>(null);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit: SubmitHandler<RegisterFormValues> = async (data) => {
    setRegistrationSuccessUser(null); // Reset before new attempt
    try {
      const user = await register(data.name, data.email, data.password);
      if (user) {
        // Don't redirect immediately. Set user to trigger useEffect.
        setRegistrationSuccessUser(user);
        // Toast will be shown in useEffect after auth state is confirmed.
      } else {
        // This handles cases where serverRegisterUser might return null (e.g., if not throwing specific errors)
        toast({ variant: "destructive", title: "Registration Failed", description: "Please check your details and try again." });
      }
    } catch (error: any) {
      let errorMessage = "An unexpected error occurred during registration.";
      if (error.message === "UserAlreadyExists") {
        errorMessage = "This email address is already in use.";
      } else if (error.message === "UserCreationFailure") {
        errorMessage = "Could not create user. Please try again.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      toast({ variant: "destructive", title: "Registration Error", description: errorMessage });
      setRegistrationSuccessUser(null); // Ensure reset on error
    }
  };

  useEffect(() => {
    if (registrationSuccessUser && isAuthenticated && !authLoading) {
      toast({ title: "Registration Successful", description: `Welcome, ${registrationSuccessUser.name}!` });
      router.push('/dashboard/student');
      setRegistrationSuccessUser(null); // Reset after redirect
    } else if (registrationSuccessUser && !isAuthenticated && !authLoading) {
      // This state indicates a potential issue where registration reported success
      // but the AuthContext didn't update isAuthenticated correctly.
      console.warn("Registration successful, but AuthContext.isAuthenticated is false after loading.");
      toast({ variant: "destructive", title: "Registration State Issue", description: "Please try logging in manually." });
      router.push('/login'); // Fallback to login page
      setRegistrationSuccessUser(null); // Reset
    }
  }, [registrationSuccessUser, isAuthenticated, authLoading, router, toast]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} disabled={form.formState.isSubmitting || authLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="john.doe@example.com" {...field} disabled={form.formState.isSubmitting || authLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} disabled={form.formState.isSubmitting || authLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} disabled={form.formState.isSubmitting || authLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-md hover:shadow-sm active:translate-y-px transition-all duration-150" disabled={form.formState.isSubmitting || authLoading}>
          {form.formState.isSubmitting || authLoading ? "Processing..." : <><UserPlus className="mr-2 h-5 w-5" /> Register</>}
        </Button>
      </form>
    </Form>
  );
}
