
"use client";
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DatabaseZap, BookText, FolderKanban, VideoIcon, Users, Loader2, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  serverSeedCourses, 
  serverSeedCategories, 
  serverSeedLearningPaths
} from '@/actions/adminDataActions'; // Use Server Actions for DB seeding
import { 
  seedVideosToDb, // Still uses client-side localStorage utils from dbUtils
  seedPaymentSettingsToDb // Still uses client-side localStorage utils from dbUtils
} from '@/lib/dbUtils'; 
import { seedInitialUsersToLocalStorage } from '@/lib/authUtils'; // Seeds users to in-memory store

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
    if (typeof window === 'undefined' && (operation === 'videos' || operation === 'paymentSettings' || operation === 'users')) {
      // Note: 'users' seeding (seedInitialUsersToLocalStorage) is primarily server-side in-memory,
      // but the button click originates from the client. The actual localStorage part of user seeding is deprecated.
      // For videos and paymentSettings, they strictly require browser.
      toast({
        variant: "destructive",
        title: "Seeding Unavailable",
        description: `Seeding ${operation} should be triggered from the browser.`,
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
          result = await serverSeedCourses(); // Server Action
          break;
        case 'categories':
          result = await serverSeedCategories(); // Server Action
          break;
        case 'videos':
          result = await seedVideosToDb(); // Client-side util
          break;
        case 'learningPaths':
          result = await serverSeedLearningPaths(); // Server Action
          break;
        case 'users':
          result = await seedInitialUsersToLocalStorage(); // authUtils (server-side in-memory)
          break;
        case 'paymentSettings':
          result = await seedPaymentSettingsToDb(); // Client-side util
          break;
        default:
          throw new Error("Invalid seed operation");
      }

      if (result) {
        const storageType = (operation === 'videos' || operation === 'paymentSettings') ? 'localStorage' 
                            : (operation === 'users' ? 'in-memory store (server)' : 'database (Neon)');
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
    { operation: 'users' as SeedOperation, label: 'Seed Initial Users (Server In-Memory)', Icon: Users },
    { operation: 'videos' as SeedOperation, label: 'Seed Videos (Browser localStorage)', Icon: VideoIcon },
    { operation: 'paymentSettings' as SeedOperation, label: 'Seed Payment Settings (Browser localStorage)', Icon: Settings },
  ];

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center text-xl md:text-2xl font-headline">
          <DatabaseZap className="mr-2 md:mr-3 h-6 w-6 md:h-7 md:w-7 text-primary" /> Data Seeding
        </CardTitle>
        <CardDescription>
          Populate your application with initial mock data. Categories, Courses, and Learning Paths will be seeded into your Neon PostgreSQL database via Server Actions.
          Users are seeded into an in-memory store on the server. Videos and Payment Settings are seeded into browser localStorage.
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
            Note: Seeding will attempt to create entries from mock data. If entries with the same unique identifiers (like ID or name for categories) already exist in the database, they might be skipped.
        </p>
      </CardContent>
    </Card>
  );
}
