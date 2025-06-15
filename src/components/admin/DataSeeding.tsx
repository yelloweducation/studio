
"use client";
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DatabaseZap, BookText, FolderKanban, Users, Loader2, Settings, PlaySquare } from 'lucide-react'; // Added PlaySquare
import { useToast } from '@/hooks/use-toast';
import { 
  serverSeedCourses, 
  serverSeedCategories, 
  serverSeedLearningPaths,
  serverSeedPaymentSettings,
  serverSeedVideos, // Added back
} from '@/actions/adminDataActions'; 
import { serverSeedInitialUsers } from '@/actions/authActions'; 

type SeedOperation = 'courses' | 'categories' | 'learningPaths' | 'users' | 'paymentSettings' | 'videos'; // Added 'videos'

export default function DataSeeding() {
  const [loadingStates, setLoadingStates] = useState<Record<SeedOperation, boolean>>({
    courses: false,
    categories: false,
    learningPaths: false,
    users: false,
    paymentSettings: false,
    videos: false, // Added 'videos'
  });
  const { toast } = useToast();

  const handleSeedOperation = async (operation: SeedOperation) => {
    setLoadingStates(prev => ({ ...prev, [operation]: true }));
    let result: { successCount: number; errorCount: number; skippedCount: number } | undefined;
    let operationName = operation.charAt(0).toUpperCase() + operation.slice(1);
    if (operation === 'paymentSettings') operationName = 'Payment Settings';
    if (operation === 'videos') operationName = 'Videos';

    try {
      let storageType = 'database (Neon/Postgres)';
      switch (operation) {
        case 'courses':
          result = await serverSeedCourses(); 
          break;
        case 'categories':
          result = await serverSeedCategories(); 
          break;
        case 'learningPaths':
          result = await serverSeedLearningPaths(); 
          break;
        case 'users':
          result = await serverSeedInitialUsers(); 
          break;
        case 'paymentSettings':
          result = await serverSeedPaymentSettings(); 
          break;
        case 'videos': // Added videos
          result = await serverSeedVideos();
          storageType = 'localStorage'; // Videos are seeded to localStorage
          break;
        default:
          throw new Error("Invalid seed operation");
      }

      if (result) {
        toast({
          title: `${operationName} Seeding Complete`,
          description: `Successfully seeded/updated: ${result.successCount}, Skipped: ${result.skippedCount}, Errors: ${result.errorCount}. Data is in ${storageType}.`,
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
    { operation: 'categories' as SeedOperation, label: 'Seed Categories to DB', Icon: FolderKanban },
    { operation: 'courses' as SeedOperation, label: 'Seed Courses to DB', Icon: BookText },
    { operation: 'learningPaths' as SeedOperation, label: 'Seed Learning Paths to DB', Icon: DatabaseZap },
    { operation: 'users' as SeedOperation, label: 'Seed Initial Users to DB', Icon: Users },
    { operation: 'paymentSettings' as SeedOperation, label: 'Seed Payment Settings to DB', Icon: Settings },
    { operation: 'videos' as SeedOperation, label: 'Seed Videos to LocalStorage', Icon: PlaySquare }, // Added videos
  ];

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center text-xl md:text-2xl font-headline">
          <DatabaseZap className="mr-2 md:mr-3 h-6 w-6 md:h-7 md:w-7 text-primary" /> Data Seeding
        </CardTitle>
        <CardDescription>
          Populate your Neon/PostgreSQL database and localStorage (for videos) with initial mock data.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {seedButtons.map(({ operation, label, Icon }) => (
          <Card key={operation} className="bg-muted/30 dark:bg-muted/10">
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
            Note: Seeding will attempt to create entries from mock data. If entries with the same unique identifiers (like ID or name for categories) already exist, they might be skipped.
        </p>
      </CardContent>
    </Card>
  );
}
