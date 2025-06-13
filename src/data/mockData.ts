
import type { LucideIcon } from 'lucide-react';
import type * as LucideIcons from 'lucide-react';

export type Lesson = {
  id: string;
  title: string;
  duration: string;
  description?: string;
  embedUrl?: string;
  imageUrl?: string;
};

export type Module = {
  id: string;
  title: string;
  lessons: Lesson[];
};

export type Option = {
  id: string;
  text: string;
};

export type Question = {
  id: string;
  text: string;
  options: Option[];
  correctOptionId: string;
  points?: number;
};

export type Quiz = {
  id: string;
  title: string;
  quizType: 'practice' | 'graded';
  questions: Question[];
  passingScore?: number;
};

export type Course = {
  id: string;
  title: string;
  description: string;
  category: string;
  instructor: string;
  modules: Module[];
  imageUrl?: string;
  dataAiHint?: string;
  price?: number;
  currency?: string;
  isFeatured?: boolean;
  learningObjectives?: string[];
  targetAudience?: string;
  prerequisites?: string[];
  estimatedTimeToComplete?: string;
  quizzes?: Quiz[];
  createdAt?: any;
  updatedAt?: any;
};

export type User = {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'admin';
  passwordHash: string; 
  createdAt?: any;
};

export type Enrollment = {
  id: string;
  userId: string;
  courseId: string;
  progress: number;
  enrolledDate: string;
  createdAt?: any;
  updatedAt?: any;
};

export type Video = {
  id: string;
  title: string;
  description: string;
  thumbnailUrl?: string;
  videoUrl?: string; 
  embedUrl?: string; 
  dataAiHint?: string;
  createdAt?: any;
  updatedAt?: any;
};

export type Category = {
  id: string;
  name: string;
  imageUrl?: string;
  dataAiHint?: string;
  iconName?: keyof typeof LucideIcons;
  createdAt?: any;
  updatedAt?: any;
};

export type PaymentSubmissionStatus = 'pending' | 'approved' | 'rejected';

export type PaymentSubmission = {
  id: string;
  userId: string;
  courseId: string;
  amount: number;
  currency: string;
  screenshotUrl: string;
  status: PaymentSubmissionStatus;
  submittedAt: string;
  reviewedAt?: string;
  adminNotes?: string;
  createdAt?: any;
  updatedAt?: any;
};

export type PaymentSettings = {
  bankName?: string;
  accountNumber?: string;
  accountHolderName?: string;
  additionalInstructions?: string;
  updatedAt?: any;
};

export type LearningPath = {
  id: string;
  title: string;
  description: string;
  icon?: string;
  courseIds: string[];
  imageUrl?: string;
  dataAiHint?: string;
  createdAt?: any;
  updatedAt?: any;
};

export type FlashcardCategory = {
  id: string;
  name: string;
  description?: string;
  iconName?: keyof typeof LucideIcons;
};

export type Flashcard = {
  id: string;
  categoryId: string;
  term: string;
  definition: string;
  example?: string;
  pronunciation?: string;
};


export const mockCoursesForSeeding: Course[] = [
  {
    id: 'course1',
    title: 'Introduction to Web Development',
    description: 'Learn the fundamentals of HTML, CSS, and JavaScript. Build your first static website and understand core web concepts.',
    category: 'Web Development',
    instructor: 'Dr. Web Coder',
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: 'programming code',
    price: 0,
    currency: 'USD',
    isFeatured: true,
    learningObjectives: [
      'Understand the basic structure of an HTML document.',
      'Apply CSS for styling web pages.',
      'Write basic JavaScript for interactivity.',
      'Build a simple static website.'
    ],
    targetAudience: 'Absolute beginners with no prior coding experience interested in web development.',
    prerequisites: ['Basic computer literacy.', 'A modern web browser and text editor.'],
    estimatedTimeToComplete: 'Approx. 15-20 hours',
    modules: [
      {
        id: 'm1c1',
        title: 'HTML Basics',
        lessons: [
          { id: 'l1m1c1', title: 'Intro to HTML', duration: '10min', description: 'An overview of HTML structure and tags.', embedUrl: 'https://www.youtube.com/watch?v=kUMe1FH4CHE' },
          { id: 'l2m1c1', title: 'HTML Forms', duration: '12min', description: 'Learn how to create forms in HTML.', imageUrl: 'https://placehold.co/600x400.png' }
        ]
      },
      {
        id: 'm2c1',
        title: 'CSS Fundamentals',
        lessons: [
          { id: 'l1m2c1', title: 'Styling with CSS', duration: '15min', description: 'Introduction to CSS selectors and properties.' },
          { id: 'l2m2c1', title: 'CSS Box Model', duration: '18min', description: 'Understanding the CSS box model.', embedUrl: 'https://www.youtube.com/watch?v=rggvsg08c2g' }
        ]
      }
    ],
    quizzes: [
      {
        id: 'quiz1c1',
        title: 'HTML Basics Quiz',
        quizType: 'practice',
        questions: [
          { id: 'q1quiz1c1', text: 'What does HTML stand for?', options: [{id: 'o1', text:'Hyper Text Markup Language'}, {id: 'o2', text:'High Tech Modern Language'}], correctOptionId: 'o1' }
        ]
      }
    ]
  },
  {
    id: 'course2',
    title: 'Advanced JavaScript Concepts',
    description: 'Dive deep into JavaScript, exploring asynchronous programming, closures, and modern ES6+ features.',
    category: 'JavaScript',
    instructor: 'Prof. JS Guru',
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: 'javascript advanced',
    price: 49.99,
    currency: 'USD',
    isFeatured: true,
    learningObjectives: [
      'Master asynchronous JavaScript (Promises, async/await).',
      'Understand closures and lexical scoping.',
      'Utilize ES6+ features like arrow functions, destructuring, and modules.',
      'Learn about event loop and JavaScript runtime.'
    ],
    targetAudience: 'Developers with basic JavaScript knowledge looking to deepen their understanding.',
    prerequisites: ['Solid understanding of JavaScript fundamentals (variables, loops, functions).'],
    estimatedTimeToComplete: 'Approx. 25-30 hours',
    modules: [
      {
        id: 'm1c2',
        title: 'Asynchronous JavaScript',
        lessons: [
          { id: 'l1m1c2', title: 'Callbacks & Promises', duration: '20min', embedUrl: 'https://www.youtube.com/watch?v=DHvZLI7Db8E' },
          { id: 'l2m1c2', title: 'Async/Await', duration: '15min' }
        ]
      }
    ]
  },
];

// Passwords here are PLAINTEXT for seeding. They will be hashed by authUtils.seedInitialUsersToLocalStorage.
export const mockUsersForSeeding: User[] = [
  { id: 'user-super-admin-seed', name: 'Super Admin', email: 'admin@example.com', role: 'admin', passwordHash: 'superadminpass_PLAINTEXT' },
  { id: 'user-student-seed', name: 'Student User', email: 'student@example.com', role: 'student', passwordHash: 'password123_PLAINTEXT' },
  { id: 'user-nanghtikeaung-seed', name: 'Nang Htike Aung', email: 'nanghtikeaung@gmail.com', role: 'admin', passwordHash: 'password123_PLAINTEXT' },
];

export const mockVideosForSeeding: Video[] = [
  { id: 'video1-seed', title: '🎬 Quick HTML Tip', description: 'A short tip on HTML structure for beginners.', thumbnailUrl: 'https://placehold.co/360x640.png', dataAiHint: 'code snippet', embedUrl: 'https://www.youtube.com/watch?v=kUMe1FH4CHE', createdAt: new Date('2023-01-01T10:00:00Z') },
  { id: 'video2-seed', title: '🚀 CSS Flexbox Explained', description: 'Understand CSS Flexbox in under 5 minutes!', thumbnailUrl: 'https://placehold.co/360x640.png', dataAiHint: 'css layout', embedUrl: 'https://www.youtube.com/watch?v=fYq5PXgSsbE', createdAt: new Date('2023-01-02T11:00:00Z') },
];

export const mockCategoriesForSeeding: Category[] = [
  { id: 'cat1-seed', name: 'Web Development', imageUrl: 'https://placehold.co/200x150.png', dataAiHint: 'coding web', iconName: 'Globe' },
  { id: 'cat2-seed', name: 'Data Science', imageUrl: 'https://placehold.co/200x150.png', dataAiHint: 'analytics charts', iconName: 'DatabaseZap' },
  { id: 'cat3-seed', name: 'JavaScript', imageUrl: 'https://placehold.co/200x150.png', dataAiHint: 'javascript logo', iconName: 'Braces' },
  { id: 'cat4-seed', name: 'Cloud Computing', imageUrl: 'https://placehold.co/200x150.png', dataAiHint: 'cloud network', iconName: 'Cloud' },
  { id: 'cat5-seed', name: 'AI & ML', imageUrl: 'https://placehold.co/200x150.png', dataAiHint: 'artificial intelligence', iconName: 'BrainCircuit' },
];

export const mockLearningPathsForSeeding: LearningPath[] = [
  {
    id: 'lp1-seed',
    title: 'Full-Stack Web Developer Path',
    description: 'Master front-end and back-end technologies to build complete web applications from scratch.',
    icon: 'Milestone', 
    courseIds: ['course1', 'course2'], 
    imageUrl: 'https://placehold.co/300x200.png',
    dataAiHint: 'web development journey'
  },
  {
    id: 'lp2-seed',
    title: 'JavaScript Fundamentals',
    description: 'A focused path to build a strong foundation in JavaScript, from basics to more advanced concepts.',
    icon: 'BookOpenText',
    courseIds: ['course2'], 
    imageUrl: 'https://placehold.co/300x200.png',
    dataAiHint: 'javascript learning'
  }
];


export const courses_DEPRECATED_USE_FIRESTORE: Course[] = mockCoursesForSeeding;
export const defaultMockCourses = courses_DEPRECATED_USE_FIRESTORE;

export const users: User[] = mockUsersForSeeding; 

export const enrollments_DEPRECATED_USE_FIRESTORE: Enrollment[] = [
];
export const initialEnrollments = enrollments_DEPRECATED_USE_FIRESTORE;

export const videos_DEPRECATED_USE_FIRESTORE: Video[] = mockVideosForSeeding;
export const defaultMockVideos = videos_DEPRECATED_USE_FIRESTORE;

export const initialCategoriesData: Category[] = mockCategoriesForSeeding;
export const defaultMockCategories = initialCategoriesData;

export const paymentSubmissions_DEPRECATED_USE_FIRESTORE: PaymentSubmission[] = [];
export const initialPaymentSubmissions = paymentSubmissions_DEPRECATED_USE_FIRESTORE;

export const initialPaymentSettings: PaymentSettings = {
    bankName: 'Example Bank Global',
    accountNumber: '0000-0000-0000-0000',
    accountHolderName: 'Yellow Institute Global',
    additionalInstructions: 'Please include your User ID or Course Name in the payment reference. Payments are typically verified within 24 business hours.',
};

export const initialLearningPaths_DEPRECATED_USE_FIRESTORE: LearningPath[] = mockLearningPathsForSeeding;
export const initialLearningPaths = initialLearningPaths_DEPRECATED_USE_FIRESTORE;

export type QuizType = 'practice' | 'graded'; // Export this for CourseManagement
