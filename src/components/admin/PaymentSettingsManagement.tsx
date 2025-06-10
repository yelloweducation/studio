
"use client";
import React, { useState, useEffect, type FormEvent } from 'react';
import { initialPaymentSettings, type PaymentSettings } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Settings, Save, Banknote, UserCircle, ClipboardList } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const PAYMENT_SETTINGS_KEY = 'adminPaymentSettingsData';

export default function PaymentSettingsManagement() {
  const [settings, setSettings] = useState<PaymentSettings>(initialPaymentSettings);
  const [isLoaded, setIsLoaded] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const storedSettings = localStorage.getItem(PAYMENT_SETTINGS_KEY);
    if (storedSettings) {
      try {
        setSettings(JSON.parse(storedSettings));
      } catch (e) {
        console.error("Failed to parse payment settings from localStorage", e);
        setSettings(initialPaymentSettings); // Fallback to initial if parsing fails
      }
    } else {
      // If nothing in localStorage, use initial and optionally save them
      // localStorage.setItem(PAYMENT_SETTINGS_KEY, JSON.stringify(initialPaymentSettings));
    }
    setIsLoaded(true);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    localStorage.setItem(PAYMENT_SETTINGS_KEY, JSON.stringify(settings));
    toast({
      title: "Settings Saved",
      description: "Your payment configuration has been updated.",
    });
  };

  if (!isLoaded) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-xl md:text-2xl font-headline">
            <Settings className="mr-2 md:mr-3 h-6 w-6 md:h-7 md:w-7 text-primary" /> Payment Configuration
          </CardTitle>
          <CardDescription>Loading payment settings...</CardDescription>
        </CardHeader>
        <CardContent className="animate-pulse">
          <div className="space-y-4">
            {[1,2,3,4].map(i => <div key={i} className="h-10 bg-muted rounded-md"></div>)}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center text-xl md:text-2xl font-headline">
          <Settings className="mr-2 md:mr-3 h-6 w-6 md:h-7 md:w-7 text-primary" /> Payment Configuration
        </CardTitle>
        <CardDescription>
          Set up the bank details and instructions for manual payments. This information will be shown to users on the checkout page.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="bankName" className="flex items-center mb-1">
                <Banknote className="mr-2 h-4 w-4 text-muted-foreground" /> Bank Name
            </Label>
            <Input
              id="bankName"
              name="bankName"
              value={settings.bankName || ''}
              onChange={handleChange}
              placeholder="e.g., KBZ Bank"
            />
          </div>
          <div>
            <Label htmlFor="accountNumber" className="flex items-center mb-1">
                <ClipboardList className="mr-2 h-4 w-4 text-muted-foreground" /> Account Number
            </Label>
            <Input
              id="accountNumber"
              name="accountNumber"
              value={settings.accountNumber || ''}
              onChange={handleChange}
              placeholder="e.g., 1234567890123"
            />
          </div>
          <div>
            <Label htmlFor="accountHolderName" className="flex items-center mb-1">
                <UserCircle className="mr-2 h-4 w-4 text-muted-foreground" /> Account Holder Name
            </Label>
            <Input
              id="accountHolderName"
              name="accountHolderName"
              value={settings.accountHolderName || ''}
              onChange={handleChange}
              placeholder="e.g., Daw Mya Mya"
            />
          </div>
          <div>
            <Label htmlFor="additionalInstructions" className="flex items-center mb-1">
                <ClipboardList className="mr-2 h-4 w-4 text-muted-foreground" /> Additional Instructions
            </Label>
            <Textarea
              id="additionalInstructions"
              name="additionalInstructions"
              value={settings.additionalInstructions || ''}
              onChange={handleChange}
              placeholder="e.g., Please include your User ID or Course Name in the payment reference. Payments are typically verified within 24 hours."
              rows={4}
            />
             <p className="text-xs text-muted-foreground mt-1">These instructions will be displayed to the user on the checkout page.</p>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-md hover:shadow-sm active:translate-y-px transition-all duration-150">
            <Save className="mr-2 h-5 w-5" /> Save Payment Settings
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
