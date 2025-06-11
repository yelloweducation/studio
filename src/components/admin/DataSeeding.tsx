
"use client";
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DatabaseZap, BookText, FolderKanban, VideoIcon, Users, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  seedCoursesToFirestore, 
  seedCategoriesToFirestore, 
  seedVideosToFirestore, 
  seedLearningPathsToFirestore 
} from '@/lib/firestoreUtils';
import { seedInitialUsersToFirestore } from '@/lib/authUtils';

type SeedOperation = 'courses' | 'categories' | 'videos' | 'learningPaths' | 'users';

export default function DataSeeding() {
  const [loadingStates, setLoadingStates] = useState<Record<SeedOperation, boolean>>({
    courses: false,
    categories: false,
    videos: false,
    learningPaths: false,
    users: false,
  });
  const { toast } = useToast();

  const handleSeedOperation = async (operation: SeedOperation) => {
    setLoadingStates(prev => ({ ...prev, [operation]: true }));
    let result: { successCount: number; errorCount: number; skippedCount: number } | undefined;
    let operationName = operation.charAt(0).toUpperCase() + operation.slice(1);

    try {
      switch (operation) {
        case 'courses':
          result = await seedCoursesToFirestore();
          break;
        case 'categories':
          result = await seedCategoriesToFirestore();
          break;
        case 'videos':
          result = await seedVideosToFirestore();
          break;
        case 'learningPaths':
          result = await seedLearningPathsToFirestore();
          break;
        case 'users':
          result = await seedInitialUsersToFirestore();
          break;
        default:
          throw new Error("Invalid seed operation");
      }

      if (result) {
        toast({
          title: `${operationName} Seeding Complete`,
          description: `Successfully seeded: ${result.successCount}, Skipped (already exist): ${result.skippedCount}, Errors: ${result.errorCount}.`,
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
    { operation: 'courses' as SeedOperation, label: 'Seed Courses', Icon: BookText },
    { operation: 'categories' as SeedOperation, label: 'Seed Categories', Icon: FolderKanban },
    { operation: 'videos' as SeedOperation, label: 'Seed Videos', Icon: VideoIcon },
    { operation: 'learningPaths' as SeedOperation, label: 'Seed Learning Paths', Icon: DatabaseZap },
    { operation: 'users' as SeedOperation, label: 'Seed Initial Users', Icon: Users },
  ];

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center text-xl md:text-2xl font-headline">
          <DatabaseZap className="mr-2 md:mr-3 h-6 w-6 md:h-7 md:w-7 text-primary" /> Firestore Data Seeding
        </CardTitle>
        <CardDescription>
          Populate your Firestore database with initial mock data. This is useful for new setups or testing.
          Existing documents with the same IDs will be skipped to prevent data loss.
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
            Note: Seeding users will only add the mock admin and student if they don't already exist by email. Other data types check by ID.
        </p>
      </CardContent>
    </Card>
  );
}
