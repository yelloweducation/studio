
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
  quizzes?: Quiz[]; // Added quizzes
};

export type User = {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'admin';
  passwordHash: string;
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
  videoUrl?: string;
  embedUrl?: string;
  dataAiHint?: string;
};

export type Category = {
  id: string;
  name: string;
  imageUrl?: string;
  dataAiHint?: string;
  icon?: string;
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
  submittedAt: string; // ISO date string
  reviewedAt?: string; // ISO date string
  adminNotes?: string;
};

export type PaymentSettings = {
  bankName?: string;
  accountNumber?: string;
  accountHolderName?: string;
  additionalInstructions?: string;
};

// New type for Learning Paths
export type LearningPath = {
  id: string;
  title: string;
  description: string;
  icon?: string; // Lucide icon name
  courseIds: string[];
  imageUrl?: string; // Optional image for the path itself
  dataAiHint?: string;
};

// New types for Flash Cards
export type FlashcardCategory = {
  id: string;
  name: string;
  description?: string;
  iconName?: keyof typeof import('lucide-react'); // Lucide icon name string
};

export type Flashcard = {
  id: string;
  categoryId: string;
  term: string;
  definition: string;
  example?: string;
  pronunciation?: string; // Optional pronunciation guide
};


export const courses: Course[] = [
  {
    id: 'course1',
    title: 'Introduction to Web Development',
    description: 'Learn the fundamentals of HTML, CSS, and JavaScript.',
    category: 'Web Development',
    instructor: 'Dr. Web Coder',
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: 'programming code',
    price: 0, // Free course
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
      },
       {
        id: 'm3c1',
        title: 'JavaScript Introduction',
        lessons: [
          { id: 'l1m3c1', title: 'What is JavaScript?', duration: '8min', description: 'Basic concepts of JavaScript and its role in web development.' },
          { id: 'l2m3c1', title: 'Variables and Data Types', duration: '12min', description: 'Understanding variables, constants, and basic data types in JS.'}
        ]
      }
    ],
    quizzes: [
      {
        id: 'quiz1c1',
        title: 'HTML & CSS Basics Check',
        quizType: 'practice',
        questions: [
          {
            id: 'q1quiz1c1',
            text: 'What does HTML stand for?',
            options: [
              { id: 'opt1q1', text: 'HyperText Markup Language' },
              { id: 'opt2q1', text: 'HighTech Modern Language' },
              { id: 'opt3q1', text: 'HyperTransfer Markup Language' },
            ],
            correctOptionId: 'opt1q1'
          },
          {
            id: 'q2quiz1c1',
            text: 'Which CSS property is used to change the text color of an element?',
            options: [
              { id: 'opt1q2', text: 'font-color' },
              { id: 'opt2q2', text: 'text-color' },
              { id: 'opt3q2', text: 'color' },
            ],
            correctOptionId: 'opt3q2'
          }
        ]
      }
    ]
  },
  {
    id: 'course2',
    title: 'Advanced JavaScript Techniques',
    description: 'Dive deep into modern JavaScript features and patterns.',
    category: 'JavaScript',
    instructor: 'Prof. Script Master',
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: 'abstract javascript',
    price: 49.99,
    currency: 'USD',
    isFeatured: false,
    learningObjectives: [
        'Master ES6+ features like arrow functions, destructuring, and template literals.',
        'Understand asynchronous JavaScript using Promises and async/await.',
        'Learn about JavaScript modules and their usage.',
        'Apply common JavaScript design patterns.'
    ],
    targetAudience: 'JavaScript developers with some existing knowledge looking to deepen their understanding.',
    prerequisites: ['Solid understanding of JavaScript fundamentals (variables, functions, loops, DOM manipulation).', 'Familiarity with HTML and CSS.'],
    estimatedTimeToComplete: 'Approx. 25-30 hours',
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
    quizzes: [
      {
        id: 'quiz1c2',
        title: 'ES6+ Knowledge Test',
        quizType: 'graded',
        passingScore: 70,
        questions: [
          {
            id: 'q1quiz1c2',
            text: 'What is the primary benefit of using arrow functions?',
            options: [
              { id: 'opt1q1c2', text: 'They have their own `this` binding.' },
              { id: 'opt2q1c2', text: 'Shorter syntax and lexical `this` binding.' },
              { id: 'opt3q1c2', text: 'They can be used as constructors.' },
            ],
            correctOptionId: 'opt2q1c2'
          }
        ]
      }
    ]
  },
  {
    id: 'course3',
    title: 'Data Science with Python',
    description: 'Explore data analysis, visualization, and machine learning.',
    category: 'Data Science',
    instructor: 'Dr. Data Insight',
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: 'python data',
    price: 99.00,
    currency: 'USD',
    isFeatured: true,
    learningObjectives: [
        'Use Python libraries like NumPy and Pandas for data manipulation.',
        'Create data visualizations using Matplotlib and Seaborn.',
        'Understand the basics of machine learning concepts.',
        'Build simple predictive models with Scikit-learn.'
    ],
    targetAudience: 'Aspiring data scientists or analysts, or developers looking to get into data science.',
    prerequisites: ['Basic Python programming knowledge is recommended.', 'Familiarity with basic statistics is helpful but not strictly required.'],
    estimatedTimeToComplete: 'Approx. 40-50 hours',
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
  {
    id: 'course4-no-lessons',
    title: 'Placeholder Course (No Content Yet)',
    description: 'This course is under development. Check back soon!',
    category: 'Future Skills',
    instructor: 'The Future',
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: 'coming soon abstract',
    isFeatured: false,
    modules: [],
  },
  {
    id: 'course5-empty-modules',
    title: 'Course With Empty Modules',
    description: 'Modules exist, but lessons are not yet populated.',
    category: 'Content Strategy',
    instructor: 'Curriculum Planner',
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: 'planning document',
    price: 19.99,
    currency: 'USD',
    isFeatured: false,
    modules: [
      { id: 'm1c5', title: 'Module A - Concepts', lessons: [] },
      { id: 'm2c5', title: 'Module B - Drafts', lessons: [] },
    ],
  },
];

export const users: User[] = [
  { id: 'user1', name: 'Student User', email: 'student@example.com', role: 'student', passwordHash: 'password123' },
  { id: 'user2', name: 'Admin User', email: 'admin@example.com', role: 'admin', passwordHash: 'adminpass' },
  { id: 'user3', name: 'Jane Doe', email: 'jane@example.com', role: 'student', passwordHash: 'password123' },
];

export const enrollments: Enrollment[] = [
  { id: 'enroll1', userId: 'user1', courseId: 'course1', progress: 50, enrolledDate: '2023-01-15' },
  { id: 'enroll2', userId: 'user1', courseId: 'course3', progress: 20, enrolledDate: '2023-02-01' },
  { id: 'enroll3', userId: 'user3', courseId: 'course2', progress: 75, enrolledDate: '2023-03-10' },
];

export const videos: Video[] = [
  { id: 'video1', title: '🎬 Quick HTML Tip', description: 'A short tip on HTML structure.' , thumbnailUrl: 'https://placehold.co/360x640.png', dataAiHint: 'code snippet', embedUrl: 'https://www.youtube.com/watch?v=kUMe1FH4CHE'},
  { id: 'video2', title: '🎬 CSS Magic Trick', description: 'Cool CSS animation for your site.' , thumbnailUrl: 'https://placehold.co/360x640.png', dataAiHint: 'ui design', embedUrl: 'https://www.tiktok.com/@tiktok/video/7216799937341246766'},
  { id: 'video3', title: '🎬 JavaScript Snippet', description: 'Useful JavaScript function in 60s.' , thumbnailUrl: 'https://placehold.co/360x640.png', dataAiHint: 'developer coding'},
  { id: 'video4', title: '🎬 Python Short', description: 'A quick Python data trick.' , thumbnailUrl: 'https://placehold.co/360x640.png', dataAiHint: 'data visualization'},
  { id: 'video5', title: '🎬 React Tip', description: 'Optimize your React components.' , thumbnailUrl: 'https://placehold.co/360x640.png', dataAiHint: 'react logo'},
];

export const categories: Category[] = [
  { id: 'cat1', name: 'Web Development', imageUrl: 'https://placehold.co/200x150.png', dataAiHint: 'coding web', icon: 'Globe' },
  { id: 'cat2', name: 'Data Science', imageUrl: 'https://placehold.co/200x150.png', dataAiHint: 'analytics charts', icon: 'DatabaseZap' },
  { id: 'cat3', name: 'JavaScript', imageUrl: 'https://placehold.co/200x150.png', dataAiHint: 'javascript logo', icon: 'Braces' },
  { id: 'cat4', name: 'Cloud Computing', imageUrl: 'https://placehold.co/200x150.png', dataAiHint: 'cloud network', icon: 'Cloud' },
  { id: 'cat5', name: 'AI & ML', imageUrl: 'https://placehold.co/200x150.png', dataAiHint: 'artificial intelligence', icon: 'BrainCircuit' },
];

export const paymentSubmissions: PaymentSubmission[] = [
  // Example:
  // {
  //   id: 'ps1',
  //   userId: 'user1',
  //   courseId: 'course2',
  //   amount: 49.99,
  //   currency: 'USD',
  //   screenshotUrl: 'https://placehold.co/300x200.png?text=Proof1',
  //   status: 'pending',
  //   submittedAt: new Date().toISOString(),
  // },
];

export const initialPaymentSettings: PaymentSettings = {
    bankName: '',
    accountNumber: '',
    accountHolderName: '',
    additionalInstructions: 'Please include your User ID or Course Name in the payment reference.',
};

// Initial Learning Paths Data
export const initialLearningPaths: LearningPath[] = [
  {
    id: 'lp1',
    title: 'Full-Stack Web Developer Path',
    description: 'Master front-end and back-end technologies to build complete web applications.',
    icon: 'Milestone',
    courseIds: ['course1', 'course2'], // Example: Links Intro Web Dev and Adv JS
    imageUrl: 'https://placehold.co/300x200.png',
    dataAiHint: 'web development'
  },
  {
    id: 'lp2',
    title: 'Data Analyst Fundamentals',
    description: 'Learn Python and essential data science tools to kickstart your analytics career.',
    icon: 'TrendingUp',
    courseIds: ['course3'], // Example: Links Data Science with Python
    imageUrl: 'https://placehold.co/300x200.png',
    dataAiHint: 'data analytics'
  },
];

// Flash Card Data
export const flashcardCategories: FlashcardCategory[] = [
  { id: 'fc_cat_english', name: 'English Vocabulary', description: 'Common and advanced English words.', iconName: 'SpellCheck' },
  { id: 'fc_cat_maths', name: 'Mathematical Concepts', description: 'Key terms and formulas in mathematics.', iconName: 'Sigma'},
  { id: 'fc_cat_marketing', name: 'Marketing Terms', description: 'Essential marketing jargon and concepts.', iconName: 'Megaphone' },
  { id: 'fc_cat_business', name: 'Business Acumen', description: 'Fundamental business terms and ideas.', iconName: 'Briefcase' },
  { id: 'fc_cat_it', name: 'IT & Programming', description: 'Core concepts in IT and programming.', iconName: 'Laptop' },
];

export const flashcards: Flashcard[] = [
  // Sample English Flashcards
  { id: 'fc_en_1', categoryId: 'fc_cat_english', term: 'Ephemeral', definition: 'Lasting for a very short time.', example: 'The beauty of the cherry blossoms is ephemeral.', pronunciation: '/ɪˈfem.ər.əl/' },
  { id: 'fc_en_2', categoryId: 'fc_cat_english', term: 'Ubiquitous', definition: 'Present, appearing, or found everywhere.', example: 'Smartphones have become ubiquitous in modern society.', pronunciation: '/juːˈbɪk.wɪ.təs/' },
  { id: 'fc_en_3', categoryId: 'fc_cat_english', term: 'Serendipity', definition: 'The occurrence and development of events by chance in a happy or beneficial way.', example: 'Discovering the old bookstore was pure serendipity.', pronunciation: '/ˌser.ənˈdɪp.ə.ti/' },
  { id: 'fc_en_4', categoryId: 'fc_cat_english', term: 'Alacrity', definition: 'Brisk and cheerful readiness.', example: 'She accepted the invitation with alacrity.', pronunciation: '/əˈlæk.rə.ti/' },
  { id: 'fc_en_5', categoryId: 'fc_cat_english', term: 'Mellifluous', definition: 'Pleasant and musical to hear.', example: 'The singer had a mellifluous voice.', pronunciation: '/məˈlɪf.lu.əs/' },
  // Sample IT Flashcards
  { id: 'fc_it_1', categoryId: 'fc_cat_it', term: 'API', definition: 'Application Programming Interface. A set of rules and protocols for building and interacting with software applications.', example: 'We used the Twitter API to fetch recent tweets.' },
  { id: 'fc_it_2', categoryId: 'fc_cat_it', term: 'Cloud Computing', definition: 'The delivery of computing services—including servers, storage, databases, networking, software, analytics, and intelligence—over the Internet ("the cloud").', example: 'AWS and Azure are major cloud computing providers.' },
  { id: 'fc_it_3', categoryId: 'fc_cat_it', term: 'Algorithm', definition: 'A process or set of rules to be followed in calculations or other problem-solving operations, especially by a computer.', example: 'Sorting algorithms are used to arrange data in a specific order.' },
  { id: 'fc_it_4', categoryId: 'fc_cat_it', term: 'Firewall', definition: 'A network security system that monitors and controls incoming and outgoing network traffic based on predetermined security rules.', example: 'The company firewall blocked access to certain websites.' },
  { id: 'fc_it_5', categoryId: 'fc_cat_it', term: 'SDK', definition: 'Software Development Kit. A collection of software development tools in one installable package.', example: 'The Android SDK provides tools to build Android applications.' },
];
// To add 1000 words per category, you would continue this pattern for each categoryId.
// Example for fc_cat_maths, fc_cat_marketing, fc_cat_business would follow.
// For brevity in this prototype, only English and IT have sample data.
// The system is designed to handle many more cards if populated.
