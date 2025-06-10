
"use client";
import { useState, useEffect, type FormEvent, type ChangeEvent } from 'react';
import Image from 'next/image';
import { courses as initialCoursesData, type Course, type Module, type Lesson } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Edit3, Trash2, GraduationCap, BookOpen, Clock, Link as LinkIcon, Image as ImageIcon, Info, Tag, DollarSign, Filter, Star, ListChecks, UsersIcon as TargetAudienceIcon, ShieldCheck, Timer } from 'lucide-react';
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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';

const LessonForm = ({
  lesson,
  onSave,
  onCancel,
  moduleIndex,
  lessonIndex,
}: {
  lesson?: Partial<Lesson>;
  onSave: (lesson: Lesson, moduleIndex: number, lessonIndex?: number) => void;
  onCancel: () => void;
  moduleIndex: number;
  lessonIndex?: number;
}) => {
  const [title, setTitle] = useState(lesson?.title || '');
  const [duration, setDuration] = useState(lesson?.duration || '');
  const [description, setDescription] = useState(lesson?.description || '');
  const [embedUrl, setEmbedUrl] = useState(lesson?.embedUrl || '');
  const [imageUrl, setImageUrl] = useState(lesson?.imageUrl || '');


  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSave({ 
      id: lesson?.id || `l${Date.now()}`, 
      title, 
      duration, 
      description, 
      embedUrl,
      imageUrl
    }, moduleIndex, lessonIndex);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 p-1">
      <div>
        <Label htmlFor={`lessonTitle-${moduleIndex}-${lessonIndex}`}>Lesson Title</Label>
        <Input id={`lessonTitle-${moduleIndex}-${lessonIndex}`} value={title} onChange={e => setTitle(e.target.value)} required />
      </div>
      <div>
        <Label htmlFor={`lessonDuration-${moduleIndex}-${lessonIndex}`}>Duration (e.g., 10min)</Label>
        <Input id={`lessonDuration-${moduleIndex}-${lessonIndex}`} value={duration} onChange={e => setDuration(e.target.value)} required />
      </div>
      <div>
        <Label htmlFor={`lessonDescription-${moduleIndex}-${lessonIndex}`}>Description</Label>
        <Textarea id={`lessonDescription-${moduleIndex}-${lessonIndex}`} value={description} onChange={e => setDescription(e.target.value)} />
      </div>
       <div>
        <Label htmlFor={`lessonEmbedUrl-${moduleIndex}-${lessonIndex}`}>Video Embed URL (YouTube, TikTok, Google Drive)</Label>
        <Input id={`lessonEmbedUrl-${moduleIndex}-${lessonIndex}`} value={embedUrl} onChange={e => setEmbedUrl(e.target.value)} placeholder="https://www.youtube.com/watch?v=..."/>
      </div>
      <div>
        <Label htmlFor={`lessonImageUrl-${moduleIndex}-${lessonIndex}`}>Fallback Image URL (if no video)</Label>
        <Input id={`lessonImageUrl-${moduleIndex}-${lessonIndex}`} value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="https://placehold.co/600x400.png"/>
      </div>
      <div className="flex justify-end space-x-2 pt-2">
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>Cancel</Button>
        <Button type="submit" size="sm">{lesson?.id ? 'Save Lesson' : 'Add Lesson'}</Button>
      </div>
    </form>
  );
};

const CourseForm = ({
  course,
  onSubmit,
  onCancel,
}: {
  course?: Course;
  onSubmit: (data: Course) => void;
  onCancel: () => void;
}) => {
  const [title, setTitle] = useState(course?.title || '');
  const [description, setDescription] = useState(course?.description || '');
  const [category, setCategory] = useState(course?.category || '');
  const [instructor, setInstructor] = useState(course?.instructor || '');
  const [imageUrl, setImageUrl] = useState(course?.imageUrl || 'https://placehold.co/600x400.png');
  const [dataAiHint, setDataAiHint] = useState(course?.dataAiHint || 'education learning');
  const [price, setPrice] = useState<number | string>(course?.price ?? '');
  const [currency, setCurrency] = useState(course?.currency || 'USD');
  const [isFeatured, setIsFeatured] = useState(course?.isFeatured || false);
  const [modules, setModules] = useState<Module[]>(course?.modules || []);

  const [learningObjectives, setLearningObjectives] = useState(course?.learningObjectives?.join('\n') || '');
  const [targetAudience, setTargetAudience] = useState(course?.targetAudience || '');
  const [prerequisites, setPrerequisites] = useState(course?.prerequisites?.join('\n') || '');
  const [estimatedTimeToComplete, setEstimatedTimeToComplete] = useState(course?.estimatedTimeToComplete || '');


  const [editingLesson, setEditingLesson] = useState<{ moduleIndex: number, lessonIndex?: number, lesson?: Partial<Lesson> } | null>(null);


  const handleModuleChange = (index: number, field: keyof Module, value: string) => {
    const newModules = [...modules];
    (newModules[index] as any)[field] = value;
    setModules(newModules);
  };

  const addModule = () => {
    setModules([...modules, { id: `m${Date.now()}`, title: '', lessons: [] }]);
  };

  const removeModule = (index: number) => {
    setModules(modules.filter((_, i) => i !== index));
  };
  
  const saveLesson = (lessonData: Lesson, moduleIndex: number, lessonIndex?: number) => {
    const newModules = [...modules];
    if (lessonIndex !== undefined) { 
      newModules[moduleIndex].lessons[lessonIndex] = lessonData;
    } else { 
      newModules[moduleIndex].lessons.push(lessonData);
    }
    setModules(newModules);
    setEditingLesson(null);
  };

  const removeLesson = (moduleIndex: number, lessonIndex: number) => {
    const newModules = [...modules];
    newModules[moduleIndex].lessons.splice(lessonIndex, 1);
    setModules(newModules);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const courseData: Course = {
      id: course?.id || `course${Date.now()}`,
      title,
      description,
      category,
      instructor,
      imageUrl,
      dataAiHint,
      price: Number(price) || 0, 
      currency,
      isFeatured,
      learningObjectives: learningObjectives.split('\n').filter(s => s.trim() !== ''),
      targetAudience,
      prerequisites: prerequisites.split('\n').filter(s => s.trim() !== ''),
      estimatedTimeToComplete,
      modules,
    };
    onSubmit(courseData);
  };

  if (editingLesson !== null) {
    return (
         <Dialog open={true} onOpenChange={(isOpen) => !isOpen && setEditingLesson(null)}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>{editingLesson.lesson?.id ? 'Edit Lesson' : 'Add New Lesson'}</DialogTitle>
                    <DialogDescription>
                        {editingLesson.lesson?.id ? 'Modify the details of this lesson.' : 'Fill in the details for the new lesson.'}
                    </DialogDescription>
                </DialogHeader>
                 <LessonForm
                    lesson={editingLesson.lesson}
                    onSave={saveLesson}
                    onCancel={() => setEditingLesson(null)}
                    moduleIndex={editingLesson.moduleIndex}
                    lessonIndex={editingLesson.lessonIndex}
                />
            </DialogContent>
        </Dialog>
    )
  }


  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <ScrollArea className="h-[65vh] sm:h-[70vh] pr-4">
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Course Title</Label>
            <Input id="title" value={title} onChange={e => setTitle(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" value={description} onChange={e => setDescription(e.target.value)} required />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Category</Label>
              <Input id="category" value={category} onChange={e => setCategory(e.target.value)} placeholder="e.g., Web Development" required />
            </div>
            <div>
              <Label htmlFor="instructor">Instructor</Label>
              <Input id="instructor" value={instructor} onChange={e => setInstructor(e.target.value)} required />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price">Price (0 for free)</Label>
              <div className="relative">
                <DollarSign className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="price" type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="e.g., 49.99" className="pl-8" step="0.01" min="0" />
              </div>
            </div>
            <div>
              <Label htmlFor="currency">Currency</Label>
              <div className="relative">
                <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="currency" value={currency} onChange={e => setCurrency(e.target.value)} placeholder="e.g., USD" className="pl-8" />
              </div>
            </div>
          </div>
           <div className="flex items-center space-x-2 pt-2">
            <Checkbox id="isFeatured" checked={isFeatured} onCheckedChange={(checked) => setIsFeatured(checked as boolean)} />
            <Label htmlFor="isFeatured" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Mark as Featured Course
            </Label>
          </div>
          <div>
            <Label htmlFor="imageUrl">Course Image URL</Label>
            <div className="relative">
                <Input id="imageUrl" value={imageUrl} onChange={e => setImageUrl(e.target.value)} className="pl-8"/>
                <ImageIcon className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
            {imageUrl && (
                <div className="mt-2 relative w-40 aspect-video border rounded overflow-hidden bg-muted">
                <Image src={imageUrl} alt="Image preview" layout="fill" objectFit="cover" key={imageUrl}/>
                </div>
            )}
          </div>
          <div>
            <Label htmlFor="dataAiHint">Image AI Hint (for Unsplash search)</Label>
            <div className="relative">
                <Input id="dataAiHint" value={dataAiHint} onChange={e => setDataAiHint(e.target.value)} placeholder="e.g. technology learning" className="pl-8"/>
                <Info className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          {/* New Fields for Course Details */}
          <div className="pt-4 border-t">
            <h3 className="text-lg font-semibold mb-3">Additional Course Information</h3>
            <div className="space-y-4">
                <div>
                    <Label htmlFor="learningObjectives" className="flex items-center"><ListChecks className="mr-2 h-4 w-4 text-muted-foreground"/> Learning Objectives (one per line)</Label>
                    <Textarea id="learningObjectives" value={learningObjectives} onChange={e => setLearningObjectives(e.target.value)} rows={4} placeholder="Students will be able to...\nUnderstand concept X..."/>
                </div>
                <div>
                    <Label htmlFor="targetAudience" className="flex items-center"><TargetAudienceIcon className="mr-2 h-4 w-4 text-muted-foreground"/> Target Audience</Label>
                    <Input id="targetAudience" value={targetAudience} onChange={e => setTargetAudience(e.target.value)} placeholder="e.g., Beginners, Advanced Developers"/>
                </div>
                <div>
                    <Label htmlFor="prerequisites" className="flex items-center"><ShieldCheck className="mr-2 h-4 w-4 text-muted-foreground"/> Prerequisites (one per line)</Label>
                    <Textarea id="prerequisites" value={prerequisites} onChange={e => setPrerequisites(e.target.value)} rows={3} placeholder="Basic HTML knowledge\nFamiliarity with JavaScript..."/>
                </div>
                <div>
                    <Label htmlFor="estimatedTimeToComplete" className="flex items-center"><Timer className="mr-2 h-4 w-4 text-muted-foreground"/> Estimated Time to Complete</Label>
                    <Input id="estimatedTimeToComplete" value={estimatedTimeToComplete} onChange={e => setEstimatedTimeToComplete(e.target.value)} placeholder="e.g., Approx. 20 hours"/>
                </div>
            </div>
          </div>


          <div className="space-y-4 pt-4 border-t">
            <h3 className="text-lg font-semibold flex items-center"><BookOpen className="mr-2 h-5 w-5 text-primary"/> Modules</h3>
            <Accordion type="multiple" className="w-full" defaultValue={modules.map(m => m.id)}>
              {modules.map((module, moduleIndex) => (
                <AccordionItem value={module.id || `module-${moduleIndex}`} key={module.id || `module-item-${moduleIndex}`}>
                  <AccordionTrigger className="hover:no-underline">
                    <Input
                      value={module.title}
                      onChange={e => handleModuleChange(moduleIndex, 'title', e.target.value)}
                      placeholder={`Module ${moduleIndex + 1} Title`}
                      className="text-md font-medium flex-grow mr-2"
                      onClick={(e) => e.stopPropagation()} 
                    />
                  </AccordionTrigger>
                  <AccordionContent className="pl-2">
                    <div className="space-y-3">
                      {module.lessons.map((lesson, lessonIndex) => (
                        <Card key={lesson.id || `lesson-${lessonIndex}`} className="p-3 bg-muted/30">
                           <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-medium text-sm">{lesson.title}</p>
                                    <p className="text-xs text-muted-foreground">{lesson.duration} {lesson.embedUrl && <LinkIcon className="inline h-3 w-3 ml-1"/>}</p>
                                </div>
                                <div className="flex space-x-1 shrink-0">
                                    <Button type="button" variant="ghost" size="icon_sm" onClick={() => setEditingLesson({ moduleIndex, lessonIndex, lesson })}>
                                        <Edit3 className="h-4 w-4" />
                                    </Button>
                                    <Button type="button" variant="ghost" size="icon_sm" onClick={() => removeLesson(moduleIndex, lessonIndex)}>
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </div>
                           </div>
                        </Card>
                      ))}
                      <Button type="button" variant="outline" size="sm" onClick={() => setEditingLesson({ moduleIndex, lesson: { title: '', duration: ''} })}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Lesson
                      </Button>
                    </div>
                  </AccordionContent>
                  <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="mt-1 text-destructive hover:text-destructive-foreground hover:bg-destructive/90 w-full justify-start text-xs"
                      onClick={() => removeModule(moduleIndex)}
                    >
                      <Trash2 className="mr-2 h-3 w-3" /> Remove Module {moduleIndex + 1}
                    </Button>
                </AccordionItem>
              ))}
            </Accordion>
            <Button type="button" onClick={addModule} variant="outline" className="w-full">
              <PlusCircle className="mr-2 h-4 w-4" /> Add Module
            </Button>
          </div>
        </div>
      </ScrollArea>
      <DialogFooter className="pt-6 border-t">
        <DialogClose asChild>
          <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        </DialogClose>
        <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90">
          {course?.id ? 'Save Changes' : 'Add Course'}
        </Button>
      </DialogFooter>
    </form>
  );
};

export default function CourseManagement() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [editingCourse, setEditingCourse] = useState<Course | undefined>(undefined);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const storedCoursesString = localStorage.getItem('adminCourses');
    if (storedCoursesString) {
      try {
        const parsedCourses = JSON.parse(storedCoursesString) as Course[];
        setCourses(parsedCourses);
      } catch (e) {
        console.error("Failed to parse courses from localStorage", e);
        setCourses(initialCoursesData); 
      }
    } else {
      setCourses(initialCoursesData); 
    }
    setIsDataLoaded(true);
  }, []);

  useEffect(() => {
    if (isDataLoaded) {
      localStorage.setItem('adminCourses', JSON.stringify(courses));
    }
  }, [courses, isDataLoaded]);


  const handleAddCourse = (data: Course) => {
    setCourses(prev => [{ ...data, id: data.id || `course${Date.now()}` }, ...prev]); 
    setIsFormOpen(false);
    setEditingCourse(undefined);
    toast({ title: "Course Added", description: `${data.title} has been successfully added.` });
  };

  const handleEditCourse = (data: Course) => {
    setCourses(prev => prev.map(c => c.id === data.id ? data : c));
    setEditingCourse(undefined);
    setIsFormOpen(false);
    toast({ title: "Course Updated", description: `${data.title} has been successfully updated.` });
  };

  const handleDeleteCourse = (courseId: string) => {
    const courseToDelete = courses.find(c => c.id === courseId);
    setCourses(prev => prev.filter(c => c.id !== courseId));
    toast({ title: "Course Deleted", description: `${courseToDelete?.title ?? 'Course'} has been deleted.`, variant: "destructive" });
  };

  const openForm = (course?: Course) => {
    setEditingCourse(course ? JSON.parse(JSON.stringify(course)) : undefined); 
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingCourse(undefined);
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center text-xl md:text-2xl font-headline">
          <GraduationCap className="mr-2 md:mr-3 h-6 w-6 md:h-7 md:w-7 text-primary" /> Course Management
        </CardTitle>
        <CardDescription>Add, edit, or delete courses, modules, lessons, set prices, and mark featured courses.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6 text-right">
          <Dialog open={isFormOpen} onOpenChange={(isOpen) => { if(!isOpen) closeForm(); else setIsFormOpen(true);}}>
            <DialogTrigger asChild>
              <Button onClick={() => openForm()} className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-md hover:shadow-sm active:translate-y-px transition-all duration-150 w-full sm:w-auto">
                <PlusCircle className="mr-2 h-5 w-5" /> Add New Course
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl md:max-w-3xl"> 
              <DialogHeader className="pb-4">
                <DialogTitle className="font-headline text-xl md:text-2xl">{editingCourse ? 'Edit Course' : 'Add New Course'}</DialogTitle>
                <DialogDescription>
                  {editingCourse ? 'Modify the details of the existing course.' : 'Fill in the details for the new course.'}
                </DialogDescription>
              </DialogHeader>
              <CourseForm
                course={editingCourse}
                onSubmit={editingCourse ? handleEditCourse : handleAddCourse}
                onCancel={closeForm}
              />
            </DialogContent>
          </Dialog>
        </div>

        {courses.length > 0 ? (
          <ul className="space-y-4">
            {courses.map(course => (
              <li key={course.id} className="p-3 sm:p-4 border rounded-lg bg-card flex flex-col gap-3 sm:flex-row sm:items-start shadow-sm hover:shadow-md transition-shadow">
                {course.imageUrl && (
                  <div className="relative w-full sm:w-32 h-32 sm:h-auto sm:aspect-video border rounded overflow-hidden shrink-0 bg-muted mb-2 sm:mb-0">
                    <Image src={course.imageUrl} alt={course.title} layout="fill" objectFit="cover" data-ai-hint={course.dataAiHint || 'course image'} />
                  </div>
                )}
                <div className="flex-grow sm:ml-4">
                  <h3 className="font-semibold font-headline text-md md:text-lg flex items-center">
                    {course.title}
                    {course.isFeatured && <Star className="ml-2 h-4 w-4 text-yellow-500 fill-yellow-400" />}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">{course.description}</p>
                  <div className="text-xs text-muted-foreground mt-1">
                    <span>Category: {course.category}</span> | <span>Instructor: {course.instructor}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Modules: {course.modules?.length || 0} | Price: {course.price && course.price > 0 ? `${course.price} ${course.currency}` : 'Free'}
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:space-x-2 gap-2 sm:gap-0 w-full sm:w-auto sm:items-center mt-2 sm:mt-0 shrink-0 self-start sm:self-center">
                  <Button variant="outline" size="sm" onClick={() => openForm(course)} className="w-full sm:w-auto hover:border-primary hover:text-primary">
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
                          Are you sure you want to delete the course "{course.title}"? This action cannot be undone.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter className="pt-2">
                        <DialogClose asChild>
                          <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <DialogClose asChild>
                          <Button variant="destructive" onClick={() => handleDeleteCourse(course.id)}>Delete Course</Button>
                        </DialogClose>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-muted-foreground py-4">No courses available. Add some!</p>
        )}
      </CardContent>
    </Card>
  );
}
