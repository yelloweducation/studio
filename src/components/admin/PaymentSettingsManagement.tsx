
"use client";
import React, { useState, useEffect, type FormEvent } from 'react';
import { type PaymentSettings } from '@/lib/dbUtils'; // Use Prisma type from dbUtils
// Removed: import { initialPaymentSettings as mockDefaultSettings } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Settings, Save, Banknote, UserCircle, ClipboardList, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getPaymentSettingsFromDb, savePaymentSettingsToDb } from '@/lib/dbUtils'; // Use Prisma-based functions

const defaultPaymentSettings: PaymentSettings = {
  id: 'global', // Prisma needs an id for upsert if it doesn't exist
  bankName: null,
  accountNumber: null,
  accountHolderName: null,
  additionalInstructions: null,
  updatedAt: new Date(), // Prisma will manage this, but good for type consistency
};

export default function PaymentSettingsManagement() {
  const [settings, setSettings] = useState<PaymentSettings>(defaultPaymentSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const loadSettings = async () => {
      setIsLoading(true);
      const dbSettings = await getPaymentSettingsFromDb(); 
      if (dbSettings) {
        setSettings(dbSettings);
      } else {
        setSettings(defaultPaymentSettings); 
      }
      setIsLoading(false);
    };
    loadSettings();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value === '' ? null : value } as PaymentSettings)); 
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const dataToSave: Omit<PaymentSettings, 'id' | 'updatedAt'> = {
          bankName: settings.bankName || null,
          accountNumber: settings.accountNumber || null,
          accountHolderName: settings.accountHolderName || null,
          additionalInstructions: settings.additionalInstructions || null,
      };
      await savePaymentSettingsToDb(dataToSave); 
      toast({
        title: "Settings Saved",
        description: "Your payment configuration has been updated.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Save Failed",
        description: "Could not save payment settings. Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-xl md:text-2xl font-headline">
            <Settings className="mr-2 md:mr-3 h-6 w-6 md:h-7 md:w-7 text-primary" /> Payment Configuration
          </CardTitle>
          <CardDescription>Loading payment settings from your database...</CardDescription>
        </CardHeader>
        <CardContent className="py-10">
          <div className="flex justify-center items-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
          Set up the bank details and instructions for manual payments. This data is stored in your Neon/Postgres database via Prisma.
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
              disabled={isSaving}
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
              disabled={isSaving}
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
              disabled={isSaving}
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
              disabled={isSaving}
            />
             <p className="text-xs text-muted-foreground mt-1">These instructions will be displayed to the user on the checkout page.</p>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-md hover:shadow-sm active:translate-y-px transition-all duration-150" disabled={isSaving}>
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
            Save Payment Settings
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
