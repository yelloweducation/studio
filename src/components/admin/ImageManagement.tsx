
"use client";
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { ImageIcon, Save, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Course, Category, LearningPath, Video as PrismaVideo } from '@prisma/client'; // Use Prisma types
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import { 
  serverGetCourses, serverUpdateCourse,
  serverGetCategories, serverUpdateCategory,
  serverGetLearningPaths, serverUpdateLearningPath,
  serverGetVideos, serverUpdateVideo 
} from '@/actions/adminDataActions'; 

export default function ImageManagement() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [videos, setVideos] = useState<PrismaVideo[]>([]); 
  const [categories, setCategories] = useState<Category[]>([]);
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState<Record<string, boolean>>({}); 
  const { toast } = useToast();

  useEffect(() => {
    const loadAllData = async () => {
      setIsLoading(true);
      try {
        console.log("[ImageManagement] Fetching all data...");
        const [dbCourses, dbVideos, dbCategories, dbLearningPaths] = await Promise.all([
          serverGetCourses().catch(e => { console.error("Failed to fetch courses for img mgmt:", e); throw new Error(`Courses: ${(e as Error).message}`); }),
          serverGetVideos().catch(e => { console.error("Failed to fetch videos for img mgmt:", e); throw new Error(`Videos: ${(e as Error).message}`); }),    
          serverGetCategories().catch(e => { console.error("Failed to fetch categories for img mgmt:", e); throw new Error(`Categories: ${(e as Error).message}`); }), 
          serverGetLearningPaths().catch(e => { console.error("Failed to fetch learning paths for img mgmt:", e); throw new Error(`Learning Paths: ${(e as Error).message}`); }), 
        ]);
        console.log("[ImageManagement] Data fetched successfully.");
        setCourses(dbCourses);
        setVideos(dbVideos);
        setCategories(dbCategories);
        setLearningPaths(dbLearningPaths); 
      } catch (error) {
        console.error("Error loading data for Image Management:", error);
        toast({ variant: "destructive", title: "Error Loading Data", description: `Could not fetch all items for image management. Details: ${(error as Error).message}` });
      }
      setIsLoading(false);
    };
    loadAllData();
  }, [toast]);

  const handleFieldChange = <T extends { id: string }>(
    setStateFunc: React.Dispatch<React.SetStateAction<T[]>>,
    itemId: string,
    field: keyof T,
    value: string | null 
  ) => {
    setStateFunc(prevItems =>
      prevItems.map(item =>
        item.id === itemId ? { ...item, [field]: value } : item
      )
    );
  };

  const handleSaveItemImage = async (
    itemType: 'course' | 'video' | 'category' | 'learningPath',
    itemId: string
  ) => {
    setIsSaving(prev => ({ ...prev, [itemId]: true }));
    let itemToSave: Course | PrismaVideo | Category | LearningPath | undefined;
    let updateFunction: (id: string, data: Partial<any>) => Promise<any>; 
    let itemName = '';

    try {
      switch (itemType) {
        case 'course':
          itemToSave = courses.find(c => c.id === itemId);
          updateFunction = serverUpdateCourse; 
          itemName = itemToSave?.title || 'Course';
          break;
        case 'video': 
          itemToSave = videos.find(v => v.id === itemId);
          updateFunction = serverUpdateVideo; 
          itemName = itemToSave?.title || 'Video';
          break;
        case 'category':
          itemToSave = categories.find(cat => cat.id === itemId);
          updateFunction = serverUpdateCategory; 
          itemName = (itemToSave as Category)?.name || 'Category';
          break;
        case 'learningPath':
          itemToSave = learningPaths.find(lp => lp.id === itemId);
          updateFunction = serverUpdateLearningPath; 
          itemName = itemToSave?.title || 'Learning Path';
          break;
        default:
          throw new Error("Invalid item type");
      }

      if (itemToSave) {
        const dataToUpdate: { imageUrl?: string | null; dataAiHint?: string | null; thumbnailUrl?: string | null } = { 
          dataAiHint: itemToSave.dataAiHint || null,
        };
        if (itemType === 'video') {
            dataToUpdate.thumbnailUrl = (itemToSave as PrismaVideo).thumbnailUrl || null;
        } else {
            dataToUpdate.imageUrl = (itemToSave as Course | Category | LearningPath).imageUrl || null;
        }
        console.log(`[ImageManagement] Saving ${itemType} ID ${itemId}, Data:`, dataToUpdate);
        await updateFunction(itemId, dataToUpdate);
        toast({ title: `${itemType.charAt(0).toUpperCase() + itemType.slice(1)} Image Updated`, description: `Image details for "${itemName}" saved.` });
      } else {
        throw new Error(`Item ${itemId} of type ${itemType} not found in local state.`);
      }
    } catch (error) {
      console.error(`[ImageManagement] Error saving ${itemType} ID ${itemId}:`, error);
      toast({ variant: "destructive", title: "Save Failed", description: `Could not save image details for "${itemName}". ${(error as Error).message}` });
    } finally {
      setIsSaving(prev => ({ ...prev, [itemId]: false }));
    }
  };

  const renderImageForm = <T extends { id: string, title?: string | null, name?: string | null, imageUrl?: string | null, thumbnailUrl?: string | null, dataAiHint?: string | null }>(
    item: T,
    itemType: 'course' | 'video' | 'category' | 'learningPath',
    setStateFunc: React.Dispatch<React.SetStateAction<T[]>>
  ) => {
    const title = item.title || item.name || 'Item';
    const currentImageUrl = itemType === 'video' ? item.thumbnailUrl : item.imageUrl;
    const aspectClass = itemType === 'video' ? 'aspect-[9/16]' : 'aspect-video';
    const placeholderImage = itemType === 'video' ? 'https://placehold.co/360x640.png' : 'https://placehold.co/600x400.png';
    const imageFieldKey = itemType === 'video' ? 'thumbnailUrl' : 'imageUrl';

    return (
      <Card key={item.id}>
        <form onSubmit={(e) => { e.preventDefault(); handleSaveItemImage(itemType, item.id); }}>
          <CardHeader>
            <CardTitle className="text-md font-semibold">{title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 items-start">
              <div className={`w-full sm:w-1/3 flex-shrink-0 ${itemType === 'video' ? 'max-w-[150px] sm:max-w-full' : ''}`}>
                <Label htmlFor={`${itemType}ImageUrl-${item.id}`}>Current Image</Label>
                <div className={`mt-1 w-full relative border rounded-md overflow-hidden bg-muted ${aspectClass}`}>
                  {(currentImageUrl || placeholderImage) && (
                    <Image src={currentImageUrl || placeholderImage} alt={title ?? 'Placeholder'} layout="fill" objectFit="cover" key={currentImageUrl || 'placeholder'} />
                  )}
                </div>
              </div>
              <div className="w-full sm:w-2/3 space-y-4">
                <div>
                  <Label htmlFor={`${itemType}ImageUrlInput-${item.id}`}>{itemType === 'video' ? 'Thumbnail URL' : 'Image URL'}</Label>
                  <Input
                    id={`${itemType}ImageUrlInput-${item.id}`}
                    value={currentImageUrl || ''}
                    onChange={e => handleFieldChange(setStateFunc, item.id, imageFieldKey as keyof T, e.target.value)}
                    disabled={isSaving[item.id]}
                  />
                </div>
                <div>
                  <Label htmlFor={`${itemType}AiHint-${item.id}`}>AI Hint</Label>
                  <Input
                    id={`${itemType}AiHint-${item.id}`}
                    value={item.dataAiHint || ''}
                    onChange={e => handleFieldChange(setStateFunc, item.id, 'dataAiHint' as keyof T, e.target.value)}
                    placeholder="e.g. education programming"
                    disabled={isSaving[item.id]}
                  />
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" size="sm" disabled={isSaving[item.id]}>
              {isSaving[item.id] ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Save className="mr-2 h-4 w-4" />}
              Save {itemType.charAt(0).toUpperCase() + itemType.slice(1)} Image
            </Button>
          </CardFooter>
        </form>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-xl md:text-2xl font-headline">
            <ImageIcon className="mr-2 md:mr-3 h-6 w-6 md:h-7 md:w-7 text-primary" /> Image Management
          </CardTitle>
          <CardDescription>Loading image data...</CardDescription>
        </CardHeader>
        <CardContent className="py-10">
          <div className="flex justify-center items-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center text-xl md:text-2xl font-headline">
          <ImageIcon className="mr-2 md:mr-3 h-6 w-6 md:h-7 md:w-7 text-primary" /> Image Management
        </CardTitle>
        <CardDescription>Manage image URLs and AI hints. All data now uses Neon/Postgres via Prisma server actions.</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[calc(100vh-20rem)] pr-3">
          <div className="space-y-8">
            <section>
              <h3 className="text-xl font-semibold mb-4 font-headline">Course Images</h3>
              {courses.length > 0 ? (
                <div className="space-y-6">
                  {courses.map(course => renderImageForm(course, 'course', setCourses))}
                </div>
              ) : (<p className="text-muted-foreground">No courses found.</p>)}
            </section>

            <section>
              <h3 className="text-xl font-semibold mb-4 font-headline">Video Thumbnails</h3>
              {videos.length > 0 ? (
                <div className="space-y-6">
                  {videos.map(video => renderImageForm(video, 'video', setVideos))}
                </div>
              ) : (<p className="text-muted-foreground">No videos found.</p>)}
            </section>

            <section>
              <h3 className="text-xl font-semibold mb-4 font-headline">Category Images</h3>
              {categories.length > 0 ? (
                <div className="space-y-6">
                  {categories.map(category => renderImageForm(category, 'category', setCategories))}
                </div>
              ) : (<p className="text-muted-foreground">No categories found.</p>)}
            </section>

            <section>
              <h3 className="text-xl font-semibold mb-4 font-headline">Learning Path Images</h3>
              {learningPaths.length > 0 ? (
                <div className="space-y-6">
                  {learningPaths.map(lp => renderImageForm(lp, 'learningPath', setLearningPaths))}
                </div>
              ) : (<p className="text-muted-foreground">No learning paths found.</p>)}
            </section>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
    
