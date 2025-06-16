
"use client";
import { useState, useEffect, type FormEvent } from 'react';
import type { Quiz, Question as FormQuestionType, Option as FormOptionType, Course as PrismaCourse } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Edit3, Trash2, FileQuestion, Settings2, Loader2, ListChecks, Badge } from 'lucide-react'; // Added Badge
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose,
} from "@/components/ui/dialog";
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { serverGetQuizzes, serverAddQuiz, serverUpdateQuiz, serverDeleteQuiz, serverGetCourses } from '@/actions/adminDataActions';
import type { QuizType as MockQuizEnumType } from '@/data/mockData'; 
import type { QuizType as PrismaQuizTypeEnum } from '@prisma/client'; 

const generateQuestionId = () => `q-new-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
const generateOptionId = () => `opt-new-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

type FormOption = Partial<Omit<FormOptionType, 'questionId'|'createdAt'|'updatedAt'>>;
type FormQuestion = Partial<Omit<FormQuestionType, 'quizId'|'createdAt'|'updatedAt'|'options'|'correctOptionId'>> & { options?: FormOption[], correctOptionText?: string, correctOptionId?: string | null, order?: number };
// Ensures quizType on FormQuiz matches the lowercase expected by the Select component,
// while the payload to server actions will convert it back to uppercase Prisma enum.
type FormQuiz = Partial<Omit<Quiz, 'createdAt'|'updatedAt'|'questions'|'courseQuizzes'|'quizType'>> & { quizType: MockQuizEnumType, questions?: FormQuestion[], courseIdsToConnect?: string[] };


const QuestionEditDialog = ({
  questionToEdit,
  onSaveQuestion,
  onCancel,
  isSubmitting,
}: {
  questionToEdit: FormQuestion;
  onSaveQuestion: (questionData: FormQuestion) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}) => {
  const [questionText, setQuestionText] = useState(questionToEdit.text || '');
  const [currentOptions, setCurrentOptions] = useState<(FormOption & { isCorrect?: boolean })[]>(
    questionToEdit.options?.map(opt => ({...opt, isCorrect: opt.id === questionToEdit.correctOptionId })) || []
  );
  const [newOptionText, setNewOptionText] = useState('');
  const [points, setPoints] = useState<number | null>(questionToEdit.points ?? null);
  const [order, setOrder] = useState<number>(questionToEdit.order ?? 0);

  const handleAddOption = () => {
    if (newOptionText.trim() === '') return;
    const newOpt: FormOption & { isCorrect?: boolean } = { id: generateOptionId(), text: newOptionText.trim(), isCorrect: false };
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
    if (!questionText.trim()) { alert("Question text cannot be empty."); return; }
    if (currentOptions.length < 1) { alert("A question must have at least one option."); return; }
    const correctOption = currentOptions.find(opt => opt.isCorrect);
    if (!correctOption) { alert("Please select a correct option."); return; }

    onSaveQuestion({
      id: questionToEdit.id, text: questionText, order, points,
      options: currentOptions.map(({ isCorrect, ...optData }) => optData),
      correctOptionText: correctOption.text, correctOptionId: correctOption.id,
    });
  };
  return (
    <Dialog open={true} onOpenChange={(isOpen) => { if (!isOpen) onCancel(); }}>
      <DialogContent className="sm:max-w-lg md:max-w-xl">
        <DialogHeader>
          <DialogTitle>{questionToEdit.id && !questionToEdit.id.startsWith('q-new-') ? 'Edit Question' : 'Add New Question'}</DialogTitle>
          <DialogDescription>Modify the question details and its options.</DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-3"><div className="space-y-4 py-2">
          <div><Label htmlFor="questionText">Question Text</Label><Input id="questionText" value={questionText} onChange={e => setQuestionText(e.target.value)} disabled={isSubmitting}/></div>
          <div><Label htmlFor="questionOrder">Order</Label><Input id="questionOrder" type="number" value={order} onChange={e => setOrder(Number(e.target.value))} disabled={isSubmitting}/></div>
          <div><Label>Options</Label>
            {currentOptions.map((opt, index) => (
              <Card key={opt.id || `new-opt-${index}`} className="p-2.5 flex items-center justify-between bg-muted/30 my-1.5">
                <div className="flex items-center space-x-2 flex-grow mr-2">
                  <Checkbox id={`opt-correct-${opt.id || index}`} checked={opt.isCorrect} onCheckedChange={() => handleSetCorrectOption(opt.id)} disabled={isSubmitting}/>
                  <Input id={`opt-text-${opt.id || index}`} value={opt.text || ''} onChange={(e) => {const newOpts = [...currentOptions];newOpts[index].text = e.target.value;setCurrentOptions(newOpts);}} className="flex-grow" disabled={isSubmitting}/>
                </div><Button type="button" variant="ghost" size="icon_sm" onClick={() => handleDeleteOption(opt.id)} disabled={isSubmitting}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button></Card>))}
            {currentOptions.length === 0 && <p className="text-xs text-muted-foreground text-center py-2">No options added yet.</p>}
          </div>
          <div className="space-y-1.5 pt-2 border-t"><Label htmlFor="newOptionText">Add New Option</Label><div className="flex gap-2"><Input id="newOptionText" value={newOptionText} onChange={e => setNewOptionText(e.target.value)} placeholder="Option text" disabled={isSubmitting}/><Button type="button" variant="outline" size="sm" onClick={handleAddOption} disabled={!newOptionText.trim() || isSubmitting}>Add</Button></div></div>
          <div><Label htmlFor="questionPoints">Points</Label><Input id="questionPoints" type="number" value={points ?? ''} onChange={e => setPoints(e.target.value === '' ? null : Number(e.target.value))} disabled={isSubmitting}/></div>
        </div></ScrollArea>
        <DialogFooter className="pt-4 border-t"><Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>Cancel</Button><Button type="button" onClick={handleSave} disabled={isSubmitting}>Save Question</Button></DialogFooter>
      </DialogContent></Dialog>
  );
};

const QuizForm = ({
  quiz,
  allCourses,
  onSubmit,
  onCancel,
  isSubmitting,
}: {
  quiz?: FormQuiz;
  allCourses: PrismaCourse[];
  onSubmit: (data: FormQuiz, questionIdsToDelete: string[]) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}) => {
  const [currentQuizState, setCurrentQuizState] = useState<FormQuiz>(() => JSON.parse(JSON.stringify(quiz || { title: '', quizType: 'practice', questions: [], courseIdsToConnect: [] })));
  const [editingQuestion, setEditingQuestion] = useState<FormQuestion | null>(null);
  const [questionIdsToDelete, setQuestionIdsToDelete] = useState<string[]>([]);

  useEffect(() => {
    // Ensure quizType is lowercase for the Select component
    const initialQuizState = JSON.parse(JSON.stringify(quiz || { title: '', quizType: 'practice', questions: [], courseIdsToConnect: [] }));
    if (initialQuizState.quizType) {
      initialQuizState.quizType = initialQuizState.quizType.toLowerCase();
    }
    setCurrentQuizState(initialQuizState);
    setQuestionIdsToDelete([]);
  }, [quiz]);

  const handleInputChange = (field: keyof FormQuiz, value: any) => {
    setCurrentQuizState(prev => ({ ...prev, [field]: value }));
  };
  
  const handleCourseSelection = (courseId: string, checked: boolean) => {
    setCurrentQuizState(prev => ({
        ...prev,
        courseIdsToConnect: checked
            ? [...(prev.courseIdsToConnect || []), courseId]
            : (prev.courseIdsToConnect || []).filter(id => id !== courseId)
    }));
  };

  const handleAddNewQuestion = () => setEditingQuestion({ text: '', order: (currentQuizState.questions?.length || 0), options: [], points: 10 });
  const handleEditQuestion = (q: FormQuestion) => setEditingQuestion(JSON.parse(JSON.stringify(q)));
  const handleDeleteQuestion = (questionId?: string) => {
    if (!questionId) return;
    setCurrentQuizState(prev => ({...prev, questions: (prev.questions || []).filter(q => q.id !== questionId)}));
    if (questionId && !questionId.startsWith('q-new-')) setQuestionIdsToDelete(ids => [...new Set([...ids, questionId])]);
  };
  const handleSaveQuestionFromDialog = (qData: FormQuestion) => {
    setCurrentQuizState(prev => {
      const newId = qData.id || generateQuestionId();
      const newOptions = (qData.options || []).map(opt => ({id: opt.id || generateOptionId(), text: opt.text!}));
      const correctFormOption = (qData.options || []).find(opt => opt.id === qData.correctOptionId);
      const correctDbOptionInNewList = newOptions.find(opt => opt.text === correctFormOption?.text);
      const newQEntry: FormQuestion = {...qData, id: newId, order: qData.order ?? (prev.questions?.length || 0), options: newOptions, correctOptionId: correctDbOptionInNewList?.id || null};
      const existingQs = prev.questions || [];
      const existingIdx = existingQs.findIndex(q => q.id === newId);
      let updatedQs = existingIdx > -1 ? existingQs.map((q, i) => i === existingIdx ? newQEntry : q) : [...existingQs, newQEntry];
      updatedQs.sort((a,b) => (a.order ?? 0) - (b.order ?? 0));
      return {...prev, questions: updatedQs};
    });
    setEditingQuestion(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    // Convert quizType to uppercase for Prisma before submitting
    const submitData = {
        ...currentQuizState,
        quizType: currentQuizState.quizType.toUpperCase() as PrismaQuizTypeEnum,
    };
    await onSubmit(submitData, questionIdsToDelete);
  };

  return (
    <>
    <form onSubmit={handleSubmit} className="space-y-6">
      <ScrollArea className="h-[65vh] pr-3">
        <div className="space-y-4">
          <div><Label htmlFor="quiz-title">Quiz Title</Label><Input id="quiz-title" value={currentQuizState.title || ''} onChange={e => handleInputChange('title', e.target.value)} required disabled={isSubmitting}/></div>
          <div><Label htmlFor="quiz-type">Quiz Type</Label>
            <Select value={currentQuizState.quizType} onValueChange={(val: MockQuizEnumType) => handleInputChange('quizType', val)} disabled={isSubmitting}>
              <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
              <SelectContent><SelectItem value="practice">Practice</SelectItem><SelectItem value="graded">Graded</SelectItem></SelectContent>
            </Select>
          </div>
          {currentQuizState.quizType === 'graded' && <div><Label htmlFor="quiz-passingScore">Passing Score (%)</Label><Input id="quiz-passingScore" type="number" min="0" max="100" value={currentQuizState.passingScore ?? ''} onChange={e => handleInputChange('passingScore', Number(e.target.value))} disabled={isSubmitting}/></div>}
          
          <div className="pt-3 border-t">
            <h4 className="text-md font-semibold mb-2">Questions</h4>
            {currentQuizState.questions && currentQuizState.questions.length > 0 ? (
              currentQuizState.questions.map((q, idx) => (
                <Card key={q.id || `new-q-${idx}`} className="p-3 mb-2 bg-muted/20">
                  <div className="flex justify-between items-start">
                    <div className="flex-grow pr-2"><p className="font-medium text-sm">{q.order || idx + 1}. {q.text}</p><p className="text-xs text-muted-foreground">Options: {q.options?.length || 0}</p></div>
                    <div className="flex space-x-1 shrink-0"><Button type="button" variant="ghost" size="icon_sm" onClick={() => handleEditQuestion(q)} disabled={isSubmitting}><Edit3 className="h-4 w-4" /></Button><Button type="button" variant="ghost" size="icon_sm" onClick={() => handleDeleteQuestion(q.id)} disabled={isSubmitting}><Trash2 className="h-4 w-4 text-destructive" /></Button></div>
                  </div></Card>))
            ) : <p className="text-sm text-muted-foreground text-center py-2">No questions added yet.</p>}
            <Button type="button" variant="outline" size="sm" onClick={handleAddNewQuestion} className="mt-2 w-full" disabled={isSubmitting}><PlusCircle className="mr-2 h-4 w-4"/>Add Question</Button>
          </div>

          <div className="pt-3 border-t">
            <Label className="flex items-center text-md font-semibold mb-2"><ListChecks className="mr-2 h-4 w-4"/>Link to Courses (Optional)</Label>
            <Card className="max-h-48 overflow-y-auto p-3 bg-muted/30">
                {allCourses.length > 0 ? allCourses.map(course => (
                <div key={course.id} className="flex items-center space-x-2 py-1.5">
                    <Checkbox id={`link-course-${course.id}`} checked={(currentQuizState.courseIdsToConnect || []).includes(course.id)} onCheckedChange={(checked) => handleCourseSelection(course.id, checked as boolean)} disabled={isSubmitting}/>
                    <Label htmlFor={`link-course-${course.id}`} className="text-sm font-normal">{course.title}</Label>
                </div>
                )) : <p className="text-xs text-muted-foreground text-center py-2">No courses available to link.</p>}
            </Card>
          </div>
        </div>
      </ScrollArea>
      <DialogFooter className="pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>Cancel</Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {quiz?.id ? 'Save Quiz Changes' : 'Add Quiz'}
        </Button>
      </DialogFooter>
    </form>
    {editingQuestion && <QuestionEditDialog questionToEdit={editingQuestion} onSaveQuestion={handleSaveQuestionFromDialog} onCancel={() => setEditingQuestion(null)} isSubmitting={isSubmitting} />}
    </>
  );
};

export default function QuizManagement() {
  const [quizzes, setQuizzes] = useState<FormQuiz[]>([]); // Use FormQuiz type here
  const [allCourses, setAllCourses] = useState<PrismaCourse[]>([]);
  const [editingQuiz, setEditingQuiz] = useState<FormQuiz | undefined>(undefined);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoadingData(true);
      try {
        const [dbQuizzes, dbCourses] = await Promise.all([serverGetQuizzes(), serverGetCourses()]);
        setQuizzes(dbQuizzes.map(q => ({
            ...q,
            quizType: q.quizType.toLowerCase() as MockQuizEnumType, 
            // @ts-ignore
            courseIdsToConnect: (q.courseQuizzes || []).map(cq => cq.course?.id).filter(Boolean)
        })));
        setAllCourses(dbCourses);
      } catch (error) {
        toast({ variant: "destructive", title: "Load Error", description: "Could not load quizzes or courses." });
      }
      setIsLoadingData(false);
    };
    loadInitialData();
  }, [toast]);

  const handleAddOrUpdateQuiz = async (quizData: FormQuiz, questionIdsToDelete: string[]) => {
    setIsSubmittingForm(true);
    const payload = {
        ...quizData,
        quizType: quizData.quizType.toUpperCase() as PrismaQuizTypeEnum, // Convert back for Prisma
        questions: quizData.questions?.map(q => ({
          ...q,
          options: q.options || [], 
        })),
        questionIdsToDelete: questionIdsToDelete.filter(id => !id.startsWith('q-new-')), 
    };
    try {
      if (quizData.id && !quizData.id.startsWith('quiz-new-')) { 
        // @ts-ignore
        const updatedQuiz = await serverUpdateQuiz(quizData.id, payload);
        setQuizzes(prev => prev.map(q => (q.id === updatedQuiz.id ? {...updatedQuiz, quizType: updatedQuiz.quizType.toLowerCase() as MockQuizEnumType, courseIdsToConnect: (updatedQuiz as any).courseQuizzes?.map((cq:any) => cq.course?.id).filter(Boolean) } : q)));
        toast({ title: "Quiz Updated", description: `"${updatedQuiz.title}" updated.` });
      } else { 
        // @ts-ignore
        const newQuiz = await serverAddQuiz(payload);
        setQuizzes(prev => [ {...newQuiz, quizType: newQuiz.quizType.toLowerCase() as MockQuizEnumType, courseIdsToConnect: (newQuiz as any).courseQuizzes?.map((cq:any) => cq.course?.id).filter(Boolean) } , ...prev].sort((a, b) => a.title!.localeCompare(b.title!)));
        toast({ title: "Quiz Added", description: `"${newQuiz.title}" added.` });
      }
      closeForm();
    } catch (error) {
      toast({ variant: "destructive", title: "Save Failed", description: (error as Error).message });
    } finally {
      setIsSubmittingForm(false);
    }
  };

  const handleDeleteQuiz = async (quizId: string) => {
    const quizToDelete = quizzes.find(q => q.id === quizId);
    try {
      await serverDeleteQuiz(quizId);
      setQuizzes(prev => prev.filter(q => q.id !== quizId));
      toast({ title: "Quiz Deleted", description: `"${quizToDelete?.title}" deleted.`, variant: "destructive" });
    } catch (error) {
      toast({ variant: "destructive", title: "Delete Failed", description: (error as Error).message });
    }
  };

  const openForm = (quiz?: FormQuiz) => { // Use FormQuiz type
    setEditingQuiz(quiz ? JSON.parse(JSON.stringify({
        ...quiz,
        quizType: quiz.quizType.toLowerCase(), // Ensure lowercase for form
        courseIdsToConnect: (quiz.courseIdsToConnect || [])
    })) : undefined);
    setIsFormOpen(true);
  };
  const closeForm = () => { setIsFormOpen(false); setEditingQuiz(undefined); };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center text-xl md:text-2xl font-headline"><FileQuestion className="mr-2 md:mr-3 h-6 w-6 md:h-7 md:w-7 text-primary"/>Quiz Management</CardTitle>
        <DialogDescription>Create, edit, and manage standalone quizzes. Link them to courses.</DialogDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6 text-right">
          <Dialog open={isFormOpen} onOpenChange={(isOpen) => { if(!isOpen) closeForm(); else setIsFormOpen(true);}}>
            <DialogTrigger asChild><Button onClick={() => openForm()} className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-md"><PlusCircle className="mr-2 h-5 w-5"/>Add New Quiz</Button></DialogTrigger>
            <DialogContent className="sm:max-w-2xl md:max-w-3xl">
              <DialogHeader className="pb-4">
                <DialogTitle className="font-headline text-xl">{editingQuiz ? 'Edit Quiz' : 'Add New Quiz'}</DialogTitle>
                <DialogDescription>
                  {editingQuiz ? 'Modify the quiz details, questions, and course links.' : 'Define a new quiz, add questions, and link to courses.'}
                </DialogDescription>
              </DialogHeader>
              {isFormOpen && <QuizForm quiz={editingQuiz} allCourses={allCourses} onSubmit={handleAddOrUpdateQuiz} onCancel={closeForm} isSubmitting={isSubmittingForm} />}
            </DialogContent>
          </Dialog>
        </div>
        {isLoadingData ? (
          <div className="flex justify-center items-center py-10"><Loader2 className="h-8 w-8 animate-spin text-primary"/><p className="ml-2 text-muted-foreground">Loading quizzes...</p></div>
        ) : quizzes.length > 0 ? (
          <ul className="space-y-3">
            {quizzes.map(q => (
              <li key={q.id} className="p-3 border rounded-lg bg-card flex flex-col sm:flex-row sm:items-center sm:justify-between shadow-sm hover:shadow-md transition-shadow">
                <div className="flex-grow mb-2 sm:mb-0">
                  <h3 className="font-semibold text-md">{q.title} <Badge variant="outline" className="ml-2 capitalize text-xs">{q.quizType.toLowerCase()}</Badge></h3>
                  <p className="text-xs text-muted-foreground">Questions: {(q.questions || []).length} | Linked Courses: {(q.courseIdsToConnect || []).length}</p>
                </div>
                <div className="flex flex-col sm:flex-row sm:space-x-2 gap-2 sm:gap-0 w-full sm:w-auto">
                  <Button variant="outline" size="sm" onClick={() => openForm(q)} className="w-full sm:w-auto"><Edit3 className="mr-1 h-4 w-4"/>Edit</Button>
                  <Dialog><DialogTrigger asChild><Button variant="destructive" size="sm" className="w-full sm:w-auto"><Trash2 className="mr-1 h-4 w-4"/>Delete</Button></DialogTrigger>
                    <DialogContent className="sm:max-w-xs">
                      <DialogHeader>
                        <DialogTitle>Confirm Deletion</DialogTitle>
                        <DialogDescription>Delete quiz "{q.title}"?</DialogDescription>
                      </DialogHeader>
                      <DialogFooter className="pt-2"><DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose><DialogClose asChild><Button variant="destructive" onClick={() => handleDeleteQuiz(q.id!)}>Delete</Button></DialogClose></DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div></li>))}</ul>
        ) : <p className="text-center text-muted-foreground py-4">No quizzes found.</p>}
      </CardContent>
    </Card>
  );
}
