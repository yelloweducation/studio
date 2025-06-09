
"use client";
import { useState, useEffect, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, Landmark, NotebookText, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import type { PaymentSettings as PaymentSettingsType } from '@/data/mockData';

const PAYMENT_SETTINGS_KEY = 'paymentSettings';

export default function PaymentSettings() {
  const [settings, setSettings] = useState<PaymentSettingsType>({
    bankName: '',
    bankAccountNumber: '',
    paymentInstructions: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const storedSettings = localStorage.getItem(PAYMENT_SETTINGS_KEY);
    if (storedSettings) {
      try {
        setSettings(JSON.parse(storedSettings));
      } catch (e) {
        console.error("Failed to parse payment settings from localStorage", e);
      }
    }
    setIsLoading(false);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    localStorage.setItem(PAYMENT_SETTINGS_KEY, JSON.stringify(settings));
    toast({
      title: "Payment Settings Saved",
      description: "Your bank payment details have been updated.",
    });
  };

  if (isLoading) {
    return (
        <Card className="shadow-lg">
            <CardHeader>
                <CardTitle className="flex items-center text-xl md:text-2xl font-headline">
                <CreditCard className="mr-2 md:mr-3 h-6 w-6 md:h-7 md:w-7 text-primary" /> Payment Gateway Settings
                </CardTitle>
                <CardDescription>Configure manual bank payment details.</CardDescription>
            </CardHeader>
            <CardContent>
                <p>Loading settings...</p>
            </CardContent>
        </Card>
    )
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center text-xl md:text-2xl font-headline">
          <CreditCard className="mr-2 md:mr-3 h-6 w-6 md:h-7 md:w-7 text-primary" /> Payment Gateway Settings
        </CardTitle>
        <CardDescription>Configure manual bank payment details. Users will see this information at checkout.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="bankName" className="text-base">Bank Name</Label>
            <div className="relative mt-1">
                <Landmark className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                id="bankName"
                name="bankName"
                value={settings.bankName}
                onChange={handleInputChange}
                placeholder="e.g., KBZ Bank"
                required
                className="pl-10 text-base"
                />
            </div>
          </div>
          <div>
            <Label htmlFor="bankAccountNumber" className="text-base">Bank Account Number</Label>
             <div className="relative mt-1">
                <NotebookText className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                id="bankAccountNumber"
                name="bankAccountNumber"
                value={settings.bankAccountNumber}
                onChange={handleInputChange}
                placeholder="e.g., 9991234567890"
                required
                className="pl-10 text-base"
                />
            </div>
          </div>
          <div>
            <Label htmlFor="paymentInstructions" className="text-base">Payment Instructions</Label>
            <Textarea
              id="paymentInstructions"
              name="paymentInstructions"
              value={settings.paymentInstructions}
              onChange={handleInputChange}
              placeholder="e.g., Include your email or course name in the payment reference. After payment, please send a screenshot to payments@example.com."
              required
              rows={5}
              className="mt-1 text-base"
            />
            <p className="text-sm text-muted-foreground mt-1">This will be shown to users when they choose bank payment.</p>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90 w-full sm:w-auto">
            <Save className="mr-2 h-5 w-5" /> Save Payment Settings
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
