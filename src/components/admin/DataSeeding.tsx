
"use client";
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DatabaseZap, BookText, FolderKanban, VideoIcon, Users, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  seedCoursesToDb, 
  seedCategoriesToDb, 
  seedVideosToDb, 
  seedLearningPathsToDb,
  seedPaymentSettingsToDb // Added for payment settings
} from '@/lib/dbUtils'; // Updated to use Prisma-based dbUtils
import { seedInitialUsersToPrisma } from '@/lib/authUtils'; // Updated to use Prisma-based authUtils

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
    setLoadingStates(prev => ({ ...prev, [operation]: true }));
    let result: { successCount: number; errorCount: number; skippedCount: number } | undefined;
    let operationName = operation.charAt(0).toUpperCase() + operation.slice(1);
    if (operation === 'paymentSettings') operationName = 'Payment Settings';


    try {
      switch (operation) {
        case 'courses':
          result = await seedCoursesToDb();
          break;
        case 'categories':
          result = await seedCategoriesToDb();
          break;
        case 'videos':
          result = await seedVideosToDb();
          break;
        case 'learningPaths':
          result = await seedLearningPathsToDb();
          break;
        case 'users':
          result = await seedInitialUsersToPrisma();
          break;
        case 'paymentSettings':
          result = await seedPaymentSettingsToDb();
          break;
        default:
          throw new Error("Invalid seed operation");
      }

      if (result) {
        toast({
          title: `${operationName} Seeding Complete`,
          description: `Successfully seeded: ${result.successCount}, Skipped (already exist/no change): ${result.skippedCount}, Errors: ${result.errorCount}.`,
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
    { operation: 'learningPaths' as SeedOperation, label: 'Seed Learning Paths', Icon: DatabaseZap },
    { operation: 'users' as SeedOperation, label: 'Seed Initial Users', Icon: Users },
    { operation: 'paymentSettings' as SeedOperation, label: 'Seed Payment Settings', Icon: DatabaseZap }, // Added button
  ];

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center text-xl md:text-2xl font-headline">
          <DatabaseZap className="mr-2 md:mr-3 h-6 w-6 md:h-7 md:w-7 text-primary" /> Database Seeding (PostgreSQL)
        </CardTitle>
        <CardDescription>
          Populate your PostgreSQL database with initial mock data using Prisma. This is useful for new setups or testing.
          Existing documents with the same IDs (or unique constraints like email for users) will typically be skipped.
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
            Note: Seeding courses may only create basic course entries; complex relations like modules/lessons might require more detailed seed scripts or manual setup for now.
        </p>
      </CardContent>
    </Card>
  );
}
