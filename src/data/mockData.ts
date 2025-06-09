
export type Lesson = {
  id: string;
  title: string;
  duration: string;
  description?: string;
  embedUrl?: string;
};

export type Module = {
  id: string;
  title: string;
  lessons: Lesson[];
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
};

export type User = {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'admin';
  passwordHash: string; // In a real app, this would be a hash
};

export type Enrollment = {
  id: string;
  userId: string;
  courseId: string;
  progress: number; // 0-100
  enrolledDate: string;
};

export type Video = {
  id: string;
  title: string;
  description: string;
  thumbnailUrl?: string;
  videoUrl?: string; // Placeholder
  dataAiHint?: string;
};

export const courses: Course[] = [
  {
    id: 'course1',
    title: 'Introduction to Web Development',
    description: 'Learn the fundamentals of HTML, CSS, and JavaScript.',
    category: 'Development',
    instructor: 'Dr. Web Coder',
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: 'programming code',
    modules: [
      { 
        id: 'm1c1', 
        title: 'HTML Basics', 
        lessons: [
          { id: 'l1m1c1', title: 'Intro to HTML', duration: '10min', description: 'An overview of HTML structure and tags.', embedUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
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
      },
    ],
  },
  {
    id: 'course2',
    title: 'Advanced JavaScript Techniques',
    description: 'Dive deep into modern JavaScript features and patterns.',
    category: 'Development',
    instructor: 'Prof. Script Master',
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: 'abstract javascript',
    modules: [
      { 
        id: 'm1c2', 
        title: 'ES6+ Features', 
        lessons: [
          { id: 'l1m1c2', title: 'Arrow Functions', duration: '20min', description: 'Learn about arrow functions and their syntax.' },
          { id: 'l2m1c2', title: 'Destructuring', duration: '15min', description: 'Using destructuring for arrays and objects.' }
        ] 
      },
      { 
        id: 'm2c2', 
        title: 'Async Programming', 
        lessons: [
          { id: 'l1m2c2', title: 'Promises & Async/Await', duration: '25min', description: 'Master asynchronous JavaScript with Promises and async/await.' }
        ] 
      },
    ],
  },
  {
    id: 'course3',
    title: 'Data Science with Python',
    description: 'Explore data analysis, visualization, and machine learning.',
    category: 'Data Science',
    instructor: 'Dr. Data Insight',
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: 'python data',
    modules: [
      { 
        id: 'm1c3', 
        title: 'Python for Data', 
        lessons: [
          { id: 'l1m1c3', title: 'NumPy & Pandas', duration: '30min', description: 'Introduction to NumPy and Pandas libraries.' }
        ] 
      },
      { 
        id: 'm2c3', 
        title: 'Machine Learning Basics', 
        lessons: [
          { id: 'l1m2c3', title: 'Intro to Scikit-learn', duration: '35min', description: 'Getting started with Scikit-learn for machine learning.' }
        ] 
      },
    ],
  },
];

export const users: User[] = [
  { id: 'user1', name: 'Student User', email: 'student@example.com', role: 'student', passwordHash: 'password123' }, // Plain text for demo
  { id: 'user2', name: 'Admin User', email: 'admin@example.com', role: 'admin', passwordHash: 'adminpass' }, // Plain text for demo
  { id: 'user3', name: 'Jane Doe', email: 'jane@example.com', role: 'student', passwordHash: 'password123' },
];

export const enrollments: Enrollment[] = [
  { id: 'enroll1', userId: 'user1', courseId: 'course1', progress: 50, enrolledDate: '2023-01-15' },
  { id: 'enroll2', userId: 'user1', courseId: 'course3', progress: 20, enrolledDate: '2023-02-01' },
  { id: 'enroll3', userId: 'user3', courseId: 'course2', progress: 75, enrolledDate: '2023-03-10' },
];

export const videos: Video[] = [
  { id: 'video1', title: '🎬 Video 1: Quick HTML Tip', description: 'A short tip on HTML structure.' , thumbnailUrl: 'https://placehold.co/300x500.png', dataAiHint: 'code snippet'},
  { id: 'video2', title: '🎬 Video 2: CSS Magic Trick', description: 'Cool CSS animation for your site.' , thumbnailUrl: 'https://placehold.co/300x500.png', dataAiHint: 'ui design'},
  { id: 'video3', title: '🎬 Video 3: JavaScript Snippet', description: 'Useful JavaScript function in 60s.' , thumbnailUrl: 'https://placehold.co/300x500.png', dataAiHint: 'developer coding'},
  { id: 'video4', title: '🎬 Video 4: Python Short', description: 'A quick Python data trick.' , thumbnailUrl: 'https://placehold.co/300x500.png', dataAiHint: 'data visualization'},
  { id: 'video5', title: '🎬 Video 5: React Tip', description: 'Optimize your React components.' , thumbnailUrl: 'https://placehold.co/300x500.png', dataAiHint: 'react logo'},
  { id: 'video6', title: '🎬 Video 6: Next.js News', description: 'Latest updates in Next.js world.' , thumbnailUrl: 'https://placehold.co/300x500.png', dataAiHint: 'nextjs framework'},
  { id: 'video7', title: '🎬 Video 7: Tailwind Power', description: 'Unlock Tailwind CSS potential.' , thumbnailUrl: 'https://placehold.co/300x500.png', dataAiHint: 'tailwind css'},
  { id: 'video8', title: '🎬 Video 8: ShadCN UI Guide', description: 'Building UIs with ShadCN.' , thumbnailUrl: 'https://placehold.co/300x500.png', dataAiHint: 'shadcn ui'},
  { id: 'video9', title: '🎬 Video 9: Firebase Tips', description: 'Quick Firebase integration tips.' , thumbnailUrl: 'https://placehold.co/300x500.png', dataAiHint: 'firebase platform'},
  { id: 'video10', title: '🎬 Video 10: Genkit Intro', description: 'Exploring Genkit for AI.' , thumbnailUrl: 'https://placehold.co/300x500.png', dataAiHint: 'ai technology'},
  { id: 'video11', title: '🎬 Video 11: Advanced CSS Grids', description: 'Mastering CSS Grid layouts.', thumbnailUrl: 'https://placehold.co/300x500.png', dataAiHint: 'css grid' },
  { id: 'video12', title: '🎬 Video 12: State Management in React', description: 'Exploring different state management solutions.', thumbnailUrl: 'https://placehold.co/300x500.png', dataAiHint: 'react state' },
  { id: 'video13', title: '🎬 Video 13: Introduction to Docker', description: 'Learn the basics of Docker and containerization.', thumbnailUrl: 'https://placehold.co/300x500.png', dataAiHint: 'docker logo' },
  { id: 'video14', title: '🎬 Video 14: GraphQL vs REST', description: 'Comparing GraphQL and REST APIs.', thumbnailUrl: 'https://placehold.co/300x500.png', dataAiHint: 'api comparison' },
  { id: 'video15', title: '🎬 Video 15: Serverless Functions Explained', description: 'Understanding serverless architecture.', thumbnailUrl: 'https://placehold.co/300x500.png', dataAiHint: 'cloud functions' },
];
