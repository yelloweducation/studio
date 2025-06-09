export type Course = {
  id: string;
  title: string;
  description: string;
  category: string;
  instructor: string;
  modules: { id: string; title: string; lessons: { id: string; title: string; duration: string }[] }[];
  imageUrl?: string;
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
};

export const courses: Course[] = [
  {
    id: 'course1',
    title: 'Introduction to Web Development',
    description: 'Learn the fundamentals of HTML, CSS, and JavaScript.',
    category: 'Development',
    instructor: 'Dr. Web Coder',
    imageUrl: 'https://placehold.co/600x400.png?text=Web+Dev',
    dataAiHint: 'programming code',
    modules: [
      { id: 'm1', title: 'HTML Basics', lessons: [{ id: 'l1', title: 'Intro to HTML', duration: '10min' }] },
      { id: 'm2', title: 'CSS Fundamentals', lessons: [{ id: 'l2', title: 'Styling with CSS', duration: '15min' }] },
    ],
  },
  {
    id: 'course2',
    title: 'Advanced JavaScript Techniques',
    description: 'Dive deep into modern JavaScript features and patterns.',
    category: 'Development',
    instructor: 'Prof. Script Master',
    imageUrl: 'https://placehold.co/600x400.png?text=JS+Advanced',
    dataAiHint: 'abstract javascript',
    modules: [
      { id: 'm1', title: 'ES6+ Features', lessons: [{ id: 'l1', title: 'Arrow Functions', duration: '20min' }] },
      { id: 'm2', title: 'Async Programming', lessons: [{ id: 'l2', title: 'Promises & Async/Await', duration: '25min' }] },
    ],
  },
  {
    id: 'course3',
    title: 'Data Science with Python',
    description: 'Explore data analysis, visualization, and machine learning.',
    category: 'Data Science',
    instructor: 'Dr. Data Insight',
    imageUrl: 'https://placehold.co/600x400.png?text=Data+Science',
    dataAiHint: 'python data',
    modules: [
      { id: 'm1', title: 'Python for Data', lessons: [{ id: 'l1', title: 'NumPy & Pandas', duration: '30min' }] },
      { id: 'm2', title: 'Machine Learning Basics', lessons: [{ id: 'l2', title: 'Intro to Scikit-learn', duration: '35min' }] },
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
  { id: 'video1', title: '🎬 Video 1: Quick HTML Tip', description: 'A short tip on HTML structure.' , thumbnailUrl: 'https://placehold.co/300x500.png?text=Video+1', dataAiHint: 'code snippet'},
  { id: 'video2', title: '🎬 Video 2: CSS Magic Trick', description: 'Cool CSS animation for your site.' , thumbnailUrl: 'https://placehold.co/300x500.png?text=Video+2', dataAiHint: 'ui design'},
  { id: 'video3', title: '🎬 Video 3: JavaScript Snippet', description: 'Useful JavaScript function in 60s.' , thumbnailUrl: 'https://placehold.co/300x500.png?text=Video+3', dataAiHint: 'developer coding'},
  { id: 'video4', title: '🎬 Video 4: Python Short', description: 'A quick Python data trick.' , thumbnailUrl: 'https://placehold.co/300x500.png?text=Video+4', dataAiHint: 'data visualization'},
  { id: 'video5', title: '🎬 Video 5: React Tip', description: 'Optimize your React components.' , thumbnailUrl: 'https://placehold.co/300x500.png?text=Video+5', dataAiHint: 'react logo'},
];
