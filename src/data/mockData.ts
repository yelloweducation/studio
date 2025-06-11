
import type { LucideIcon } from 'lucide-react'; // Keep for potential direct use in components
import type * as LucideIcons from 'lucide-react'; // For FlashcardCategory iconName type

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
  points?: number; // Optional points per question
};

export type Quiz = {
  id: string;
  title: string;
  quizType: 'practice' | 'graded';
  questions: Question[];
  passingScore?: number; // For graded quizzes, e.g., 70 for 70%
};

export type Course = {
  id: string; // Firestore document ID
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
  // Timestamps for Firestore
  createdAt?: any; // Firestore ServerTimestamp
  updatedAt?: any; // Firestore ServerTimestamp
};

export type User = {
  id: string; // Firestore document ID (or Firebase Auth UID)
  name: string;
  email: string;
  role: 'student' | 'admin';
  passwordHash: string; // For mock/simplified auth; Firebase Auth handles this securely.
  // Timestamps for Firestore
  createdAt?: any; // Firestore ServerTimestamp
};

export type Enrollment = {
  id: string; // Firestore document ID
  userId: string;
  courseId: string;
  progress: number; // 0-100
  enrolledDate: string; // ISO date string
  // Timestamps for Firestore
  createdAt?: any; // Firestore ServerTimestamp
  updatedAt?: any; // Firestore ServerTimestamp
};

export type Video = {
  id: string; // Firestore document ID
  title: string;
  description: string;
  thumbnailUrl?: string;
  videoUrl?: string;
  embedUrl?: string;
  dataAiHint?: string;
  // Timestamps for Firestore
  createdAt?: any; // Firestore ServerTimestamp
  updatedAt?: any; // Firestore ServerTimestamp
};

export type Category = {
  id: string; // Firestore document ID
  name: string;
  imageUrl?: string;
  dataAiHint?: string;
  iconName?: keyof typeof LucideIcons;
  // Timestamps for Firestore
  createdAt?: any; // Firestore ServerTimestamp
  updatedAt?: any; // Firestore ServerTimestamp
};

export type PaymentSubmissionStatus = 'pending' | 'approved' | 'rejected';

export type PaymentSubmission = {
  id: string; // Firestore document ID
  userId: string;
  courseId: string;
  amount: number;
  currency: string;
  screenshotUrl: string; // Consider Firebase Storage for actual file uploads
  status: PaymentSubmissionStatus;
  submittedAt: string; // ISO date string
  reviewedAt?: string; // ISO date string
  adminNotes?: string;
  // Timestamps for Firestore
  createdAt?: any; // Firestore ServerTimestamp
  updatedAt?: any; // Firestore ServerTimestamp
};

export type PaymentSettings = {
  // id: string; // Typically, there's one document for settings, e.g., 'globalPaymentSettings'
  bankName?: string;
  accountNumber?: string;
  accountHolderName?: string;
  additionalInstructions?: string;
  // Timestamps for Firestore
  updatedAt?: any; // Firestore ServerTimestamp
};

export type LearningPath = {
  id: string; // Firestore document ID
  title: string;
  description: string;
  icon?: string;
  courseIds: string[];
  imageUrl?: string;
  dataAiHint?: string;
  // Timestamps for Firestore
  createdAt?: any; // Firestore ServerTimestamp
  updatedAt?: any; // Firestore ServerTimestamp
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


// --- Default/Initial Mock Data ---
// This data can be used for seeding Firestore if it's empty,
// or as a fallback if Firestore is unavailable during development.
// The application should now primarily fetch data from Firestore.

export const courses_DEPRECATED_USE_FIRESTORE: Course[] = [
  {
    id: 'course1',
    title: 'Introduction to Web Development',
    description: 'Learn the fundamentals of HTML, CSS, and JavaScript.',
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
          { id: 'l2m1c1', title: 'HTML Forms', duration: '12min', description: 'Learn how to create forms in HTML.'}
        ]
      },
      {
        id: 'm2c1',
        title: 'CSS Fundamentals',
        lessons: [
          { id: 'l1m2c1', title: 'Styling with CSS', duration: '15min', description: 'Introduction to CSS selectors and properties.' },
          { id: 'l2m2c1', title: 'CSS Box Model', duration: '18min', description: 'Understanding the CSS box model.'}
        ]
      }
    ],
    quizzes: [ /* ... quizzes ... */ ]
  },
];
export const defaultMockCourses = courses_DEPRECATED_USE_FIRESTORE;

export const users: User[] = [
  { id: 'user1', name: 'Student User', email: 'student@example.com', role: 'student', passwordHash: 'password123' },
  { id: 'user2', name: 'Admin User', email: 'admin@example.com', role: 'admin', passwordHash: 'adminpass' },
  { id: 'user3', name: 'Jane Doe', email: 'jane@example.com', role: 'student', passwordHash: 'password123' },
];

export const enrollments_DEPRECATED_USE_FIRESTORE: Enrollment[] = [
  { id: 'enroll1', userId: 'user1', courseId: 'course1', progress: 50, enrolledDate: '2023-01-15' },
];
export const initialEnrollments = enrollments_DEPRECATED_USE_FIRESTORE;


export const videos_DEPRECATED_USE_FIRESTORE: Video[] = [
  { id: 'video1', title: '🎬 Quick HTML Tip', description: 'A short tip on HTML structure.' , thumbnailUrl: 'https://placehold.co/360x640.png', dataAiHint: 'code snippet', embedUrl: 'https://www.youtube.com/watch?v=kUMe1FH4CHE'},
];
export const defaultMockVideos = videos_DEPRECATED_USE_FIRESTORE;

export const initialCategoriesData: Category[] = [
  { id: 'cat1', name: 'Web Development', imageUrl: 'https://placehold.co/200x150.png', dataAiHint: 'coding web', iconName: 'Globe' },
  { id: 'cat2', name: 'Data Science', imageUrl: 'https://placehold.co/200x150.png', dataAiHint: 'analytics charts', iconName: 'DatabaseZap' },
  { id: 'cat3', name: 'JavaScript', imageUrl: 'https://placehold.co/200x150.png', dataAiHint: 'javascript logo', iconName: 'Braces' },
  { id: 'cat4', name: 'Cloud Computing', imageUrl: 'https://placehold.co/200x150.png', dataAiHint: 'cloud network', iconName: 'Cloud' },
  { id: 'cat5', name: 'AI & ML', imageUrl: 'https://placehold.co/200x150.png', dataAiHint: 'artificial intelligence', iconName: 'BrainCircuit' },
];
export const defaultMockCategories = initialCategoriesData;


export const paymentSubmissions_DEPRECATED_USE_FIRESTORE: PaymentSubmission[] = [];
export const initialPaymentSubmissions = paymentSubmissions_DEPRECATED_USE_FIRESTORE;

export const initialPaymentSettings: PaymentSettings = {
    bankName: '',
    accountNumber: '',
    accountHolderName: '',
    additionalInstructions: 'Please include your User ID or Course Name in the payment reference.',
};

export const initialLearningPaths_DEPRECATED_USE_FIRESTORE: LearningPath[] = [
  {
    id: 'lp1',
    title: 'Full-Stack Web Developer Path',
    description: 'Master front-end and back-end technologies to build complete web applications.',
    icon: 'Milestone',
    courseIds: ['course1', 'course2'], // Ensure these IDs match actual course IDs in Firestore
    imageUrl: 'https://placehold.co/300x200.png',
    dataAiHint: 'web development'
  },
];
export const initialLearningPaths = initialLearningPaths_DEPRECATED_USE_FIRESTORE;
