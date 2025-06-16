
"use client";
import { useState, useEffect, type FormEvent } from 'react';
import Image from 'next/image';
import { type LearningPath, type Course } from '@prisma/client'; 
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Edit3, Trash2, BookOpenCheck, Milestone, Info, Image as ImageIcon, ListChecks, Loader2 } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import * as LucideIcons from 'lucide-react';
import { isValidLucideIcon } from '@/lib/utils'; 
import { 
  serverGetLearningPaths, 
  serverAddLearningPath, 
  serverUpdateLearningPath, 
  serverDeleteLearningPath, 
  serverGetCourses 
} from '@/actions/adminDataActions';

const LearningPathForm = ({
  path,
  allCourses,
  onSubmit,
  onCancel,
  isSubmitting,
}: {
  path?: LearningPath & { learningPathCourses?: { course: Course, courseId: string }[] }; 
  allCourses: Course[];
  onSubmit: (data: Omit<LearningPath, 'id' | 'createdAt' | 'updatedAt' | 'learningPathCourses'> & { courseIdsToConnect?: string[] }) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}) => {
  const [title, setTitle] = useState(path?.title || '');
  const [description, setDescription] = useState(path?.description || '');
  const [icon, setIcon] = useState(path?.icon || 'Milestone');
  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>(path?.learningPathCourses?.map(lpc => lpc.courseId) || []);
  const [imageUrl, setImageUrl] = useState(path?.imageUrl || 'https://placehold.co/300x200.png');
  const [dataAiHint, setDataAiHint] = useState(path?.dataAiHint || 'learning path');

  const handleCourseSelection = (courseId: string, checked: boolean) => {
    setSelectedCourseIds(prev =>
      checked ? [...prev, courseId] : prev.filter(id => id !== courseId)
    );
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title || !description) {
        alert("Title and Description are required.");
        return;
    }
    await onSubmit({
      title,
      description,
      icon,
      imageUrl,
      dataAiHint,
      courseIdsToConnect: selectedCourseIds,
    });
  };

  const IconComponent = isValidLucideIcon(icon) ? LucideIcons[icon as keyof typeof LucideIcons] as React.ElementType : LucideIcons.Milestone;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <ScrollArea className="h-[65vh] sm:h-[70vh] pr-4">
        <div className="space-y-4">
          <div>
            <Label htmlFor="lp-title">Learning Path Title</Label>
            <Input id="lp-title" value={title} onChange={e => setTitle(e.target.value)} required disabled={isSubmitting}/>
          </div>
          <div>
            <Label htmlFor="lp-description">Description</Label>
            <Textarea id="lp-description" value={description} onChange={e => setDescription(e.target.value)} required rows={3} disabled={isSubmitting}/>
          </div>
          <div>
            <Label htmlFor="lp-icon">Lucide Icon Name</Label>
            <div className="relative">
                <Input id="lp-icon" value={icon || ''} onChange={e => setIcon(e.target.value)} placeholder="e.g., Milestone, TrendingUp" className="pl-8" disabled={isSubmitting}/>
                <IconComponent className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">Enter a valid Lucide icon name. Defaults to 'Milestone'.</p>
          </div>
          <div>
            <Label htmlFor="lp-imageUrl">Path Image URL</Label>
            <div className="relative">
                <Input id="lp-imageUrl" value={imageUrl || ''} onChange={e => setImageUrl(e.target.value)} className="pl-8" disabled={isSubmitting}/>
                <ImageIcon className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
            {imageUrl && (
                <div className="mt-2 relative w-40 aspect-video border rounded overflow-hidden bg-muted">
                    <Image src={imageUrl} alt="Image preview" layout="fill" objectFit="cover" key={imageUrl}/>
                </div>
            )}
          </div>
          <div>
            <Label htmlFor="lp-dataAiHint">Image AI Hint</Label>
            <div className="relative">
                <Input id="lp-dataAiHint" value={dataAiHint || ''} onChange={e => setDataAiHint(e.target.value)} placeholder="e.g. career journey" className="pl-8" disabled={isSubmitting}/>
                <Info className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          <div className="space-y-2 pt-3">
            <Label className="flex items-center"><ListChecks className="mr-2 h-4 w-4"/>Select Courses for this Path</Label>
            <Card className="max-h-60 overflow-y-auto p-3 bg-muted/30">
                {allCourses.length > 0 ? allCourses.map(course => (
                <div key={course.id} className="flex items-center space-x-2 py-1.5">
                    <Checkbox
                    id={`course-${course.id}`}
                    checked={selectedCourseIds.includes(course.id)}
                    onCheckedChange={(checked) => handleCourseSelection(course.id, checked as boolean)}
                    disabled={isSubmitting}
                    />
                    <Label htmlFor={`course-${course.id}`} className="text-sm font-normal">
                    {course.title}
                    </Label>
                </div>
                )) : <p className="text-xs text-muted-foreground text-center py-2">No courses available to select. Add courses first.</p>}
            </Card>
          </div>
        </div>
      </ScrollArea>
      <DialogFooter className="pt-6 border-t">
        <DialogClose asChild>
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>Cancel</Button>
        </DialogClose>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {path ? 'Save Changes' : 'Add Learning Path'}
        </Button>
      </DialogFooter>
    </form>
  );
};

export default function LearningPathManagement() {
  const [learningPaths, setLearningPaths] = useState<(LearningPath & { learningPathCourses?: { course: Course, courseId: string }[] })[]>([]);
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [editingPath, setEditingPath] = useState<(LearningPath & { learningPathCourses?: { course: Course, courseId: string }[] }) | undefined>(undefined);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const loadData = async () => {
      setIsLoadingData(true);
      try {
        const [pathsFromDb, coursesFromDb] = await Promise.all([
          serverGetLearningPaths(), 
          serverGetCourses()       
        ]);
        setLearningPaths(pathsFromDb as any); 
        setAllCourses(coursesFromDb);
      } catch (error) {
        console.error("Error loading learning paths or courses:", error);
        toast({variant: "destructive", title: "Load Error", description: "Could not load data for learning paths."});
      }
      setIsLoadingData(false);
    };
    loadData();
  }, [toast]);

  const handleAddPath = async (data: Omit<LearningPath, 'id' | 'createdAt' | 'updatedAt' | 'learningPathCourses'> & { courseIdsToConnect?: string[] }) => {
    setIsSubmittingForm(true);
    try {
      const newPath = await serverAddLearningPath(data); 
      setLearningPaths(prev => [newPath as any, ...prev].sort((a, b) => a.title.localeCompare(b.title)));
      closeForm();
      toast({ title: "Learning Path Added", description: `"${data.title}" created.` });
    } catch (error) {
      toast({ variant: "destructive", title: "Error Adding Path", description: (error as Error).message || "Could not add learning path." });
    } finally {
      setIsSubmittingForm(false);
    }
  };

  const handleEditPath = async (data: Partial<Omit<LearningPath, 'id' | 'createdAt' | 'updatedAt'| 'learningPathCourses'>> & { courseIdsToConnect?: string[] }) => {
    if (!editingPath || !editingPath.id) return;
    setIsSubmittingForm(true);
    try {
      const updatedPath = await serverUpdateLearningPath(editingPath.id, data); 
      setLearningPaths(prev => prev.map(p => (p.id === editingPath.id ? updatedPath as any : p)).sort((a,b) => a.title.localeCompare(b.title)));
      closeForm();
      toast({ title: "Learning Path Updated", description: `"${data.title}" updated.` });
    } catch (error) {
      toast({ variant: "destructive", title: "Error Updating Path", description: (error as Error).message || "Could not update learning path." });
    } finally {
      setIsSubmittingForm(false);
    }
  };

  const handleDeletePath = async (pathId: string) => {
    const pathToDelete = learningPaths.find(p => p.id === pathId);
    try {
      await serverDeleteLearningPath(pathId); 
      setLearningPaths(prev => prev.filter(p => p.id !== pathId));
      toast({ title: "Learning Path Deleted", description: `"${pathToDelete?.title}" deleted.`, variant: "destructive" });
    } catch (error) {
      toast({ variant: "destructive", title: "Error Deleting Path", description: (error as Error).message || "Could not delete learning path." });
    }
  };

  const openForm = (path?: LearningPath & { learningPathCourses?: { course: Course, courseId: string }[] }) => {
    setEditingPath(path ? JSON.parse(JSON.stringify(path)) : undefined);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingPath(undefined);
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center text-xl md:text-2xl font-headline">
          <BookOpenCheck className="mr-2 md:mr-3 h-6 w-6 md:h-7 md:w-7 text-primary" /> Learning Path Management
        </CardTitle>
        <CardDescription>Create, edit, and manage guided learning paths using your Neon/Postgres database via Prisma. Assign courses to paths.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6 text-right">
          <Dialog open={isFormOpen} onOpenChange={(isOpen) => { if(!isOpen) closeForm(); else setIsFormOpen(true);}}>
            <DialogTrigger asChild>
              <Button onClick={() => openForm()} className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-md" disabled={isLoadingData}>
                <PlusCircle className="mr-2 h-5 w-5" /> Add New Learning Path
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl md:max-w-3xl">
              <DialogHeader className="pb-4">
                <DialogTitle className="font-headline text-xl md:text-2xl">{editingPath ? 'Edit Learning Path' : 'Add New Learning Path'}</DialogTitle>
                <DialogDescription>
                  {editingPath ? 'Modify details of this learning path.' : 'Define a new learning path and select courses.'}
                </DialogDescription>
              </DialogHeader>
              {(isFormOpen && !isLoadingData) &&
                <LearningPathForm
                    path={editingPath}
                    allCourses={allCourses}
                    onSubmit={editingPath ? handleEditPath : handleAddPath}
                    onCancel={closeForm}
                    isSubmitting={isSubmittingForm}
                />
              }
              {isLoadingData && isFormOpen && <div className="flex justify-center items-center p-10"><Loader2 className="h-6 w-6 animate-spin text-primary"/> Initializing form...</div>}
            </DialogContent>
          </Dialog>
        </div>

        {isLoadingData ? (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-2 text-muted-foreground">Loading learning paths...</p>
          </div>
        ) : learningPaths.length > 0 ? (
          <ul className="space-y-4">
            {learningPaths.map(path => {
              const IconComponent = path.icon && isValidLucideIcon(path.icon) ? LucideIcons[path.icon as keyof typeof LucideIcons] as React.ElementType : LucideIcons.Milestone;
              return (
                <li key={path.id} className="p-3 sm:p-4 border rounded-lg bg-card flex flex-col sm:flex-row sm:items-start shadow-sm hover:shadow-md transition-shadow">
                  {path.imageUrl && (
                    <div className="relative w-full sm:w-24 h-24 sm:h-auto sm:aspect-square border rounded overflow-hidden shrink-0 bg-muted mb-2 sm:mb-0">
                      <Image src={path.imageUrl} alt={path.title} layout="fill" objectFit="cover" data-ai-hint={path.dataAiHint || 'path image'}/>
                    </div>
                  )}
                  <div className="flex-grow sm:ml-4">
                    <h3 className="font-semibold font-headline text-md md:text-lg flex items-center">
                      <IconComponent className="mr-2 h-5 w-5 text-accent shrink-0" />
                      {path.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">{path.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">Courses: {path.learningPathCourses?.length || 0}</p>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:space-x-2 gap-2 sm:gap-0 w-full sm:w-auto sm:items-center mt-2 sm:mt-0 shrink-0 self-start sm:self-center">
                    <Button variant="outline" size="sm" onClick={() => openForm(path)} className="w-full sm:w-auto hover:border-primary hover:text-primary">
                      <Edit3 className="mr-1 h-4 w-4" /> Edit
                    </Button>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="destructive" size="sm" className="w-full sm:w-auto">
                          <Trash2 className="mr-1 h-4 w-4" /> Delete
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-xs">
                        <DialogHeader>
                          <DialogTitle>Confirm Deletion</DialogTitle>
                          <DialogDescription>
                            Are you sure you want to delete the learning path "{path.title}"? This action cannot be undone.
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="pt-2">
                          <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                          <DialogClose asChild><Button variant="destructive" onClick={() => handleDeletePath(path.id)}>Delete Path</Button></DialogClose>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-center text-muted-foreground py-4">No learning paths found in your database. Add some or use the seeder!</p>
        )}
      </CardContent>
    </Card>
  );
}

    