
"use client";
import { useState, useEffect, type FormEvent, type ChangeEvent } from 'react';
import Image from 'next/image';
import type { Course, Module, Lesson, Quiz, Question, Option, Category as PrismaCategory, QuizType as PrismaQuizTypeEnum } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Edit3, Trash2, GraduationCap, BookOpen, Clock, Link as LinkIcon, Image as ImageIcon, Info, Tag, DollarSign, Filter, Star, ListChecks, UsersIcon as TargetAudienceIcon, ShieldCheck, Timer, FileQuestion, CheckSquare, XSquare, Settings2, Eye, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { serverGetCourses, serverAddCourse, serverUpdateCourse, serverDeleteCourse, serverGetCourseById, serverGetCategories, serverGetQuizzes } from '@/actions/adminDataActions';
import type { QuizType as MockQuizEnumType } from '@/data/mockData';

type FormLesson = Partial<Omit<Lesson, 'moduleId'|'createdAt'|'updatedAt'>>;
type FormModule = Partial<Omit<Module, 'courseId'|'createdAt'|'updatedAt'>> & { lessons?: FormLesson[] };

const LessonForm = ({
  lesson,
  onSave,
  onCancel,
  moduleIndex,
  lessonIndex,
  isSubmitting,
}: {
  lesson?: FormLesson;
  onSave: (lesson: FormLesson, moduleIndex: number, lessonIndex?: number) => void;
  onCancel: () => void;
  moduleIndex: number;
  lessonIndex?: number;
  isSubmitting: boolean;
}) => {
  const [title, setTitle] = useState(lesson?.title || '');
  const [duration, setDuration] = useState(lesson?.duration || '');
  const [description, setDescription] = useState(lesson?.description || undefined);
  const [embedUrl, setEmbedUrl] = useState(lesson?.embedUrl || undefined);
  const [imageUrl, setImageUrl] = useState(lesson?.imageUrl || undefined);
  const [order, setOrder] = useState<number>(lesson?.order ?? 0);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSave({ id: lesson?.id, title, duration, description, embedUrl, imageUrl, order }, moduleIndex, lessonIndex);
  };
  return (
    <form onSubmit={handleSubmit} className="space-y-3 p-1">
      <div><Label htmlFor={`lessonTitle-${moduleIndex}-${lessonIndex}`}>Lesson Title</Label><Input id={`lessonTitle-${moduleIndex}-${lessonIndex}`} value={title} onChange={e => setTitle(e.target.value)} required disabled={isSubmitting}/></div>
      <div><Label htmlFor={`lessonDuration-${moduleIndex}-${lessonIndex}`}>Duration</Label><Input id={`lessonDuration-${moduleIndex}-${lessonIndex}`} value={duration || ''} onChange={e => setDuration(e.target.value)} required disabled={isSubmitting}/></div>
      <div><Label htmlFor={`lessonOrder-${moduleIndex}-${lessonIndex}`}>Order</Label><Input id={`lessonOrder-${moduleIndex}-${lessonIndex}`} type="number" value={order} onChange={e => setOrder(parseInt(e.target.value,10))} required disabled={isSubmitting}/></div>
      <div><Label htmlFor={`lessonDescription-${moduleIndex}-${lessonIndex}`}>Description</Label><Textarea id={`lessonDescription-${moduleIndex}-${lessonIndex}`} value={description || ''} onChange={e => setDescription(e.target.value)} disabled={isSubmitting}/></div>
      <div><Label htmlFor={`lessonEmbedUrl-${moduleIndex}-${lessonIndex}`}>Video Embed URL</Label><Input id={`lessonEmbedUrl-${moduleIndex}-${lessonIndex}`} value={embedUrl || ''} onChange={e => setEmbedUrl(e.target.value)} placeholder="YouTube, TikTok, Google Drive" disabled={isSubmitting}/></div>
      <div><Label htmlFor={`lessonImageUrl-${moduleIndex}-${lessonIndex}`}>Fallback Image URL</Label><Input id={`lessonImageUrl-${moduleIndex}-${lessonIndex}`} value={imageUrl || ''} onChange={e => setImageUrl(e.target.value)} placeholder="https://placehold.co/600x400.png" disabled={isSubmitting}/></div>
      <div className="flex justify-end space-x-2 pt-2"><Button type="button" variant="outline" size="sm" onClick={onCancel} disabled={isSubmitting}>Cancel</Button><Button type="submit" size="sm" disabled={isSubmitting}>{lesson?.id ? 'Save Lesson' : 'Add Lesson'}</Button></div>
    </form>
  );
};

const CourseForm = ({
  course,
  categories,
  allQuizzes,
  onSubmit,
  onCancel,
  isSubmitting,
}: {
  course?: Course & { modules?: (Module & { lessons?: Lesson[] })[], courseQuizzes?: { quizId: string }[] };
  categories: PrismaCategory[];
  allQuizzes: Quiz[];
  onSubmit: (data: Omit<Course, 'id' | 'createdAt' | 'updatedAt' | 'categoryId' | 'categoryNameCache' | 'enrollments' | 'paymentSubmissions' | 'certificates' | 'courseQuizzes'> & { categoryName: string, modules?: FormModule[], quizIdsToConnect?: string[] }) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}) => {
  const { toast } = useToast();
  const [title, setTitle] = useState(course?.title || '');
  const [description, setDescription] = useState(course?.description || '');
  const [categoryName, setCategoryName] = useState(course?.categoryNameCache || (categories.length > 0 ? categories[0].name : ''));
  const [instructor, setInstructor] = useState(course?.instructor || '');
  const [imageUrl, setImageUrl] = useState(course?.imageUrl || 'https://placehold.co/600x400.png');
  const [dataAiHint, setDataAiHint] = useState(course?.dataAiHint || 'education learning');
  const [price, setPrice] = useState<number | string>(course?.price ?? '');
  const [currency, setCurrency] = useState(course?.currency || 'USD');
  const [isFeatured, setIsFeatured] = useState(course?.isFeatured || false);
  const [modules, setModules] = useState<FormModule[]>(course?.modules?.map(m => ({...m, lessons: m.lessons?.map(l => ({...l})) || [] })) || []);
  const [selectedQuizIds, setSelectedQuizIds] = useState<string[]>(course?.courseQuizzes?.map(cq => cq.quizId) || []);

  const [learningObjectives, setLearningObjectives] = useState(course?.learningObjectives?.join('\n') || '');
  const [targetAudience, setTargetAudience] = useState(course?.targetAudience || undefined);
  const [prerequisites, setPrerequisites] = useState(course?.prerequisites?.join('\n') || '');
  const [estimatedTimeToComplete, setEstimatedTimeToComplete] = useState(course?.estimatedTimeToComplete || undefined);
  const [editingLesson, setEditingLesson] = useState<{ moduleIndex: number, lessonIndex?: number, lesson?: FormLesson } | null>(null);
  const [isSubmittingFormState, setIsSubmittingFormState] = useState(isSubmitting);

  useEffect(() => {
    setIsSubmittingFormState(isSubmitting);
  }, [isSubmitting]);

  const handleModuleChange = (index: number, field: keyof FormModule, value: string | number) => {
    const newModules = [...modules];
    (newModules[index] as any)[field] = value;
    setModules(newModules);
  };
  const addModule = () => setModules([...modules, { title: '', order: modules.length, lessons: [] }]);
  const removeModule = (moduleIndex: number) => setModules(modules.filter((_, i) => i !== moduleIndex));
  const saveLesson = (lessonData: FormLesson, moduleIndex: number, lessonIndex?: number) => {
    const newModules = [...modules];
    const currentModule = newModules[moduleIndex];
    if (!currentModule.lessons) currentModule.lessons = [];
    if (lessonIndex !== undefined && currentModule.lessons[lessonIndex]) {
      currentModule.lessons[lessonIndex] = { ...currentModule.lessons[lessonIndex], ...lessonData };
    } else {
      currentModule.lessons.push({id: `l-new-${Date.now()}`, ...lessonData });
    }
    setModules(newModules);
    setEditingLesson(null);
  };
  const removeLesson = (moduleIndex: number, lessonIndex: number) => {
    const newModules = [...modules];
    if (newModules[moduleIndex]?.lessons) {
        newModules[moduleIndex].lessons!.splice(lessonIndex, 1);
        setModules(newModules);
    }
  };
  
  const handleQuizSelection = (quizId: string, checked: boolean) => {
    setSelectedQuizIds(prev =>
      checked ? [...prev, quizId] : prev.filter(id => id !== quizId)
    );
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!categoryName && categories.length > 0) {
      toast({ variant: "destructive", title: "Missing Category", description: "Please select a category for the course." }); return;
    }
    if (!categoryName && categories.length === 0) {
      toast({ variant: "destructive", title: "No Categories Available", description: "Please create a category first before adding a course." }); return;
    }
    const courseDataSubmit = {
      title, description, categoryName, instructor, imageUrl, dataAiHint,
      price: Number(price) || null, currency, isFeatured,
      learningObjectives: learningObjectives.split('\n').filter(s => s.trim() !== ''),
      targetAudience, prerequisites: prerequisites.split('\n').filter(s => s.trim() !== ''),
      estimatedTimeToComplete,
      modules: modules.map(mod => ({
        id: mod.id?.startsWith('m-new-') ? undefined : mod.id, title: mod.title, order: mod.order,
        lessons: mod.lessons?.map(les => ({
            id: les.id?.startsWith('l-new-') ? undefined : les.id, title: les.title, duration: les.duration,
            description: les.description, embedUrl: les.embedUrl, imageUrl: les.imageUrl, order: les.order,
        }))
      })),
      quizIdsToConnect: selectedQuizIds,
    };
    await onSubmit(courseDataSubmit);
  };

  if (editingLesson !== null) {
    return ( <Dialog open={true} onOpenChange={(isOpen) => !isOpen && setEditingLesson(null)}>
            <DialogContent className="sm:max-w-lg"><DialogHeader>
                <DialogTitle>{editingLesson.lesson?.id && !editingLesson.lesson.id.startsWith('l-new-') ? 'Edit Lesson' : 'Add New Lesson'}</DialogTitle>
                <DialogDescription>Fill in the details for this lesson.</DialogDescription>
            </DialogHeader>
            <LessonForm lesson={editingLesson.lesson} onSave={saveLesson} onCancel={() => setEditingLesson(null)} moduleIndex={editingLesson.moduleIndex} lessonIndex={editingLesson.lessonIndex} isSubmitting={isSubmittingFormState}/>
            </DialogContent></Dialog> )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <ScrollArea className="h-[65vh] sm:h-[70vh] pr-4"><div className="space-y-4">
        <div><Label htmlFor="title">Course Title</Label><Input id="title" value={title} onChange={e => setTitle(e.target.value)} required disabled={isSubmittingFormState} /></div>
        <div><Label htmlFor="description">Description</Label><Textarea id="description" value={description} onChange={e => setDescription(e.target.value)} required disabled={isSubmittingFormState} /></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><Label htmlFor="categoryName">Category</Label><Select value={categoryName} onValueChange={setCategoryName} disabled={isSubmittingFormState || categories.length === 0}><SelectTrigger id="categoryName"><SelectValue placeholder={categories.length === 0 ? "No categories" : "Select category"} /></SelectTrigger><SelectContent>{categories.map(cat => (<SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>))}</SelectContent></Select>{categories.length === 0 && <p className="text-xs text-destructive mt-1">Add category first.</p>}</div>
          <div><Label htmlFor="instructor">Instructor</Label><Input id="instructor" value={instructor} onChange={e => setInstructor(e.target.value)} required disabled={isSubmittingFormState} /></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><Label htmlFor="price">Price (0 for free)</Label><div className="relative"><DollarSign className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input id="price" type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="e.g., 49.99" className="pl-8" step="0.01" min="0" disabled={isSubmittingFormState} /></div></div>
          <div><Label htmlFor="currency">Currency</Label><div className="relative"><Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input id="currency" value={currency} onChange={e => setCurrency(e.target.value)} placeholder="e.g., USD" className="pl-8" disabled={isSubmittingFormState} /></div></div>
        </div>
        <div className="flex items-center space-x-2 pt-2"><Checkbox id="isFeatured" checked={isFeatured} onCheckedChange={(checked) => setIsFeatured(checked as boolean)} disabled={isSubmittingFormState} /><Label htmlFor="isFeatured" className="text-sm font-medium leading-none">Mark as Featured</Label></div>
        <div><Label htmlFor="imageUrl">Image URL</Label><div className="relative"><Input id="imageUrl" value={imageUrl || ''} onChange={e => setImageUrl(e.target.value)} className="pl-8" disabled={isSubmittingFormState}/><ImageIcon className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /></div>{imageUrl && (<div className="mt-2 relative w-40 aspect-video border rounded overflow-hidden bg-muted"><Image src={imageUrl} alt="Preview" layout="fill" objectFit="cover" key={imageUrl}/></div>)}</div>
        <div><Label htmlFor="dataAiHint">Image AI Hint</Label><div className="relative"><Input id="dataAiHint" value={dataAiHint || ''} onChange={e => setDataAiHint(e.target.value)} placeholder="e.g. tech learning" className="pl-8" disabled={isSubmittingFormState}/><Info className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /></div></div>
        <div className="pt-4 border-t"><h3 className="text-lg font-semibold mb-3">Additional Info</h3><div className="space-y-4">
          <div><Label htmlFor="learningObjectives" className="flex items-center"><ListChecks className="mr-2 h-4 w-4"/>Learning Objectives (one per line)</Label><Textarea id="learningObjectives" value={learningObjectives} onChange={e => setLearningObjectives(e.target.value)} rows={4} placeholder="Students will..." disabled={isSubmittingFormState}/></div>
          <div><Label htmlFor="targetAudience" className="flex items-center"><TargetAudienceIcon className="mr-2 h-4 w-4"/>Target Audience</Label><Input id="targetAudience" value={targetAudience || ''} onChange={e => setTargetAudience(e.target.value)} placeholder="e.g., Beginners" disabled={isSubmittingFormState}/></div>
          <div><Label htmlFor="prerequisites" className="flex items-center"><ShieldCheck className="mr-2 h-4 w-4"/>Prerequisites (one per line)</Label><Textarea id="prerequisites" value={prerequisites} onChange={e => setPrerequisites(e.target.value)} rows={3} placeholder="Basic HTML..." disabled={isSubmittingFormState}/></div>
          <div><Label htmlFor="estimatedTimeToComplete" className="flex items-center"><Timer className="mr-2 h-4 w-4"/>Estimated Time</Label><Input id="estimatedTimeToComplete" value={estimatedTimeToComplete || ''} onChange={e => setEstimatedTimeToComplete(e.target.value)} placeholder="e.g., Approx. 20 hours" disabled={isSubmittingFormState}/></div>
        </div></div>
        <div className="space-y-4 pt-4 border-t"><h3 className="text-lg font-semibold flex items-center"><BookOpen className="mr-2 h-5 w-5"/>Modules</h3><Accordion type="multiple" className="w-full" defaultValue={modules.map((m, idx) => m.id || `module-${idx}`)}>{modules.map((module, moduleIndex) => (
          <AccordionItem value={module.id || `module-item-${moduleIndex}`} key={module.id || `module-item-${moduleIndex}`}>
            <AccordionTrigger className="hover:no-underline"><Input value={module.title || ''} onChange={e => handleModuleChange(moduleIndex, 'title', e.target.value)} placeholder={`Module ${moduleIndex + 1} Title`} className="text-md font-medium flex-grow mr-2" onClick={(e) => e.stopPropagation()} disabled={isSubmittingFormState}/></AccordionTrigger>
            <AccordionContent className="pl-2"><div className="space-y-3">{module.lessons?.map((lesson, lessonIndex) => (
              <Card key={lesson.id || `lesson-${lessonIndex}`} className="p-3 bg-muted/30"><div className="flex justify-between items-start"><div><p className="font-medium text-sm">{lesson.title}</p><p className="text-xs text-muted-foreground">{lesson.duration} {lesson.embedUrl && <LinkIcon className="inline h-3 w-3 ml-1"/>}</p></div><div className="flex space-x-1 shrink-0"><Button type="button" variant="ghost" size="icon_sm" onClick={() => setEditingLesson({ moduleIndex, lessonIndex, lesson })} disabled={isSubmittingFormState}><Edit3 className="h-4 w-4" /></Button><Button type="button" variant="ghost" size="icon_sm" onClick={() => removeLesson(moduleIndex, lessonIndex)} disabled={isSubmittingFormState}><Trash2 className="h-4 w-4 text-destructive" /></Button></div></div></Card>))}
              <Button type="button" variant="outline" size="sm" onClick={() => setEditingLesson({ moduleIndex, lesson: { title: '', duration: '', order: (module.lessons?.length || 0) } })} disabled={isSubmittingFormState}><PlusCircle className="mr-2 h-4 w-4" /> Add Lesson</Button></div></AccordionContent>
            <Button type="button" variant="ghost" size="sm" className="mt-1 text-destructive hover:text-destructive-foreground hover:bg-destructive/90 w-full justify-start text-xs" onClick={() => removeModule(moduleIndex)} disabled={isSubmittingFormState}><Trash2 className="mr-2 h-3 w-3" /> Remove Module {moduleIndex + 1}</Button>
          </AccordionItem>))}</Accordion><Button type="button" onClick={addModule} variant="outline" className="w-full" disabled={isSubmittingFormState}><PlusCircle className="mr-2 h-4 w-4" /> Add Module</Button></div>
        
        <div className="space-y-4 pt-4 border-t">
            <h3 className="text-lg font-semibold flex items-center"><FileQuestion className="mr-2 h-5 w-5"/>Link Quizzes to Course</h3>
            <Card className="max-h-60 overflow-y-auto p-3 bg-muted/30">
                {allQuizzes.length > 0 ? allQuizzes.map(quiz => (
                <div key={quiz.id} className="flex items-center space-x-2 py-1.5">
                    <Checkbox id={`link-quiz-${quiz.id}`} checked={selectedQuizIds.includes(quiz.id)} onCheckedChange={(checked) => handleQuizSelection(quiz.id, checked as boolean)} disabled={isSubmittingFormState}/>
                    <Label htmlFor={`link-quiz-${quiz.id}`} className="text-sm font-normal">{quiz.title} <span className="text-xs text-muted-foreground">({quiz.quizType.toLowerCase()})</span></Label>
                </div>
                )) : <p className="text-xs text-muted-foreground text-center py-2">No quizzes available. Create quizzes in the "Quiz Management" section first.</p>}
            </Card>
        </div>

      </div></ScrollArea>
      <DialogFooter className="pt-6 border-t"><DialogClose asChild><Button type="button" variant="outline" onClick={onCancel} disabled={isSubmittingFormState}>Cancel</Button></DialogClose><Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90" disabled={isSubmittingFormState}>{isSubmittingFormState ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}{course?.id ? 'Save Changes' : 'Add Course'}</Button></DialogFooter>
    </form>
  );
};

export default function CourseManagement() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<PrismaCategory[]>([]);
  const [allQuizzes, setAllQuizzes] = useState<Quiz[]>([]);
  const [editingCourse, setEditingCourse] = useState<(Course & { modules?: (Module & { lessons?: Lesson[] })[], courseQuizzes?: { quizId: string }[] }) | undefined>(undefined);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isSubmittingFormStateInternal, setIsSubmittingFormStateInternal] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoadingData(true);
      try {
        const [dbCourses, dbCategories, dbQuizzes] = await Promise.all([serverGetCourses(), serverGetCategories(), serverGetQuizzes()]);
        setCourses(dbCourses);
        setCategories(dbCategories);
        setAllQuizzes(dbQuizzes);
      } catch (error) {
        toast({ variant: "destructive", title: "Load Error", description: "Could not load initial data." });
      }
      setIsLoadingData(false);
    };
    loadInitialData();
  }, [toast]);

  const handleAddCourse = async (data: any) => {
    setIsSubmittingFormStateInternal(true);
    try {
      const newCourse = await serverAddCourse(data);
      setCourses(prev => [newCourse, ...prev].sort((a, b) => a.title.localeCompare(b.title)));
      closeForm();
      toast({ title: "Course Added", description: `"${data.title}" added.` });
    } catch (error) {
      toast({ variant: "destructive", title: "Error Adding Course", description: (error as Error).message });
    } finally { setIsSubmittingFormStateInternal(false); }
  };

  const handleEditCourse = async (data: any) => {
    if (!editingCourse || !editingCourse.id) return;
    setIsSubmittingFormStateInternal(true);
    try {
      const updatedCourse = await serverUpdateCourse(editingCourse.id, data);
      setCourses(prev => prev.map(c => c.id === editingCourse.id ? updatedCourse : c).sort((a,b) => a.title.localeCompare(b.title)));
      closeForm();
      toast({ title: "Course Updated", description: `"${data.title}" updated.` });
    } catch (error) {
      toast({ variant: "destructive", title: "Error Updating Course", description: (error as Error).message });
    } finally { setIsSubmittingFormStateInternal(false); }
  };

  const handleDeleteCourse = async (courseId: string) => {
    const courseToDelete = courses.find(c => c.id === courseId);
    try {
      await serverDeleteCourse(courseId);
      setCourses(prev => prev.filter(c => c.id !== courseId));
      toast({ title: "Course Deleted", description: `"${courseToDelete?.title}" deleted.`, variant: "destructive" });
    } catch (error) { toast({ variant: "destructive", title: "Error Deleting Course", description: (error as Error).message }); }
  };

  const openForm = async (courseId?: string) => {
    setIsLoadingData(true); // Show loading when opening form for editing to fetch latest data
    if (courseId) {
      try {
        const courseToEdit = await serverGetCourseById(courseId);
        if (courseToEdit) {
          const courseWithQuizIds = {
            ...courseToEdit,
            // @ts-ignore
            courseQuizzes: courseToEdit.courseQuizzes?.map(cq => ({ quizId: cq.quiz.id })) || []
          };
          setEditingCourse(courseWithQuizIds as any);
        } else { 
          toast({variant: "destructive", title: "Error", description: "Could not fetch course for editing."}); 
          setIsLoadingData(false); return; 
        }
      } catch (error) { 
        toast({variant: "destructive", title: "Error", description: "Failed to fetch course."}); 
        setIsLoadingData(false); return; 
      }
    } else {
      setEditingCourse(undefined);
    }
    setIsLoadingData(false);
    setIsFormOpen(true);
  };
  const closeForm = () => { setIsFormOpen(false); setEditingCourse(undefined); };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center text-xl md:text-2xl font-headline"><GraduationCap className="mr-2 md:mr-3 h-6 w-6 md:h-7 md:w-7 text-primary" /> Course Management</CardTitle>
        <CardDescription>Add, edit, or delete courses. Link quizzes to courses.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6 text-right">
          <Dialog open={isFormOpen} onOpenChange={(isOpen) => { if(!isOpen) closeForm(); else setIsFormOpen(true);}}>
            <DialogTrigger asChild><Button onClick={() => openForm()} className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-md w-full sm:w-auto" disabled={isLoadingData && !isFormOpen}><PlusCircle className="mr-2 h-5 w-5" /> Add New Course</Button></DialogTrigger>
            <DialogContent className="sm:max-w-2xl md:max-w-3xl lg:max-w-4xl">
              <DialogHeader className="pb-4">
                <DialogTitle className="font-headline text-xl">{editingCourse ? 'Edit Course' : 'Add New Course'}</DialogTitle>
                <DialogDescription>
                    {editingCourse ? 'Modify course details, modules, and linked quizzes.' : 'Define a new course, add modules, and link quizzes.'}
                </DialogDescription>
              </DialogHeader>
              {isFormOpen && !isLoadingData ? (<CourseForm course={editingCourse} categories={categories} allQuizzes={allQuizzes} onSubmit={editingCourse ? handleEditCourse : handleAddCourse} onCancel={closeForm} isSubmitting={isSubmittingFormStateInternal}/>
              ) : (isFormOpen && isLoadingData) ? (<div className="flex justify-center items-center p-10"><Loader2 className="h-6 w-6 animate-spin text-primary"/> Initializing form...</div>) : null }
            </DialogContent>
          </Dialog>
        </div>
        {isLoadingData && courses.length === 0 ? ( <div className="flex justify-center items-center py-10"><Loader2 className="h-8 w-8 animate-spin text-primary" /><p className="ml-2 text-muted-foreground">Loading courses...</p></div>
        ) : courses.length > 0 ? (
          <ul className="space-y-4">{courses.map(course => (
            <li key={course.id} className="p-3 sm:p-4 border rounded-lg bg-card flex flex-col gap-3 sm:flex-row sm:items-start shadow-sm hover:shadow-md transition-shadow">
              {course.imageUrl && (<div className="relative w-full sm:w-32 h-32 sm:h-auto sm:aspect-video border rounded overflow-hidden shrink-0 bg-muted mb-2 sm:mb-0"><Image src={course.imageUrl} alt={course.title} layout="fill" objectFit="cover" data-ai-hint={course.dataAiHint || 'course image'} /></div>)}
              <div className="flex-grow sm:ml-4">
                <h3 className="font-semibold font-headline text-md md:text-lg flex items-center">{course.title}{course.isFeatured && <Star className="ml-2 h-4 w-4 text-yellow-500 fill-yellow-400" />}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">{course.description}</p>
                <div className="text-xs text-muted-foreground mt-1"><span>Category: {course.categoryNameCache}</span> | <span>Instructor: {course.instructor}</span></div>
                { /* @ts-ignore */ }
                <div className="text-xs text-muted-foreground">Modules: {course.modules?.length || 0} | Quizzes: {course.courseQuizzes?.length || 0} | Price: {course.price && course.price > 0 ? `${course.price} ${course.currency}` : 'Free'}</div>
              </div>
              <div className="flex flex-col sm:flex-row sm:space-x-2 gap-2 sm:gap-0 w-full sm:w-auto sm:items-center mt-2 sm:mt-0 shrink-0 self-start sm:self-center">
                <Button variant="outline" size="sm" onClick={() => openForm(course.id)} className="w-full sm:w-auto hover:border-primary hover:text-primary"><Edit3 className="mr-1 h-4 w-4" /> Edit</Button>
                <Dialog><DialogTrigger asChild><Button variant="destructive" size="sm" className="w-full sm:w-auto"><Trash2 className="mr-1 h-4 w-4" /> Delete</Button></DialogTrigger>
                  <DialogContent className="sm:max-w-xs"><DialogHeader><DialogTitle>Confirm Deletion</DialogTitle><DialogDescription>Delete course "{course.title}"?</DialogDescription></DialogHeader>
                  <DialogFooter className="pt-2"><DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose><DialogClose asChild><Button variant="destructive" onClick={() => handleDeleteCourse(course.id)}>Delete Course</Button></DialogClose></DialogFooter></DialogContent></Dialog>
              </div></li>))}</ul>
        ) : (<p className="text-center text-muted-foreground py-4">No courses found.</p>)}
      </CardContent>
    </Card>
  );
}

    