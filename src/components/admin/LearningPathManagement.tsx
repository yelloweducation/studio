
"use client";
import { useState, useEffect, type FormEvent, type ChangeEvent } from 'react';
import Image from 'next/image';
import { initialLearningPaths, type LearningPath, courses as initialCoursesData, type Course } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Edit3, Trash2, BookOpenCheck, Milestone, Info, Image as ImageIcon, ListChecks } from 'lucide-react';
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

const isValidLucideIcon = (iconName: string): iconName is keyof typeof LucideIcons => {
  return iconName in LucideIcons;
};

const LEARNING_PATHS_KEY = 'adminLearningPaths';
const ADMIN_COURSES_KEY = 'adminCourses';

const LearningPathForm = ({
  path,
  allCourses,
  onSubmit,
  onCancel,
}: {
  path?: LearningPath;
  allCourses: Course[];
  onSubmit: (data: LearningPath) => void;
  onCancel: () => void;
}) => {
  const [title, setTitle] = useState(path?.title || '');
  const [description, setDescription] = useState(path?.description || '');
  const [icon, setIcon] = useState(path?.icon || 'Milestone');
  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>(path?.courseIds || []);
  const [imageUrl, setImageUrl] = useState(path?.imageUrl || 'https://placehold.co/300x200.png');
  const [dataAiHint, setDataAiHint] = useState(path?.dataAiHint || 'learning path abstract');

  const handleCourseSelection = (courseId: string, checked: boolean) => {
    setSelectedCourseIds(prev =>
      checked ? [...prev, courseId] : prev.filter(id => id !== courseId)
    );
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!title || !description) {
        // Basic validation, can be expanded with react-hook-form later
        alert("Title and Description are required.");
        return;
    }
    onSubmit({
      id: path?.id || `lp-${Date.now()}`,
      title,
      description,
      icon,
      courseIds: selectedCourseIds,
      imageUrl,
      dataAiHint,
    });
  };

  const IconComponent = isValidLucideIcon(icon) ? LucideIcons[icon] as React.ElementType : LucideIcons.Milestone;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <ScrollArea className="h-[65vh] sm:h-[70vh] pr-4">
        <div className="space-y-4">
          <div>
            <Label htmlFor="lp-title">Learning Path Title</Label>
            <Input id="lp-title" value={title} onChange={e => setTitle(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="lp-description">Description</Label>
            <Textarea id="lp-description" value={description} onChange={e => setDescription(e.target.value)} required rows={3} />
          </div>
          <div>
            <Label htmlFor="lp-icon">Lucide Icon Name</Label>
            <div className="relative">
                <Input id="lp-icon" value={icon} onChange={e => setIcon(e.target.value)} placeholder="e.g., Milestone, TrendingUp" className="pl-8"/>
                <IconComponent className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">Enter a valid Lucide icon name. Defaults to 'Milestone'.</p>
          </div>
          <div>
            <Label htmlFor="lp-imageUrl">Path Image URL</Label>
            <div className="relative">
                <Input id="lp-imageUrl" value={imageUrl} onChange={e => setImageUrl(e.target.value)} className="pl-8"/>
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
                <Input id="lp-dataAiHint" value={dataAiHint} onChange={e => setDataAiHint(e.target.value)} placeholder="e.g. career journey" className="pl-8"/>
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
          <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        </DialogClose>
        <Button type="submit">{path ? 'Save Changes' : 'Add Learning Path'}</Button>
      </DialogFooter>
    </form>
  );
};

export default function LearningPathManagement() {
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([]);
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [editingPath, setEditingPath] = useState<LearningPath | undefined>(undefined);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Load learning paths
    const storedPaths = localStorage.getItem(LEARNING_PATHS_KEY);
    if (storedPaths) {
      try {
        setLearningPaths(JSON.parse(storedPaths));
      } catch (e) {
        console.error("Failed to parse learning paths:", e);
        setLearningPaths(initialLearningPaths);
      }
    } else {
      setLearningPaths(initialLearningPaths);
    }

    // Load courses for selection
    const storedCourses = localStorage.getItem(ADMIN_COURSES_KEY);
    if (storedCourses) {
      try {
        setAllCourses(JSON.parse(storedCourses));
      } catch (e) {
        console.error("Failed to parse courses for LP management:", e);
        setAllCourses(initialCoursesData);
      }
    } else {
      setAllCourses(initialCoursesData);
    }
    setIsDataLoaded(true);
  }, []);

  useEffect(() => {
    if (isDataLoaded) {
      localStorage.setItem(LEARNING_PATHS_KEY, JSON.stringify(learningPaths));
    }
  }, [learningPaths, isDataLoaded]);

  const handleAddPath = (data: LearningPath) => {
    setLearningPaths(prev => [data, ...prev]);
    closeForm();
    toast({ title: "Learning Path Added", description: `"${data.title}" created.` });
  };

  const handleEditPath = (data: LearningPath) => {
    setLearningPaths(prev => prev.map(p => (p.id === data.id ? data : p)));
    closeForm();
    toast({ title: "Learning Path Updated", description: `"${data.title}" updated.` });
  };

  const handleDeletePath = (pathId: string) => {
    const pathToDelete = learningPaths.find(p => p.id === pathId);
    setLearningPaths(prev => prev.filter(p => p.id !== pathId));
    toast({ title: "Learning Path Deleted", description: `"${pathToDelete?.title}" deleted.`, variant: "destructive" });
  };

  const openForm = (path?: LearningPath) => {
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
        <CardDescription>Create, edit, and manage guided learning paths composed of multiple courses.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6 text-right">
          <Dialog open={isFormOpen} onOpenChange={(isOpen) => { if(!isOpen) closeForm(); else setIsFormOpen(true);}}>
            <DialogTrigger asChild>
              <Button onClick={() => openForm()} className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-md">
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
              <LearningPathForm
                path={editingPath}
                allCourses={allCourses}
                onSubmit={editingPath ? handleEditPath : handleAddPath}
                onCancel={closeForm}
              />
            </DialogContent>
          </Dialog>
        </div>

        {learningPaths.length > 0 ? (
          <ul className="space-y-4">
            {learningPaths.map(path => {
              const IconComponent = path.icon && isValidLucideIcon(path.icon) ? LucideIcons[path.icon] as React.ElementType : LucideIcons.Milestone;
              return (
                <li key={path.id} className="p-3 sm:p-4 border rounded-lg bg-card flex flex-col sm:flex-row sm:items-start shadow-sm hover:shadow-md transition-shadow">
                  {path.imageUrl && (
                    <div className="relative w-full sm:w-24 h-24 sm:h-auto sm:aspect-square border rounded overflow-hidden shrink-0 bg-muted mb-2 sm:mb-0">
                      <Image src={path.imageUrl} alt={path.title} layout="fill" objectFit="cover" data-ai-hint={path.dataAiHint || 'learning path image'}/>
                    </div>
                  )}
                  <div className="flex-grow sm:ml-4">
                    <h3 className="font-semibold font-headline text-md md:text-lg flex items-center">
                      <IconComponent className="mr-2 h-5 w-5 text-accent shrink-0" />
                      {path.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">{path.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">Courses: {path.courseIds.length}</p>
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
          <p className="text-center text-muted-foreground py-4">No learning paths created yet. Add some!</p>
        )}
      </CardContent>
    </Card>
  );
}
