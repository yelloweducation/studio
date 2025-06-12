
"use client";
import { useState, useEffect, type FormEvent, type ChangeEvent } from 'react';
import Image from 'next/image';
import type { Course, Module, Lesson, Quiz, Question, Option, Category as PrismaCategory } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Edit3, Trash2, GraduationCap, BookOpen, Clock, Link as LinkIcon, Image as ImageIcon, Info, Tag, DollarSign, Filter, Star, ListChecks, UsersIcon as TargetAudienceIcon, ShieldCheck, Timer, FileQuestion, CheckSquare, XSquare, Settings2, Eye, Loader2 } from 'lucide-react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// Use Server Actions
import { 
    serverGetCourses, 
    serverAddCourse, 
    serverUpdateCourse, 
    serverDeleteCourse,
    serverSaveQuizWithQuestions,
    serverGetCourseById, 
    serverGetCategories,
} from '@/actions/adminDataActions'; 
import type { Course as MockCourseType, Module as MockModuleType, Lesson as MockLessonType, Quiz as MockQuizType, Question as MockQuestionType, Option as MockOptionType, QuizType as MockQuizEnumType } from '@/data/mockData';


const generateQuestionId = () => `q-new-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
const generateOptionId = () => `opt-new-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;


const LessonForm = ({
  lesson,
  onSave,
  onCancel,
  moduleIndex,
  lessonIndex,
  isSubmitting,
}: {
  lesson?: Partial<Omit<Lesson, 'moduleId'|'createdAt'|'updatedAt'>>;
  onSave: (lesson: Partial<Omit<Lesson, 'moduleId'|'createdAt'|'updatedAt'>>, moduleIndex: number, lessonIndex?: number) => void;
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
    onSave({
      id: lesson?.id, 
      title,
      duration,
      description,
      embedUrl,
      imageUrl,
      order, 
    }, moduleIndex, lessonIndex);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 p-1">
      <div>
        <Label htmlFor={`lessonTitle-${moduleIndex}-${lessonIndex}`}>Lesson Title</Label>
        <Input id={`lessonTitle-${moduleIndex}-${lessonIndex}`} value={title} onChange={e => setTitle(e.target.value)} required disabled={isSubmitting}/>
      </div>
      <div>
        <Label htmlFor={`lessonDuration-${moduleIndex}-${lessonIndex}`}>Duration (e.g., 10min)</Label>
        <Input id={`lessonDuration-${moduleIndex}-${lessonIndex}`} value={duration || ''} onChange={e => setDuration(e.target.value)} required disabled={isSubmitting}/>
      </div>
      <div>
        <Label htmlFor={`lessonOrder-${moduleIndex}-${lessonIndex}`}>Order</Label>
        <Input id={`lessonOrder-${moduleIndex}-${lessonIndex}`} type="number" value={order} onChange={e => setOrder(parseInt(e.target.value,10))} required disabled={isSubmitting}/>
      </div>
      <div>
        <Label htmlFor={`lessonDescription-${moduleIndex}-${lessonIndex}`}>Description</Label>
        <Textarea id={`lessonDescription-${moduleIndex}-${lessonIndex}`} value={description || ''} onChange={e => setDescription(e.target.value)} disabled={isSubmitting}/>
      </div>
       <div>
        <Label htmlFor={`lessonEmbedUrl-${moduleIndex}-${lessonIndex}`}>Video Embed URL (YouTube, TikTok, Google Drive)</Label>
        <Input id={`lessonEmbedUrl-${moduleIndex}-${lessonIndex}`} value={embedUrl || ''} onChange={e => setEmbedUrl(e.target.value)} placeholder="https://www.youtube.com/watch?v=..." disabled={isSubmitting}/>
      </div>
      <div>
        <Label htmlFor={`lessonImageUrl-${moduleIndex}-${lessonIndex}`}>Fallback Image URL (if no video)</Label>
        <Input id={`lessonImageUrl-${moduleIndex}-${lessonIndex}`} value={imageUrl || ''} onChange={e => setImageUrl(e.target.value)} placeholder="https://placehold.co/600x400.png" disabled={isSubmitting}/>
      </div>
      <div className="flex justify-end space-x-2 pt-2">
        <Button type="button" variant="outline" size="sm" onClick={onCancel} disabled={isSubmitting}>Cancel</Button>
        <Button type="submit" size="sm" disabled={isSubmitting}>{lesson?.id ? 'Save Lesson' : 'Add Lesson'}</Button>
      </div>
    </form>
  );
};


const QuestionEditDialog = ({
  questionToEdit,
  onSaveQuestion,
  onCancel,
  isSubmitting,
}: {
  questionToEdit: Partial<Omit<Question, 'quizId'|'createdAt'|'updatedAt'>> & { options?: Partial<Omit<Option, 'questionId'|'createdAt'|'updatedAt'>>[], correctOptionId?: string | null };
  onSaveQuestion: (questionData: Partial<Omit<Question, 'quizId'|'createdAt'|'updatedAt'>> & { options?: Partial<Omit<Option, 'questionId'|'createdAt'|'updatedAt'>>[], correctOptionTextForNew?: string }) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}) => {
  const [questionText, setQuestionText] = useState(questionToEdit.text || '');
  const [currentOptions, setCurrentOptions] = useState<(Partial<Omit<Option, 'questionId'|'createdAt'|'updatedAt'>> & { isCorrect?: boolean })[]>(
    questionToEdit.options?.map(opt => ({...opt, isCorrect: opt.id === questionToEdit.correctOptionId })) || []
  );
  const [newOptionText, setNewOptionText] = useState('');
  const [points, setPoints] = useState<number | null>(questionToEdit.points ?? null);
  const [order, setOrder] = useState<number>(questionToEdit.order ?? 0);

  const handleAddOption = () => {
    if (newOptionText.trim() === '') return;
    const newOpt: Partial<Omit<Option, 'questionId'|'createdAt'|'updatedAt'>> & { isCorrect?: boolean } = { id: generateOptionId(), text: newOptionText.trim(), isCorrect: false };
    setCurrentOptions([...currentOptions, newOpt]);
    setNewOptionText('');
  };

  const handleDeleteOption = (optionId?: string) => {
    if (!optionId) return;
    setCurrentOptions(currentOptions.filter(opt => opt.id !== optionId));
  };

  const handleSetCorrectOption = (optionId?: string) => {
    setCurrentOptions(currentOptions.map(opt => ({ ...opt, isCorrect: opt.id === optionId })));
  };
  
  const handleSave = () => {
    if (!questionText.trim()) {
      alert("Question text cannot be empty.");
      return;
    }
    if (currentOptions.length < 1) { 
      alert("A question must have at least one option.");
      return;
    }
    const correctOption = currentOptions.find(opt => opt.isCorrect);
    if (!correctOption) {
      alert("Please select a correct option.");
      return;
    }

    onSaveQuestion({
      id: questionToEdit.id, 
      text: questionText,
      order,
      points,
      options: currentOptions.map(({ isCorrect, ...optData }) => optData), 
      correctOptionTextForNew: correctOption.text, 
    });
  };

  return (
    <Dialog open={true} onOpenChange={(isOpen) => { if (!isOpen) onCancel(); }}>
      <DialogContent className="sm:max-w-lg md:max-w-xl">
        <DialogHeader>
          <DialogTitle>{questionToEdit.id ? 'Edit Question' : 'Add New Question'}</DialogTitle>
          <DialogDescription>Define the question, its options, and mark the correct answer.</DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-3">
          <div className="space-y-4 py-2">
            <div>
              <Label htmlFor="questionText">Question Text</Label>
              <Textarea id="questionText" value={questionText} onChange={e => setQuestionText(e.target.value)} rows={3} disabled={isSubmitting}/>
            </div>
             <div>
              <Label htmlFor="questionOrder">Order</Label>
              <Input id="questionOrder" type="number" value={order} onChange={e => setOrder(Number(e.target.value))} disabled={isSubmitting}/>
            </div>
            <div>
              <Label>Options (Mark one as correct)</Label>
                {currentOptions.map((opt, index) => (
                  <Card key={opt.id || `new-opt-${index}`} className="p-2.5 flex items-center justify-between bg-muted/30 my-1.5">
                    <div className="flex items-center space-x-2 flex-grow mr-2">
                      <Checkbox 
                        id={`opt-correct-${opt.id || index}`} 
                        checked={opt.isCorrect} 
                        onCheckedChange={() => handleSetCorrectOption(opt.id)}
                        disabled={isSubmitting}
                      />
                      <Input 
                        id={`opt-text-${opt.id || index}`} 
                        value={opt.text || ''}
                        onChange={(e) => {
                            const newOpts = [...currentOptions];
                            newOpts[index].text = e.target.value;
                            setCurrentOptions(newOpts);
                        }}
                        className="flex-grow"
                        disabled={isSubmitting}
                      />
                    </div>
                    <Button type="button" variant="ghost" size="icon_sm" onClick={() => handleDeleteOption(opt.id)} disabled={isSubmitting}>
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  </Card>
                ))}
              {currentOptions.length === 0 && <p className="text-xs text-muted-foreground text-center py-2">No options added yet.</p>}
            </div>

            <div className="space-y-1.5 pt-2 border-t">
              <Label htmlFor="newOptionText">Add New Option</Label>
              <div className="flex gap-2">
                <Input id="newOptionText" value={newOptionText} onChange={e => setNewOptionText(e.target.value)} placeholder="Option text" disabled={isSubmitting}/>
                <Button type="button" variant="outline" size="sm" onClick={handleAddOption} disabled={!newOptionText.trim() || isSubmitting}>Add</Button>
              </div>
            </div>
            
            <div>
              <Label htmlFor="questionPoints">Points (optional)</Label>
              <Input id="questionPoints" type="number" value={points ?? ''} onChange={e => setPoints(e.target.value === '' ? null : Number(e.target.value))} disabled={isSubmitting}/>
            </div>
          </div>
        </ScrollArea>
        <DialogFooter className="pt-4 border-t">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>Cancel</Button>
          <Button type="button" onClick={handleSave} disabled={isSubmitting}>Save Question</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};


const QuizQuestionsDialog = ({
  quiz,
  onSaveQuiz,
  onCancel,
  isSavingQuiz,
}: {
  quiz: MockQuizType & { questions?: (MockQuestionType & { options?: MockOptionType[] })[] };
  onSaveQuiz: (updatedQuiz: MockQuizType & { questionsToUpsert?: any[], questionIdsToDelete?: string[] }) => Promise<void>;
  onCancel: () => void;
  isSavingQuiz: boolean;
}) => {
  const [currentQuizState, setCurrentQuizState] = useState<MockQuizType & { questions?: (MockQuestionType & { options?: MockOptionType[] })[] }>(JSON.parse(JSON.stringify(quiz)));
  const [editingQuestion, setEditingQuestion] = useState<Partial<MockQuestionType> & { options?: Partial<MockOptionType>[] } | null>(null);
  const [questionIdsToDelete, setQuestionIdsToDelete] = useState<string[]>([]);

  const handleAddNewQuestion = () => {
    setEditingQuestion({ text: '', order: (currentQuizState.questions?.length || 0), options: [], points: 10 });
  };

  const handleEditQuestion = (questionToEdit: MockQuestionType & { options?: MockOptionType[] }) => {
    setEditingQuestion(JSON.parse(JSON.stringify(questionToEdit)));
  };

  const handleDeleteQuestion = (questionId: string) => {
    setCurrentQuizState(prev => ({
      ...prev,
      questions: prev.questions?.filter(q => q.id !== questionId),
    }));
    if (!questionId.startsWith('q-new-')) {
      setQuestionIdsToDelete(prev => [...new Set([...prev, questionId])]);
    }
  };

  const handleSaveQuestionFromDialog = (questionData: Partial<MockQuestionType> & { options?: Partial<MockOptionType>[], correctOptionTextForNew?: string }) => {
    setCurrentQuizState(prev => {
      const existingIndex = prev.questions?.findIndex(q => q.id === questionData.id);
      let newQuestionsList;
      const newQuestionEntry = {
          ...questionData,
          id: questionData.id || generateQuestionId(), 
          options: questionData.options?.map(opt => ({ id: opt.id || generateOptionId(), text: opt.text! })) || [],
          correctOptionId: questionData.options?.find(opt => opt.text === questionData.correctOptionTextForNew)?.id || '', // This is tricky, correctOptionId might need server-side linking
      } as MockQuestionType & { options?: MockOptionType[] };
      
      if (existingIndex !== undefined && existingIndex > -1 && prev.questions) {
        newQuestionsList = [...prev.questions];
        newQuestionsList[existingIndex] = newQuestionEntry;
      } else {
        newQuestionsList = [...(prev.questions || []), newQuestionEntry];
      }
      return { ...prev, questions: newQuestionsList };
    });
    setEditingQuestion(null);
  };
  
  const handleSaveAndClose = async () => {
    const questionsToUpsert = currentQuizState.questions?.map(q => {
        return {
            ...q, 
            optionsToCreate: q.options?.map(opt => ({ id: opt.id.startsWith('opt-new-') ? undefined : opt.id, text: opt.text })),
            correctOptionTextForNew: q.options?.find(o => o.id === q.correctOptionId)?.text,
            id: q.id.startsWith('q-new-') ? undefined : q.id, 
        };
    });
    await onSaveQuiz({ ...currentQuizState, questionsToUpsert, questionIdsToDelete });
  };

  return (
    <>
      <Dialog open={true} onOpenChange={(isOpen) => { if (!isOpen) onCancel(); }}>
        <DialogContent className="sm:max-w-xl md:max-w-2xl lg:max-w-3xl">
          <DialogHeader>
            <DialogTitle className="font-headline text-xl">Manage Questions for: {currentQuizState.title}</DialogTitle>
            <DialogDescription>Add, edit, or delete questions for this quiz. Changes are saved to the database.</DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[65vh] pr-3">
            <div className="space-y-3 py-2">
              {currentQuizState.questions && currentQuizState.questions.length > 0 ? (
                currentQuizState.questions.map((q, index) => (
                  <Card key={q.id || index} className="p-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-grow pr-2">
                        <p className="font-medium text-sm">{q.order || index + 1}. {q.text}</p>
                        <p className="text-xs text-muted-foreground">
                          Options: {q.options?.length || 0} | Correct: {q.options?.find(opt => opt.id === q.correctOptionId)?.text || 'N/A'}
                        </p>
                      </div>
                      <div className="flex space-x-1 shrink-0">
                        <Button type="button" variant="ghost" size="icon_sm" onClick={() => handleEditQuestion(q)} disabled={isSavingQuiz}>
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button type="button" variant="ghost" size="icon_sm" onClick={() => handleDeleteQuestion(q.id)} disabled={isSavingQuiz}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-4">No questions in this quiz yet.</p>
              )}
               <Button type="button" variant="outline" onClick={handleAddNewQuestion} className="mt-4 w-full" disabled={isSavingQuiz}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add New Question
              </Button>
            </div>
          </ScrollArea>
          <DialogFooter className="pt-4 border-t">
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSavingQuiz}>Cancel Changes</Button>
            <Button type="button" onClick={handleSaveAndClose} disabled={isSavingQuiz}>
              {isSavingQuiz ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Done & Save Quiz
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {editingQuestion && (
        <QuestionEditDialog
          questionToEdit={editingQuestion}
          onSaveQuestion={handleSaveQuestionFromDialog}
          onCancel={() => setEditingQuestion(null)}
          isSubmitting={isSavingQuiz}
        />
      )}
    </>
  );
};


const CourseForm = ({
  course,
  categories,
  onSubmit,
  onCancel,
  isSubmitting,
}: {
  course?: Course & { modules?: (Module & { lessons?: Lesson[] })[], quizzes?: (Quiz & { questions?: (Question & { options?: Option[]})[] })[] };
  categories: PrismaCategory[];
  onSubmit: (data: Omit<Course, 'id' | 'createdAt' | 'updatedAt' | 'categoryId' | 'categoryNameCache'> & { categoryName: string, modules?: Array<Partial<Omit<Module, 'id'|'courseId'|'createdAt'|'updatedAt'>> & { lessons?: Array<Partial<Omit<Lesson, 'id'|'moduleId'|'createdAt'|'updatedAt'>>> }>, quizzes?: Array<Partial<Omit<Quiz, 'id'|'courseId'|'createdAt'|'updatedAt'>> & { questions?: Array<Partial<Omit<Question, 'id'|'quizId'|'createdAt'|'updatedAt'|'options'|'correctOptionId'>> & { options: Array<Partial<Omit<Option, 'id'|'questionId'|'createdAt'|'updatedAt'>>>, correctOptionText?: string }> }> }) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}) => {
  const [title, setTitle] = useState(course?.title || '');
  const [description, setDescription] = useState(course?.description || '');
  const [categoryName, setCategoryName] = useState(course?.categoryNameCache || (categories.length > 0 ? categories[0].name : ''));
  const [instructor, setInstructor] = useState(course?.instructor || '');
  const [imageUrl, setImageUrl] = useState(course?.imageUrl || 'https://placehold.co/600x400.png');
  const [dataAiHint, setDataAiHint] = useState(course?.dataAiHint || 'education learning');
  const [price, setPrice] = useState<number | string>(course?.price ?? '');
  const [currency, setCurrency] = useState(course?.currency || 'USD');
  const [isFeatured, setIsFeatured] = useState(course?.isFeatured || false);
  
  const [modules, setModules] = useState<(Partial<Omit<Module, 'courseId'|'createdAt'|'updatedAt'>> & { lessons?: Partial<Omit<Lesson, 'moduleId'|'createdAt'|'updatedAt'>>[] })[]>(course?.modules?.map(m => ({...m, lessons: m.lessons.map(l => ({...l}))})) || []);
  
  const [quizzes, setQuizzes] = useState<(MockQuizType & { questions?: (MockQuestionType & { options?: MockOptionType[] })[] })[]>(
    course?.quizzes?.map(q => ({
        id: q.id,
        title: q.title,
        quizType: q.quizType as MockQuizEnumType,
        passingScore: q.passingScore ?? undefined,
        questions: q.questions.map(ques => ({
            id: ques.id,
            text: ques.text,
            order: ques.order,
            points: ques.points ?? undefined,
            options: ques.options.map(opt => ({id: opt.id, text: opt.text})),
            correctOptionId: ques.correctOptionId || '',
        }))
    })) || []
  );

  const [editingQuizForQuestions, setEditingQuizForQuestions] = useState<(MockQuizType & { questions?: (MockQuestionType & { options?: MockOptionType[] })[] }) | null>(null);


  const [learningObjectives, setLearningObjectives] = useState(course?.learningObjectives?.join('\n') || '');
  const [targetAudience, setTargetAudience] = useState(course?.targetAudience || undefined);
  const [prerequisites, setPrerequisites] = useState(course?.prerequisites?.join('\n') || '');
  const [estimatedTimeToComplete, setEstimatedTimeToComplete] = useState(course?.estimatedTimeToComplete || undefined);


  const [editingLesson, setEditingLesson] = useState<{ moduleIndex: number, lessonIndex?: number, lesson?: Partial<Omit<Lesson, 'moduleId'|'createdAt'|'updatedAt'>> } | null>(null);

  const [newQuizTitle, setNewQuizTitle] = useState('');
  const [newQuizType, setNewQuizType] = useState<MockQuizEnumType>('practice');

  const handleModuleChange = (index: number, field: keyof Omit<Module, 'id'|'courseId'|'createdAt'|'updatedAt'>, value: string | number) => {
    const newModules = [...modules];
    (newModules[index] as any)[field] = value;
    setModules(newModules);
  };

  const addModule = () => {
    setModules([...modules, { title: '', order: modules.length, lessons: [] }]);
  };

  const removeModule = (moduleIndex: number) => {
    setModules(modules.filter((_, i) => i !== moduleIndex));
  };
  

  const saveLesson = (lessonData: Partial<Omit<Lesson, 'moduleId'|'createdAt'|'updatedAt'>>, moduleIndex: number, lessonIndex?: number) => {
    const newModules = [...modules];
    const currentModule = newModules[moduleIndex];
    if (!currentModule.lessons) currentModule.lessons = [];
    
    if (lessonIndex !== undefined) {
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

  const addQuiz = () => {
    if (!newQuizTitle.trim()) {
      alert("Quiz title cannot be empty."); 
      return;
    }
    const newQuizEntry: MockQuizType & { questions?: (MockQuestionType & { options?: MockOptionType[] })[] } = {
      id: `quiz-new-${Date.now()}`,
      title: newQuizTitle,
      quizType: newQuizType,
      questions: [],
      passingScore: newQuizType === 'graded' ? 70 : undefined,
    };
    setQuizzes(prev => [...prev, newQuizEntry]);
    setNewQuizTitle(''); 
    setNewQuizType('practice');
  };

  const removeQuiz = (quizId: string) => {
    setQuizzes(prev => prev.filter(q => q.id !== quizId));
  };

  const handleSaveQuizWithQuestions = async (quizToSave: MockQuizType & { questionsToUpsert?: any[], questionIdsToDelete?: string[] }) => {
    if (!course?.id) { 
        setQuizzes(prevQuizzes => prevQuizzes.map(q => q.id === quizToSave.id ? quizToSave : q));
        setEditingQuizForQuestions(null);
        // toast({ title: "Quiz Structure Saved (Locally)", description: `Quiz "${quizToSave.title}" structure updated. This will be saved with the course.` });
        return;
    }
    try {
        const savedQuiz = await serverSaveQuizWithQuestions(course.id, quizToSave); // Use server action
        setQuizzes(prevQuizzes => prevQuizzes.map(q => q.id === savedQuiz.id ? 
            {...savedQuiz, quizType: savedQuiz.quizType as MockQuizEnumType, questions: savedQuiz.questions as any[]} : q));
        setEditingQuizForQuestions(null);
        // toast({ title: "Quiz Saved to DB", description: `Quiz "${savedQuiz.title}" and its questions have been updated.` });
    } catch (error) {
        console.error("Error saving quiz with questions to DB:", error);
        // toast({ variant: "destructive", title: "Quiz Save Error", description: "Could not save quiz questions to database." });
    }
};


  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const courseDataSubmit = {
      title,
      description,
      categoryName: categoryName, 
      instructor,
      imageUrl,
      dataAiHint,
      price: Number(price) || null, 
      currency,
      isFeatured,
      learningObjectives: learningObjectives.split('\n').filter(s => s.trim() !== ''),
      targetAudience,
      prerequisites: prerequisites.split('\n').filter(s => s.trim() !== ''),
      estimatedTimeToComplete,
      modules: modules.map(mod => ({ 
        id: mod.id?.startsWith('m-new-') ? undefined : mod.id,
        title: mod.title,
        order: mod.order, 
        lessons: mod.lessons?.map(les => ({
            id: les.id?.startsWith('l-new-') ? undefined : les.id,
            title: les.title,
            duration: les.duration,
            description: les.description,
            embedUrl: les.embedUrl,
            imageUrl: les.imageUrl,
            order: les.order, 
        }))
      })),
      quizzes: quizzes.map(q => ({ 
          id: q.id.startsWith('quiz-new-') ? undefined : q.id,
          title: q.title,
          quizType: q.quizType,
          passingScore: q.passingScore,
          questions: q.questions?.map(ques => ({
              id: ques.id.startsWith('q-new-') ? undefined : ques.id,
              text: ques.text,
              order: ques.order,
              points: ques.points,
              options: ques.options?.map(opt => ({
                id: opt.id.startsWith('opt-new-') ? undefined: opt.id,
                text: opt.text,
              })),
              correctOptionText: ques.options?.find(opt => opt.id === ques.correctOptionId)?.text,
          }))
      }))
    };
    await onSubmit(courseDataSubmit);
  };

  if (editingLesson !== null) {
    return (
         <Dialog open={true} onOpenChange={(isOpen) => !isOpen && setEditingLesson(null)}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>{editingLesson.lesson?.id && !editingLesson.lesson.id.startsWith('l-new-') ? 'Edit Lesson' : 'Add New Lesson'}</DialogTitle>
                    <DialogDescription>
                        {editingLesson.lesson?.id && !editingLesson.lesson.id.startsWith('l-new-') ? 'Modify the details of this lesson.' : 'Fill in the details for the new lesson.'}
                    </DialogDescription>
                </DialogHeader>
                 <LessonForm
                    lesson={editingLesson.lesson}
                    onSave={saveLesson}
                    onCancel={() => setEditingLesson(null)}
                    moduleIndex={editingLesson.moduleIndex}
                    lessonIndex={editingLesson.lessonIndex}
                    isSubmitting={isSubmitting}
                />
            </DialogContent>
        </Dialog>
    )
  }


  return (
    <>
    <form onSubmit={handleSubmit} className="space-y-6">
      <ScrollArea className="h-[65vh] sm:h-[70vh] pr-4">
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Course Title</Label>
            <Input id="title" value={title} onChange={e => setTitle(e.target.value)} required disabled={isSubmitting} />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" value={description} onChange={e => setDescription(e.target.value)} required disabled={isSubmitting} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="categoryName">Category Name</Label>
               <Select value={categoryName} onValueChange={setCategoryName} disabled={isSubmitting}>
                <SelectTrigger id="categoryName">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="instructor">Instructor</Label>
              <Input id="instructor" value={instructor} onChange={e => setInstructor(e.target.value)} required disabled={isSubmitting} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price">Price (0 for free)</Label>
              <div className="relative">
                <DollarSign className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="price" type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="e.g., 49.99" className="pl-8" step="0.01" min="0" disabled={isSubmitting} />
              </div>
            </div>
            <div>
              <Label htmlFor="currency">Currency</Label>
              <div className="relative">
                <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="currency" value={currency} onChange={e => setCurrency(e.target.value)} placeholder="e.g., USD" className="pl-8" disabled={isSubmitting} />
              </div>
            </div>
          </div>
           <div className="flex items-center space-x-2 pt-2">
            <Checkbox id="isFeatured" checked={isFeatured} onCheckedChange={(checked) => setIsFeatured(checked as boolean)} disabled={isSubmitting} />
            <Label htmlFor="isFeatured" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Mark as Featured Course
            </Label>
          </div>
          <div>
            <Label htmlFor="imageUrl">Course Image URL</Label>
            <div className="relative">
                <Input id="imageUrl" value={imageUrl || ''} onChange={e => setImageUrl(e.target.value)} className="pl-8" disabled={isSubmitting}/>
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
                <Input id="dataAiHint" value={dataAiHint || ''} onChange={e => setDataAiHint(e.target.value)} placeholder="e.g. technology learning" className="pl-8" disabled={isSubmitting}/>
                <Info className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          <div className="pt-4 border-t">
            <h3 className="text-lg font-semibold mb-3">Additional Course Information</h3>
            <div className="space-y-4">
                <div>
                    <Label htmlFor="learningObjectives" className="flex items-center"><ListChecks className="mr-2 h-4 w-4 text-muted-foreground"/> Learning Objectives (one per line)</Label>
                    <Textarea id="learningObjectives" value={learningObjectives} onChange={e => setLearningObjectives(e.target.value)} rows={4} placeholder="Students will be able to...\nUnderstand concept X..." disabled={isSubmitting}/>
                </div>
                <div>
                    <Label htmlFor="targetAudience" className="flex items-center"><TargetAudienceIcon className="mr-2 h-4 w-4 text-muted-foreground"/> Target Audience</Label>
                    <Input id="targetAudience" value={targetAudience || ''} onChange={e => setTargetAudience(e.target.value)} placeholder="e.g., Beginners, Advanced Developers" disabled={isSubmitting}/>
                </div>
                <div>
                    <Label htmlFor="prerequisites" className="flex items-center"><ShieldCheck className="mr-2 h-4 w-4 text-muted-foreground"/> Prerequisites (one per line)</Label>
                    <Textarea id="prerequisites" value={prerequisites} onChange={e => setPrerequisites(e.target.value)} rows={3} placeholder="Basic HTML knowledge\nFamiliarity with JavaScript..." disabled={isSubmitting}/>
                </div>
                <div>
                    <Label htmlFor="estimatedTimeToComplete" className="flex items-center"><Timer className="mr-2 h-4 w-4 text-muted-foreground"/> Estimated Time to Complete</Label>
                    <Input id="estimatedTimeToComplete" value={estimatedTimeToComplete || ''} onChange={e => setEstimatedTimeToComplete(e.target.value)} placeholder="e.g., Approx. 20 hours" disabled={isSubmitting}/>
                </div>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t">
            <h3 className="text-lg font-semibold flex items-center"><BookOpen className="mr-2 h-5 w-5 text-primary"/> Modules</h3>
            <Accordion type="multiple" className="w-full" defaultValue={modules.map((m, idx) => m.id || `module-${idx}`)}>
              {modules.map((module, moduleIndex) => (
                <AccordionItem value={module.id || `module-${moduleIndex}`} key={module.id || `module-item-${moduleIndex}`}>
                  <AccordionTrigger className="hover:no-underline">
                    <Input
                      value={module.title || ''}
                      onChange={e => handleModuleChange(moduleIndex, 'title', e.target.value)}
                      placeholder={`Module ${moduleIndex + 1} Title`}
                      className="text-md font-medium flex-grow mr-2"
                      onClick={(e) => e.stopPropagation()}
                      disabled={isSubmitting}
                    />
                  </AccordionTrigger>
                  <AccordionContent className="pl-2">
                    <div className="space-y-3">
                      {module.lessons?.map((lesson, lessonIndex) => (
                        <Card key={lesson.id || `lesson-${lessonIndex}`} className="p-3 bg-muted/30">
                           <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-medium text-sm">{lesson.title}</p>
                                    <p className="text-xs text-muted-foreground">{lesson.duration} {lesson.embedUrl && <LinkIcon className="inline h-3 w-3 ml-1"/>}</p>
                                </div>
                                <div className="flex space-x-1 shrink-0">
                                    <Button type="button" variant="ghost" size="icon_sm" onClick={() => setEditingLesson({ moduleIndex, lessonIndex, lesson })} disabled={isSubmitting}>
                                        <Edit3 className="h-4 w-4" />
                                    </Button>
                                    <Button type="button" variant="ghost" size="icon_sm" onClick={() => removeLesson(moduleIndex, lessonIndex)} disabled={isSubmitting}>
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </div>
                           </div>
                        </Card>
                      ))}
                      <Button type="button" variant="outline" size="sm" onClick={() => setEditingLesson({ moduleIndex, lesson: { title: '', duration: '', order: (module.lessons?.length || 0) } })} disabled={isSubmitting}>
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
                      disabled={isSubmitting}
                    >
                      <Trash2 className="mr-2 h-3 w-3" /> Remove Module {moduleIndex + 1}
                    </Button>
                </AccordionItem>
              ))}
            </Accordion>
            <Button type="button" onClick={addModule} variant="outline" className="w-full" disabled={isSubmitting}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Module
            </Button>
          </div>

          <div className="space-y-4 pt-4 border-t">
            <h3 className="text-lg font-semibold flex items-center"><FileQuestion className="mr-2 h-5 w-5 text-primary"/> Quizzes</h3>
            <div className="space-y-2 p-3 border rounded-md bg-card">
              <Label htmlFor="newQuizTitle">New Quiz Title</Label>
              <Input
                id="newQuizTitle"
                value={newQuizTitle}
                onChange={(e) => setNewQuizTitle(e.target.value)}
                placeholder="e.g., Mid-term Assessment"
                disabled={isSubmitting}
              />
              <Label htmlFor="newQuizType">Quiz Type</Label>
              <Select value={newQuizType} onValueChange={(value: MockQuizEnumType) => setNewQuizType(value)} disabled={isSubmitting}>
                <SelectTrigger id="newQuizType">
                  <SelectValue placeholder="Select quiz type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="practice">Practice Quiz</SelectItem>
                  <SelectItem value="graded">Graded Quiz</SelectItem>
                </SelectContent>
              </Select>
              <Button type="button" onClick={addQuiz} size="sm" className="mt-2" disabled={isSubmitting}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Quiz
              </Button>
            </div>

            {quizzes.length > 0 && (
              <div className="mt-4 space-y-3">
                <h4 className="font-medium text-md">Existing Quizzes:</h4>
                {quizzes.map((quizItem, quizIndex) => (
                  <Card key={quizItem.id} className="p-3 bg-muted/30">
                    <div className="flex justify-between items-start">
                      <div className="flex-grow">
                        <p className="font-medium text-sm">{quizItem.title}</p>
                        <p className="text-xs text-muted-foreground capitalize">{quizItem.quizType?.toLowerCase()} Quiz ({quizItem.questions?.length || 0} questions)</p>
                      </div>
                      <div className="flex space-x-1 shrink-0">
                         <Button type="button" variant="ghost" size="icon_sm" title="Manage Questions" onClick={() => setEditingQuizForQuestions(quizItem)} disabled={isSubmitting}>
                            <Settings2 className="h-4 w-4" />
                          </Button>
                        <Button type="button" variant="ghost" size="icon_sm" title="Delete Quiz" onClick={() => removeQuiz(quizItem.id)} disabled={isSubmitting}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

        </div>
      </ScrollArea>
      <DialogFooter className="pt-6 border-t">
        <DialogClose asChild>
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>Cancel</Button>
        </DialogClose>
        <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90" disabled={isSubmitting}>
           {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {course?.id ? 'Save Changes' : 'Add Course'}
        </Button>
      </DialogFooter>
    </form>
    {editingQuizForQuestions && (
        <QuizQuestionsDialog
          quiz={editingQuizForQuestions}
          onSaveQuiz={handleSaveQuizWithQuestions}
          onCancel={() => setEditingQuizForQuestions(null)}
          isSavingQuiz={isSubmitting} 
        />
    )}
    </>
  );
};

export default function CourseManagement() {
  const [courses, setCourses] = useState<Course[]>([]); 
  const [categories, setCategories] = useState<PrismaCategory[]>([]);
  const [editingCourse, setEditingCourse] = useState<(Course & { modules?: (Module & { lessons?: Lesson[] })[], quizzes?: (Quiz & { questions?: (Question & { options?: Option[]})[] })[] }) | undefined>(undefined);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoadingData(true);
      try {
        const [dbCourses, dbCategories] = await Promise.all([
            serverGetCourses(), // Use server action
            serverGetCategories() // Use server action
        ]);
        setCourses(dbCourses);
        setCategories(dbCategories);
      } catch (error) {
        console.error("Error loading courses or categories:", error);
        toast({ variant: "destructive", title: "Load Error", description: "Could not load courses or categories." });
      }
      setIsLoadingData(false);
    };
    loadInitialData();
  }, [toast]);

  const handleAddCourse = async (data: Omit<Course, 'id' | 'createdAt' | 'updatedAt'| 'categoryId' | 'categoryNameCache'> & { categoryName: string, modules?: any[], quizzes?: any[] }) => {
    setIsSubmittingForm(true);
    try {
      const newCourse = await serverAddCourse(data); // Use server action
      setCourses(prev => [newCourse, ...prev].sort((a, b) => a.title.localeCompare(b.title)));
      closeForm();
      toast({ title: "Course Added", description: `"${data.title}" has been successfully added.` });
    } catch (error) {
      console.error("Error adding course:", error);
      toast({ variant: "destructive", title: "Error Adding Course", description: (error as Error).message || "Could not add course." });
    } finally {
      setIsSubmittingForm(false);
    }
  };

  const handleEditCourse = async (data: Partial<Omit<Course, 'id' | 'createdAt' | 'updatedAt' | 'categoryId'| 'categoryNameCache'>> & { categoryName?: string, modules?: any[], quizzes?: any[] }) => {
    if (!editingCourse || !editingCourse.id) return;
    setIsSubmittingForm(true);
    try {
      const updatedCourse = await serverUpdateCourse(editingCourse.id, data); // Use server action
      setCourses(prev => prev.map(c => c.id === editingCourse.id ? updatedCourse : c).sort((a,b) => a.title.localeCompare(b.title)));
      closeForm();
      toast({ title: "Course Updated", description: `"${data.title}" has been successfully updated.` });
    } catch (error) {
      console.error("Error updating course:", error);
      toast({ variant: "destructive", title: "Error Updating Course", description: (error as Error).message || "Could not update course." });
    } finally {
      setIsSubmittingForm(false);
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    const courseToDelete = courses.find(c => c.id === courseId);
    try {
      await serverDeleteCourse(courseId); // Use server action
      setCourses(prev => prev.filter(c => c.id !== courseId));
      toast({ title: "Course Deleted", description: `"${courseToDelete?.title ?? 'Course'}" has been deleted.`, variant: "destructive" });
    } catch (error) {
      toast({ variant: "destructive", title: "Error Deleting Course", description: "Could not delete course." });
    }
  };

  const openForm = async (courseId?: string) => {
    if (courseId) {
        const courseToEdit = await serverGetCourseById(courseId); // Use server action
        if (courseToEdit) {
            setEditingCourse(courseToEdit);
        } else {
            toast({variant: "destructive", title: "Error", description: "Could not fetch course details for editing."});
            return;
        }
    } else {
        setEditingCourse(undefined);
    }
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
        <CardDescription>Add, edit, or delete courses. Data is stored in your Neon/Postgres database via Prisma.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6 text-right">
          <Dialog open={isFormOpen} onOpenChange={(isOpen) => { if(!isOpen) closeForm(); else setIsFormOpen(true);}}>
            <DialogTrigger asChild>
              <Button onClick={() => openForm()} className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-md hover:shadow-sm active:translate-y-px transition-all duration-150 w-full sm:w-auto" disabled={isLoadingData}>
                <PlusCircle className="mr-2 h-5 w-5" /> Add New Course
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl md:max-w-3xl lg:max-w-4xl">
              <DialogHeader className="pb-4">
                <DialogTitle className="font-headline text-xl md:text-2xl">{editingCourse ? 'Edit Course' : 'Add New Course'}</DialogTitle>
                <DialogDescription>
                  {editingCourse ? 'Modify the details of the existing course.' : 'Fill in the details for the new course.'}
                </DialogDescription>
              </DialogHeader>
              {(isFormOpen && !isLoadingData) && 
                <CourseForm
                    course={editingCourse}
                    categories={categories}
                    onSubmit={editingCourse ? handleEditCourse : handleAddCourse}
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
            <p className="ml-2 text-muted-foreground">Loading courses...</p>
          </div>
        ) : courses.length > 0 ? (
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
                    <span>Category: {course.categoryNameCache}</span> | <span>Instructor: {course.instructor}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Modules: {course.modules?.length || 0} | Quizzes: {course.quizzes?.length || 0} | Price: {course.price && course.price > 0 ? `${course.price} ${course.currency}` : 'Free'}
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:space-x-2 gap-2 sm:gap-0 w-full sm:w-auto sm:items-center mt-2 sm:mt-0 shrink-0 self-start sm:self-center">
                  <Button variant="outline" size="sm" onClick={() => openForm(course.id)} className="w-full sm:w-auto hover:border-primary hover:text-primary">
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
          <p className="text-center text-muted-foreground py-4">No courses found in your database. Add some or use the seeder!</p>
        )}
      </CardContent>
    </Card>
  );
}
