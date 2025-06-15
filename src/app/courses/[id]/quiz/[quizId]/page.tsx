
"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { type Course, type Quiz, type Question as QuizQuestionType, type Option as QuizOptionType } from '@/lib/dbUtils';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronLeft, ChevronRight, CheckCircle, XCircle, AlertTriangle, Home, HelpCircle, Award, Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { serverGetQuizById, serverGetCourseById } from '@/actions/adminDataActions'; // Updated serverGetQuizById
import { useToast } from '@/hooks/use-toast';

const quizPageTranslations = {
  en: {
    quizTitle: "Quiz: {title}",
    courseContext: "For Course: {courseTitle}",
    question: "Question {current} of {total}",
    submitQuiz: "Submit Quiz",
    nextQuestion: "Next Question",
    previousQuestion: "Previous Question",
    yourAnswer: "Your Answer:",
    correctAnswer: "Correct Answer:",
    incorrect: "Incorrect",
    correct: "Correct",
    resultsTitle: "Quiz Results",
    score: "Your Score: {score}/{totalQuestions} ({percentage}%)",
    passed: "Congratulations, you passed!",
    failed: "You did not pass this time. Keep practicing!",
    reviewAnswers: "Review Your Answers",
    backToCourse: "Back to Course",
    loadingQuiz: "Loading Quiz...",
    quizNotFound: "Quiz Not Found",
    quizNotFoundDesc: "The quiz (ID: {quizId}) or course (ID: {courseId}) could not be found.",
    selectOption: "Please select an option.",
    startOver: "Start Over",
    quizEmptyTitle: "Quiz Empty",
    quizEmptyDesc: "The quiz \"{quizTitle}\" currently has no questions."
  },
  my: {
    quizTitle: "စာမေးပွဲငယ်: {title}",
    courseContext: "သင်တန်းအတွက်: {courseTitle}",
    question: "မေးခွန်း {current} / {total}",
    submitQuiz: "စာမေးပွဲငယ် တင်သွင်းရန်",
    nextQuestion: "နောက်မေးခွန်း",
    previousQuestion: "ယခင်မေးခွန်း",
    yourAnswer: "သင်၏အဖြေ:",
    correctAnswer: "အဖြေမှန်:",
    incorrect: "မှားပါသည်",
    correct: "မှန်ပါသည်",
    resultsTitle: "စာမေးပွဲငယ် အဖြေလွှာ",
    score: "သင်၏ရမှတ်: {score}/{totalQuestions} ({percentage}%)",
    passed: "ဂုဏ်ယူပါသည်။ သင်အောင်မြင်ပါသည်။",
    failed: "ဤတစ်ကြိမ် သင်မအောင်မြင်ပါ။ ဆက်လက်လေ့ကျင့်ပါ။",
    reviewAnswers: "သင်၏အဖြေများကို ပြန်လည်စစ်ဆေးပါ",
    backToCourse: "သင်တန်းသို့ ပြန်သွားရန်",
    loadingQuiz: "စာမေးပွဲငယ် တင်နေသည်...",
    quizNotFound: "စာမေးပွဲငယ် မတွေ့ပါ",
    quizNotFoundDesc: "သင်ရှာဖွေနေသော စာမေးပွဲငယ် (ID: {quizId}) သို့မဟုတ် သင်တန်း (ID: {courseId}) ကို ရှာမတွေ့ပါ။",
    selectOption: "ကျေးဇူးပြု၍ အဖြေတစ်ခု ရွေးချယ်ပါ။",
    startOver: "အစမှပြန်စပါ",
    quizEmptyTitle: "စာမေးပွဲငယ် ဗလာဖြစ်နေသည်",
    quizEmptyDesc: "\"{quizTitle}\" အမည်ရှိ စာမေးပွဲငယ်တွင် လက်ရှိမေးခွန်းများ မရှိသေးပါ။"
  }
};

export default function QuizPage() {
  const params = useParams();
  const router = useRouter();
  const { language } = useLanguage();
  const t = quizPageTranslations[language];
  const { toast } = useToast();

  const courseId = params.id as string;
  const quizId = params.quizId as string;

  const [isLoading, setIsLoading] = useState(true);
  const [currentCourse, setCurrentCourse] = useState<Course | null>(null); // To display course context
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<{ [questionId: string]: string }>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const fetchQuizAndCourseData = async () => {
      setIsLoading(true);
      if (!courseId || !quizId) {
        toast({ variant: "destructive", title: t.quizNotFound, description: "Course ID or Quiz ID is missing." });
        setIsLoading(false); return;
      }
      try {
        const [quizData, courseData] = await Promise.all([
          serverGetQuizById(quizId),
          serverGetCourseById(courseId) // Fetch course for context
        ]);
        
        if (quizData) setCurrentQuiz(quizData);
        else toast({ variant: "destructive", title: t.quizNotFound, description: `Quiz with ID ${quizId} not found.` });
        
        if (courseData) setCurrentCourse(courseData);
        // Not toasting error for course not found here, as quiz is primary
        
        if (!quizData) setCurrentQuiz(null); // Ensure quiz is null if not found
        if (!courseData) setCurrentCourse(null);


      } catch (error) {
        console.error("Error fetching quiz/course data:", error);
        toast({ variant: "destructive", title: "Error", description: "Could not load quiz or course data." });
        setCurrentQuiz(null); setCurrentCourse(null);
      }
      setIsLoading(false);
    };
    fetchQuizAndCourseData();
  }, [courseId, quizId, toast, t.quizNotFound]);

  const handleOptionChange = (questionId: string, optionId: string) => setUserAnswers(prev => ({ ...prev, [questionId]: optionId }));
  const handleNextQuestion = () => { if (currentQuiz?.questions && currentQuestionIndex < currentQuiz.questions.length - 1) setCurrentQuestionIndex(prev => prev + 1); };
  const handlePreviousQuestion = () => { if (currentQuestionIndex > 0) setCurrentQuestionIndex(prev => prev - 1); };

  const handleSubmitQuiz = () => {
    if (!currentQuiz?.questions) return;
    if (Object.keys(userAnswers).length !== currentQuiz.questions.length) {
        toast({title: t.selectOption, variant: "destructive"}); return;
    }
    let calculatedScore = 0;
    currentQuiz.questions.forEach(q => { if (userAnswers[q.id] === q.correctOptionId) calculatedScore += (q.points || 1); });
    setScore(calculatedScore); setQuizSubmitted(true);
  };
  const handleStartOver = () => { setCurrentQuestionIndex(0); setUserAnswers({}); setQuizSubmitted(false); setScore(0); };

  if (isLoading) { /* Loading Skeleton */ return (<div className="max-w-2xl mx-auto py-8 px-4"><div className="flex justify-center items-center h-64"><Loader2 className="h-12 w-12 animate-spin text-primary" /><p className="ml-3 text-muted-foreground">{t.loadingQuiz}</p></div></div>); }
  if (!currentQuiz || !currentCourse) { /* Quiz or Course Not Found UI */ return ( <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center py-10"><Card className="w-full max-w-lg shadow-xl"><CardHeader><CardTitle className="text-2xl sm:text-3xl font-headline text-foreground flex items-center justify-center"><AlertTriangle className="mr-3 h-8 w-8 text-destructive" /> {t.quizNotFound}</CardTitle></CardHeader><CardContent className="space-y-6"><p className="text-muted-foreground">{t.quizNotFoundDesc.replace('{quizId}', quizId).replace('{courseId}', courseId)}</p><div className="flex flex-col sm:flex-row gap-2 justify-center">{courseId && (<Button asChild variant="outline" className="w-full sm:w-auto"><Link href={`/courses/${courseId}`}>{t.backToCourse}</Link></Button>)}<Button asChild className="w-full sm:w-auto"><Link href="/"><Home className="mr-2 h-4 w-4" /> {t.goToHomepage}</Link></Button></div></CardContent></Card></div> );}
  if (!currentQuiz.questions || currentQuiz.questions.length === 0) { /* Quiz Empty UI */ return ( <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center py-10"><Card className="w-full max-w-lg shadow-xl"><CardHeader><CardTitle className="text-2xl sm:text-3xl font-headline text-foreground flex items-center justify-center"><HelpCircle className="mr-3 h-8 w-8 text-primary" /> {t.quizEmptyTitle}</CardTitle></CardHeader><CardContent className="space-y-6"><p className="text-muted-foreground">{t.quizEmptyDesc.replace('{quizTitle}', currentQuiz.title)}</p><div className="flex flex-col sm:flex-row gap-2 justify-center">{courseId && (<Button asChild variant="outline" className="w-full sm:w-auto"><Link href={`/courses/${courseId}`}>{t.backToCourse}</Link></Button>)}<Button asChild className="w-full sm:w-auto"><Link href="/"><Home className="mr-2 h-4 w-4" /> {t.goToHomepage}</Link></Button></div></CardContent></Card></div> );}

  const currentQuestionData = currentQuiz.questions[currentQuestionIndex];
  const totalQuestions = currentQuiz.questions.length;
  const progressPercentage = totalQuestions > 0 ? ((currentQuestionIndex + 1) / totalQuestions) * 100 : 0;
  const maxPossibleScore = currentQuiz.questions.reduce((sum, q) => sum + (q.points || 1), 0);

  if (quizSubmitted) { /* Results UI */
    const percentageScore = maxPossibleScore > 0 ? (score / maxPossibleScore) * 100 : 0;
    const passed = currentQuiz.quizType === 'GRADED' && currentQuiz.passingScore !== undefined && currentQuiz.passingScore !== null ? percentageScore >= currentQuiz.passingScore : true;
    return (<div className="max-w-2xl mx-auto py-8 px-4"><Button variant="outline" asChild className="mb-6"><Link href={`/courses/${courseId}`}><ChevronLeft className="mr-2 h-4 w-4" /> {t.backToCourse}</Link></Button><Card className="shadow-xl"><CardHeader className="text-center"><Award className="mx-auto h-12 w-12 text-primary mb-2" /><CardTitle className="text-2xl font-headline">{t.resultsTitle}</CardTitle><CardDescription className="text-lg">{t.score.replace('{score}', score.toString()).replace('{totalQuestions}', maxPossibleScore.toString()).replace('{percentage}', percentageScore.toFixed(0))}</CardDescription>{currentQuiz.quizType === 'GRADED' && currentQuiz.passingScore !== null && currentQuiz.passingScore !== undefined && (<p className={`font-semibold text-lg ${passed ? 'text-green-600' : 'text-red-600'}`}>{passed ? t.passed : t.failed}</p>)}</CardHeader><CardContent><h3 className="font-semibold text-md mb-3 text-center">{t.reviewAnswers}</h3><div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2">{currentQuiz.questions.map((q, index) => { const userAnswerId = userAnswers[q.id]; const isCorrect = userAnswerId === q.correctOptionId; const userAnswerText = q.options.find(opt => opt.id === userAnswerId)?.text; const correctAnswerText = q.options.find(opt => opt.id === q.correctOptionId)?.text; return ( <div key={q.id} className={`p-3 rounded-md border ${isCorrect ? 'border-green-500 bg-green-50 dark:bg-green-900/30' : 'border-red-500 bg-red-50 dark:bg-red-900/30'}`}><p className="font-medium text-sm mb-1">{q.order || index + 1}. {q.text}</p><p className={`text-xs ${isCorrect ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>{t.yourAnswer} {userAnswerText || 'Not answered'} - {isCorrect ? t.correct : t.incorrect}</p>{!isCorrect && <p className="text-xs text-blue-700 dark:text-blue-300">{t.correctAnswer} {correctAnswerText}</p>}</div> );})}</div></CardContent><CardFooter className="flex flex-col sm:flex-row justify-center gap-2"><Button onClick={handleStartOver} variant="outline"><ChevronLeft className="mr-2 h-4 w-4" /> {t.startOver}</Button><Button asChild><Link href={`/courses/${courseId}`}>{t.backToCourse}</Link></Button></CardFooter></Card></div>);
  }

  return ( /* Quiz In Progress UI */
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="mb-4">
        <h1 className="text-2xl font-bold font-headline text-foreground mb-1">{t.quizTitle.replace('{title}', currentQuiz.title)}</h1>
        <p className="text-sm text-muted-foreground">{t.courseContext.replace('{courseTitle}', currentCourse.title)}</p>
        <p className="text-sm text-muted-foreground">{t.question.replace('{current}', (currentQuestionIndex + 1).toString()).replace('{total}', totalQuestions.toString())}</p>
        <Progress value={progressPercentage} className="w-full h-2 mt-2" />
      </div>
      <Card className="shadow-lg"><CardHeader><CardTitle className="text-lg font-semibold leading-snug">{currentQuestionData.text}</CardTitle></CardHeader><CardContent>
        <RadioGroup value={userAnswers[currentQuestionData.id] || ''} onValueChange={(value) => handleOptionChange(currentQuestionData.id, value)} className="space-y-3">
          {currentQuestionData.options.map(option => (<Label key={option.id} htmlFor={`option-${currentQuestionData.id}-${option.id}`} className={`flex items-center space-x-3 p-3 border rounded-md cursor-pointer transition-all ${userAnswers[currentQuestionData.id] === option.id ? 'bg-primary/10 border-primary ring-1 ring-primary dark:bg-primary/20' : 'hover:bg-muted/50 dark:hover:bg-muted/30'}`}><RadioGroupItem value={option.id} id={`option-${currentQuestionData.id}-${option.id}`} /><span>{option.text}</span></Label>))}
        </RadioGroup></CardContent><CardFooter className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-4">
        <Button variant="outline" onClick={handlePreviousQuestion} disabled={currentQuestionIndex === 0} className="w-full sm:w-auto"><ChevronLeft className="mr-2 h-4 w-4" /> {t.previousQuestion}</Button>
        {currentQuestionIndex < totalQuestions - 1 ? (<Button onClick={handleNextQuestion} disabled={!userAnswers[currentQuestionData.id]} className="w-full sm:w-auto">{t.nextQuestion} <ChevronRight className="ml-2 h-4 w-4" /></Button>) : (<Button onClick={handleSubmitQuiz} disabled={!userAnswers[currentQuestionData.id]} className="w-full sm:w-auto bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800">{t.submitQuiz} <CheckCircle className="ml-2 h-4 w-4" /></Button>)}
      </CardFooter></Card>
      <Button variant="link" asChild className="mt-6 mx-auto block text-muted-foreground hover:text-primary"><Link href={`/courses/${courseId}`}><ChevronLeft className="mr-1 h-4 w-4" /> {t.backToCourse}</Link></Button>
    </div>
  );
}
