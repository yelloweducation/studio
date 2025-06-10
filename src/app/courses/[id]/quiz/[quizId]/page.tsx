
"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { courses as defaultMockCourses, type Course, type Quiz, type Question as QuizQuestionType, type Option as QuizOptionType } from '@/data/mockData';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronLeft, ChevronRight, CheckCircle, XCircle, AlertTriangle, Home, HelpCircle, Award } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const quizPageTranslations = {
  en: {
    quizTitle: "Quiz: {title}",
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
    quizNotFoundDesc: "The quiz you are trying to access (ID: {quizId}) for course (ID: {courseId}) could not be found.",
    selectOption: "Please select an option.",
    startOver: "Start Over"
  },
  my: {
    quizTitle: "စာမေးပွဲငယ်: {title}",
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
    quizNotFoundDesc: "သင်ရှာဖွေနေသော စာမေးပွဲငယ် (ID: {quizId})၊ သင်တန်း (ID: {courseId}) ကို ရှာမတွေ့ပါ။",
    selectOption: "ကျေးဇူးပြု၍ အဖြေတစ်ခု ရွေးချယ်ပါ။",
    startOver: "အစမှပြန်စပါ"
  }
};

export default function QuizPage() {
  const params = useParams();
  const router = useRouter();
  const { language } = useLanguage();
  const t = quizPageTranslations[language];

  const courseId = params.id as string;
  const quizId = params.quizId as string;

  const [isLoading, setIsLoading] = useState(true);
  const [currentCourse, setCurrentCourse] = useState<Course | null>(null);
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<{ [questionId: string]: string }>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    setIsLoading(true);
    let coursesToUse: Course[] = [];
    try {
      const storedCoursesString = localStorage.getItem('adminCourses');
      if (storedCoursesString) {
        coursesToUse = JSON.parse(storedCoursesString) as Course[];
      } else {
        coursesToUse = defaultMockCourses;
      }
    } catch (error) {
      console.error("Error loading courses for quiz:", error);
      coursesToUse = defaultMockCourses;
    }

    const course = coursesToUse.find(c => c.id === courseId);
    if (course) {
      setCurrentCourse(course);
      const quiz = course.quizzes?.find(q => q.id === quizId);
      setCurrentQuiz(quiz || null);
    } else {
      setCurrentCourse(null);
      setCurrentQuiz(null);
    }
    setIsLoading(false);
  }, [courseId, quizId]);

  const handleOptionChange = (questionId: string, optionId: string) => {
    setUserAnswers(prev => ({ ...prev, [questionId]: optionId }));
  };

  const handleNextQuestion = () => {
    if (currentQuiz && currentQuestionIndex < currentQuiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmitQuiz = () => {
    if (!currentQuiz) return;
    if (Object.keys(userAnswers).length !== currentQuiz.questions.length) {
        alert(t.selectOption); // Or use a toast
        return;
    }

    let calculatedScore = 0;
    currentQuiz.questions.forEach(q => {
      if (userAnswers[q.id] === q.correctOptionId) {
        calculatedScore++;
      }
    });
    setScore(calculatedScore);
    setQuizSubmitted(true);
  };

  const handleStartOver = () => {
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setQuizSubmitted(false);
    setScore(0);
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto py-8 px-4">
        <Skeleton className="h-8 w-1/3 mb-2" />
        <Skeleton className="h-6 w-1/2 mb-6" />
        <Card>
          <CardHeader><Skeleton className="h-5 w-1/4 mb-4" /><Skeleton className="h-8 w-full" /></CardHeader>
          <CardContent className="space-y-3">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-10 w-full" />)}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Skeleton className="h-10 w-24" /> <Skeleton className="h-10 w-24" />
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (!currentCourse || !currentQuiz) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center py-10">
        <Card className="w-full max-w-lg shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl sm:text-3xl font-headline text-foreground flex items-center justify-center">
              <AlertTriangle className="mr-3 h-8 w-8 text-destructive" /> {t.quizNotFound}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-muted-foreground">
              {t.quizNotFoundDesc.replace('{quizId}', quizId).replace('{courseId}', courseId)}
            </p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              {courseId && (
                <Button asChild variant="outline" className="w-full sm:w-auto">
                  <Link href={`/courses/${courseId}`}>{t.backToCourse}</Link>
                </Button>
              )}
              <Button asChild className="w-full sm:w-auto">
                <Link href="/"><Home className="mr-2 h-4 w-4" /> {t.goToHomepage}</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestionData = currentQuiz.questions[currentQuestionIndex];
  const totalQuestions = currentQuiz.questions.length;
  const progressPercentage = totalQuestions > 0 ? ((currentQuestionIndex + 1) / totalQuestions) * 100 : 0;

  if (quizSubmitted) {
    const percentageScore = totalQuestions > 0 ? (score / totalQuestions) * 100 : 0;
    const passed = currentQuiz.quizType === 'graded' && currentQuiz.passingScore !== undefined ? percentageScore >= currentQuiz.passingScore : true; // Practice quizzes always "pass"

    return (
      <div className="max-w-2xl mx-auto py-8 px-4">
        <Button variant="outline" asChild className="mb-6">
          <Link href={`/courses/${courseId}`}>
            <ChevronLeft className="mr-2 h-4 w-4" /> {t.backToCourse}
          </Link>
        </Button>
        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <Award className="mx-auto h-12 w-12 text-primary mb-2" />
            <CardTitle className="text-2xl font-headline">{t.resultsTitle}</CardTitle>
            <CardDescription className="text-lg">
              {t.score.replace('{score}', score.toString()).replace('{totalQuestions}', totalQuestions.toString()).replace('{percentage}', percentageScore.toFixed(0))}
            </CardDescription>
            {currentQuiz.quizType === 'graded' && (
              <p className={`font-semibold text-lg ${passed ? 'text-green-600' : 'text-red-600'}`}>
                {passed ? t.passed : t.failed}
              </p>
            )}
          </CardHeader>
          <CardContent>
            <h3 className="font-semibold text-md mb-3 text-center">{t.reviewAnswers}</h3>
            <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2">
              {currentQuiz.questions.map((q, index) => {
                const userAnswerId = userAnswers[q.id];
                const isCorrect = userAnswerId === q.correctOptionId;
                const userAnswerText = q.options.find(opt => opt.id === userAnswerId)?.text;
                const correctAnswerText = q.options.find(opt => opt.id === q.correctOptionId)?.text;
                return (
                  <div key={q.id} className={`p-3 rounded-md border ${isCorrect ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}>
                    <p className="font-medium text-sm mb-1">{index + 1}. {q.text}</p>
                    <p className={`text-xs ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                      {t.yourAnswer} {userAnswerText || 'Not answered'} - {isCorrect ? t.correct : t.incorrect}
                    </p>
                    {!isCorrect && <p className="text-xs text-blue-700">{t.correctAnswer} {correctAnswerText}</p>}
                  </div>
                );
              })}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row justify-center gap-2">
             <Button onClick={handleStartOver} variant="outline">
                <ChevronLeft className="mr-2 h-4 w-4" /> {t.startOver}
              </Button>
            <Button asChild>
              <Link href={`/courses/${courseId}`}>
                 {t.backToCourse}
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="mb-4">
        <h1 className="text-2xl font-bold font-headline text-foreground mb-1">{t.quizTitle.replace('{title}', currentQuiz.title)}</h1>
        <p className="text-sm text-muted-foreground">{t.question.replace('{current}', (currentQuestionIndex + 1).toString()).replace('{total}', totalQuestions.toString())}</p>
        <Progress value={progressPercentage} className="w-full h-2 mt-2" />
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg font-semibold leading-snug">{currentQuestionData.text}</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={userAnswers[currentQuestionData.id] || ''}
            onValueChange={(value) => handleOptionChange(currentQuestionData.id, value)}
            className="space-y-3"
          >
            {currentQuestionData.options.map(option => (
              <Label
                key={option.id}
                htmlFor={`option-${currentQuestionData.id}-${option.id}`}
                className={`flex items-center space-x-3 p-3 border rounded-md cursor-pointer transition-all 
                  ${userAnswers[currentQuestionData.id] === option.id ? 'bg-primary/10 border-primary ring-1 ring-primary' : 'hover:bg-muted/50'}`}
              >
                <RadioGroupItem value={option.id} id={`option-${currentQuestionData.id}-${option.id}`} />
                <span>{option.text}</span>
              </Label>
            ))}
          </RadioGroup>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-4">
          <Button 
            variant="outline" 
            onClick={handlePreviousQuestion} 
            disabled={currentQuestionIndex === 0}
            className="w-full sm:w-auto"
          >
            <ChevronLeft className="mr-2 h-4 w-4" /> {t.previousQuestion}
          </Button>
          {currentQuestionIndex < totalQuestions - 1 ? (
            <Button onClick={handleNextQuestion} disabled={!userAnswers[currentQuestionData.id]} className="w-full sm:w-auto">
              {t.nextQuestion} <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleSubmitQuiz} disabled={!userAnswers[currentQuestionData.id]} className="w-full sm:w-auto bg-green-600 hover:bg-green-700">
              {t.submitQuiz} <CheckCircle className="ml-2 h-4 w-4" />
            </Button>
          )}
        </CardFooter>
      </Card>
        <Button variant="link" asChild className="mt-6 mx-auto block text-muted-foreground hover:text-primary">
            <Link href={`/courses/${courseId}`}>
                <ChevronLeft className="mr-1 h-4 w-4" /> {t.backToCourse}
            </Link>
        </Button>
    </div>
  );
}

    