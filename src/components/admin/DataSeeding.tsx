
"use client";
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DatabaseZap, BookText, FolderKanban, VideoIcon, Users, Loader2, Settings } from 'lucide-react'; // Added Settings
import { useToast } from '@/hooks/use-toast';
import { 
  seedCoursesToDb, 
  seedCategoriesToDb, 
  seedVideosToDb, 
  seedLearningPathsToDb,
  seedPaymentSettingsToDb // For payment settings
} from '@/lib/dbUtils'; // dbUtils now seeds to localStorage
import { seedInitialUsersToLocalStorage } from '@/lib/authUtils'; // authUtils seeds users to localStorage

type SeedOperation = 'courses' | 'categories' | 'videos' | 'learningPaths' | 'users' | 'paymentSettings';

export default function DataSeeding() {
  const [loadingStates, setLoadingStates] = useState<Record<SeedOperation, boolean>>({
    courses: false,
    categories: false,
    videos: false,
    learningPaths: false,
    users: false,
    paymentSettings: false,
  });
  const { toast } = useToast();

  const handleSeedOperation = async (operation: SeedOperation) => {
    if (typeof window === 'undefined') {
      toast({
        variant: "destructive",
        title: "Seeding Unavailable",
        description: "Data seeding can only be performed in the browser environment.",
      });
      return;
    }

    setLoadingStates(prev => ({ ...prev, [operation]: true }));
    let result: { successCount: number; errorCount: number; skippedCount: number } | undefined;
    let operationName = operation.charAt(0).toUpperCase() + operation.slice(1);
    if (operation === 'paymentSettings') operationName = 'Payment Settings';


    try {
      switch (operation) {
        case 'courses':
          result = await seedCoursesToDb(); // Seeds to localStorage
          break;
        case 'categories':
          result = await seedCategoriesToDb(); // Seeds to localStorage
          break;
        case 'videos':
          result = await seedVideosToDb(); // Seeds to localStorage
          break;
        case 'learningPaths':
          result = await seedLearningPathsToDb(); // Seeds to localStorage
          break;
        case 'users':
          result = seedInitialUsersToLocalStorage(); // Seeds to localStorage via authUtils
          break;
        case 'paymentSettings':
          result = await seedPaymentSettingsToDb(); // Seeds to localStorage
          break;
        default:
          throw new Error("Invalid seed operation");
      }

      if (result) {
        toast({
          title: `${operationName} Seeding Complete`,
          description: `Successfully seeded/updated: ${result.successCount}, Skipped: ${result.skippedCount}, Errors: ${result.errorCount}. Data is in localStorage.`,
          duration: 7000,
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: `Error Seeding ${operationName}`,
        description: error.message || "An unexpected error occurred.",
      });
    } finally {
      setLoadingStates(prev => ({ ...prev, [operation]: false }));
    }
  };

  const seedButtons = [
    { operation: 'categories' as SeedOperation, label: 'Seed Categories', Icon: FolderKanban },
    { operation: 'courses' as SeedOperation, label: 'Seed Courses (Basic)', Icon: BookText },
    { operation: 'videos' as SeedOperation, label: 'Seed Videos', Icon: VideoIcon },
    { operation: 'learningPaths' as SeedOperation, label: 'Seed Learning Paths', Icon: DatabaseZap }, // Changed icon to DatabaseZap for paths
    { operation: 'users' as SeedOperation, label: 'Seed Initial Users', Icon: Users },
    { operation: 'paymentSettings' as SeedOperation, label: 'Seed Payment Settings', Icon: Settings }, // Changed icon to Settings
  ];

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center text-xl md:text-2xl font-headline">
          <DatabaseZap className="mr-2 md:mr-3 h-6 w-6 md:h-7 md:w-7 text-primary" /> Local Data Seeding (localStorage)
        </CardTitle>
        <CardDescription>
          Populate your browser's localStorage with initial mock data. This is useful for testing without a backend.
          Data will persist in your browser until cleared.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {seedButtons.map(({ operation, label, Icon }) => (
          <Card key={operation} className="bg-muted/30">
            <CardContent className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center">
                <Icon className="h-6 w-6 mr-3 text-accent" />
                <span className="font-medium text-md">{label}</span>
              </div>
              <Button 
                onClick={() => handleSeedOperation(operation)} 
                disabled={loadingStates[operation]}
                className="w-full sm:w-auto shadow-md"
                variant="outline"
              >
                {loadingStates[operation] ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <DatabaseZap className="mr-2 h-4 w-4" />
                )}
                {loadingStates[operation] ? 'Seeding...' : 'Run Seed'}
              </Button>
            </CardContent>
          </Card>
        ))}
         <p className="text-xs text-muted-foreground text-center pt-4">
            Note: Seeding courses will use the basic mock data entries. Complex relations like modules/lessons are part of the mock course structure.
        </p>
      </CardContent>
    </Card>
  );
}
