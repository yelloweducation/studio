
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
  { id: 'fc_cat_it', name: 'IT & Programming', description: 'Core concepts in IT and programming.', iconName: 'Laptop' },
  { id: 'fc_cat_business', name: 'Business Acumen', description: 'Fundamental business terms and ideas.', iconName: 'Briefcase' },
  { id: 'fc_cat_digital_marketing', name: 'Digital Marketing', description: 'Key terms in online marketing.', iconName: 'Megaphone' },
];

export const flashcards: Flashcard[] = [
  // English Vocabulary (Expanded)
  { id: 'fc_en_1', categoryId: 'fc_cat_english', term: 'Ephemeral', definition: 'Lasting for a very short time.', example: 'The beauty of the cherry blossoms is ephemeral.', pronunciation: '/ɪˈfem.ər.əl/' },
  { id: 'fc_en_2', categoryId: 'fc_cat_english', term: 'Ubiquitous', definition: 'Present, appearing, or found everywhere.', example: 'Smartphones have become ubiquitous in modern society.', pronunciation: '/juːˈbɪk.wɪ.təs/' },
  { id: 'fc_en_3', categoryId: 'fc_cat_english', term: 'Serendipity', definition: 'The occurrence and development of events by chance in a happy or beneficial way.', example: 'Discovering the old bookstore was pure serendipity.', pronunciation: '/ˌser.ənˈdɪp.ə.ti/' },
  { id: 'fc_en_4', categoryId: 'fc_cat_english', term: 'Alacrity', definition: 'Brisk and cheerful readiness.', example: 'She accepted the invitation with alacrity.', pronunciation: '/əˈlæk.rə.ti/' },
  { id: 'fc_en_5', categoryId: 'fc_cat_english', term: 'Mellifluous', definition: 'Pleasant and musical to hear.', example: 'The singer had a mellifluous voice.', pronunciation: '/məˈlɪf.lu.əs/' },
  { id: 'fc_en_6', categoryId: 'fc_cat_english', term: 'Esoteric', definition: 'Intended for or likely to be understood by only a small number of people with a specialized knowledge or interest.', example: "The professor's lecture was full of esoteric references to ancient philosophy.", pronunciation: '/ˌes.əˈter.ɪk/' },
  { id: 'fc_en_7', categoryId: 'fc_cat_english', term: 'Juxtapose', definition: 'Place or deal with close together for contrasting effect.', example: "The exhibition juxtaposes contemporary art with classical masterpieces.", pronunciation: '/ˈdʒʌk.stə.poʊz/' },
  { id: 'fc_en_8', categoryId: 'fc_cat_english', term: 'Quintessential', definition: 'Representing the most perfect or typical example of a quality or class.', example: "He was the quintessential tough guy—strong, silent, and self-contained.", pronunciation: '/ˌkwɪn.tɪˈsen.ʃəl/' },
  { id: 'fc_en_9', categoryId: 'fc_cat_english', term: 'Surreptitious', definition: 'Kept secret, especially because it would not be approved of.', example: "She had a surreptitious look at her watch.", pronunciation: '/ˌsʌr.əpˈtɪʃ.əs/' },
  { id: 'fc_en_10', categoryId: 'fc_cat_english', term: 'Verbose', definition: 'Using or expressed in more words than are needed.', example: "His verbose explanation was difficult to follow.", pronunciation: '/vɜːrˈboʊs/' },
  { id: 'fc_en_11', categoryId: 'fc_cat_english', term: 'Anachronism', definition: 'A thing belonging or appropriate to a period other than that in which it exists, especially a thing that is conspicuously old-fashioned.', example: "The sword in the modern-day film was an anachronism.", pronunciation: '/əˈnæk.rə.nɪ.zəm/' },
  { id: 'fc_en_12', categoryId: 'fc_cat_english', term: 'Benevolent', definition: 'Well meaning and kindly.', example: "A benevolent smile.", pronunciation: '/bəˈnev.əl.ənt/' },

  // IT & Programming (Expanded)
  { id: 'fc_it_1', categoryId: 'fc_cat_it', term: 'API', definition: 'Application Programming Interface. A set of rules and protocols for building and interacting with software applications.', example: 'We used the Twitter API to fetch recent tweets.' },
  { id: 'fc_it_2', categoryId: 'fc_cat_it', term: 'Cloud Computing', definition: 'The delivery of computing services—including servers, storage, databases, networking, software, analytics, and intelligence—over the Internet ("the cloud").', example: 'AWS and Azure are major cloud computing providers.' },
  { id: 'fc_it_3', categoryId: 'fc_cat_it', term: 'Algorithm', definition: 'A process or set of rules to be followed in calculations or other problem-solving operations, especially by a computer.', example: 'Sorting algorithms are used to arrange data in a specific order.' },
  { id: 'fc_it_4', categoryId: 'fc_cat_it', term: 'Firewall', definition: 'A network security system that monitors and controls incoming and outgoing network traffic based on predetermined security rules.', example: 'The company firewall blocked access to certain websites.' },
  { id: 'fc_it_5', categoryId: 'fc_cat_it', term: 'SDK', definition: 'Software Development Kit. A collection of software development tools in one installable package.', example: 'The Android SDK provides tools to build Android applications.' },
  { id: 'fc_it_6', categoryId: 'fc_cat_it', term: 'Debugging', definition: 'The process of finding and resolving defects or problems within a computer program.', example: "Debugging the code took several hours." },
  { id: 'fc_it_7', categoryId: 'fc_cat_it', term: 'Compiler', definition: 'A program that converts instructions into a machine-code or lower-level form so that they can be read and executed by a computer.', example: "The C++ code was processed by the compiler." },
  { id: 'fc_it_8', categoryId: 'fc_cat_it', term: 'Interpreter', definition: 'A program that directly executes instructions written in a programming or scripting language, without previously compiling them into machine code.', example: "Python often uses an interpreter." },
  { id: 'fc_it_9', categoryId: 'fc_cat_it', term: 'API Gateway', definition: 'A management tool that sits in front of an API or group of APIs and acts as a single point of entry for all clients.', example: "The API Gateway handles request routing and authentication." },
  { id: 'fc_it_10', categoryId: 'fc_cat_it', term: 'Load Balancer', definition: 'A device that distributes network or application traffic across a number of servers.', example: "Load balancers are used to increase capacity and reliability of applications." },
  { id: 'fc_it_11', categoryId: 'fc_cat_it', term: 'DevOps', definition: 'A set of practices that combines software development (Dev) and IT operations (Ops).', example: "DevOps aims to shorten the systems development life cycle." },
  { id: 'fc_it_12', categoryId: 'fc_cat_it', term: 'Version Control', definition: 'A system that records changes to a file or set of files over time so that you can recall specific versions later.', example: "Git is a popular version control system." },

  // Business Acumen (Expanded)
  { id: 'fc_biz_1', categoryId: 'fc_cat_business', term: 'ROI', definition: 'Return on Investment. A performance measure used to evaluate the efficiency of an investment.', example: 'The marketing campaign had a high ROI.' },
  { id: 'fc_biz_2', categoryId: 'fc_cat_business', term: 'B2B', definition: 'Business-to-Business. Transactions or business conducted between companies, rather than between a company and individual consumers.', example: 'Their primary sales model is B2B.' },
  { id: 'fc_biz_3', categoryId: 'fc_cat_business', term: 'KPI', definition: 'Key Performance Indicator. A measurable value that demonstrates how effectively a company is achieving key business objectives.', example: 'Customer satisfaction is a key KPI for our support team.' },
  { id: 'fc_biz_4', categoryId: 'fc_cat_business', term: 'B2C', definition: 'Business-to-Consumer. Transactions or business conducted between a company and individual consumers.', example: "Amazon's primary model is B2C." },
  { id: 'fc_biz_5', categoryId: 'fc_cat_business', term: 'SWOT Analysis', definition: 'A strategic planning technique used to help an organization identify strengths, weaknesses, opportunities, and threats.', example: "We conducted a SWOT analysis before launching the new product." },
  { id: 'fc_biz_6', categoryId: 'fc_cat_business', term: 'Venture Capital', definition: 'Financing that investors provide to startup companies and small businesses that are believed to have long-term growth potential.', example: "The startup secured venture capital funding." },
  { id: 'fc_biz_7', categoryId: 'fc_cat_business', term: 'Stakeholder', definition: 'Any group or individual who can affect or is affected by the achievement of the organization\'s objectives.', example: "Employees, customers, and investors are all stakeholders." },
  { id: 'fc_biz_8', categoryId: 'fc_cat_business', term: 'Overhead', definition: 'Ongoing business expenses not directly attributed to creating a product or service.', example: "Rent and utilities are part of the company's overhead." },
  { id: 'fc_biz_9', categoryId: 'fc_cat_business', term: 'Supply Chain', definition: 'The sequence of processes involved in the production and distribution of a commodity.', example: "Disruptions in the supply chain can affect product availability." },
  { id: 'fc_biz_10', categoryId: 'fc_cat_business', term: 'Market Share', definition: 'The portion of a market controlled by a particular company or product.', example: "They aim to increase their market share in the coming year." },
  { id: 'fc_biz_11', categoryId: 'fc_cat_business', term: 'Due Diligence', definition: 'Reasonable steps taken by a person in order to satisfy a legal requirement, especially in buying or selling something.', example: "The investors performed due diligence before acquiring the company." },
  { id: 'fc_biz_12', categoryId: 'fc_cat_business', term: 'Equity', definition: 'The value of the shares issued by a company.', example: "Founders often retain a significant amount of equity in their startups." },

  // Digital Marketing (Expanded)
  { id: 'fc_dm_1', categoryId: 'fc_cat_digital_marketing', term: 'SEO', definition: 'Search Engine Optimization. The process of improving the quality and quantity of website traffic to a website or a web page from search engines.', example: 'Good SEO is crucial for organic growth.' },
  { id: 'fc_dm_2', categoryId: 'fc_cat_digital_marketing', term: 'CTR', definition: 'Click-Through Rate. The ratio of users who click on a specific link to the number of total users who view a page, email, or advertisement.', example: 'The ad campaign had a low CTR.' },
  { id: 'fc_dm_3', categoryId: 'fc_cat_digital_marketing', term: 'PPC', definition: 'Pay-Per-Click. An internet advertising model used to drive traffic to websites, in which an advertiser pays a publisher when the ad is clicked.', example: 'They invested heavily in PPC advertising.' },
  { id: 'fc_dm_4', categoryId: 'fc_cat_digital_marketing', term: 'Content Marketing', definition: 'A marketing strategy focused on creating and distributing valuable, relevant, and consistent content to attract and retain a clearly defined audience.', example: "Blogging is a common form of content marketing." },
  { id: 'fc_dm_5', categoryId: 'fc_cat_digital_marketing', term: 'A/B Testing', definition: 'A method of comparing two versions of a webpage or app against each other to determine which one performs better.', example: "We're A/B testing two different call-to-action buttons." },
  { id: 'fc_dm_6', categoryId: 'fc_cat_digital_marketing', term: 'Conversion Rate', definition: 'The percentage of users who take a desired action (e.g., making a purchase, signing up for a newsletter).', example: "Improving the landing page design increased the conversion rate." },
  { id: 'fc_dm_7', categoryId: 'fc_cat_digital_marketing', term: 'SERP', definition: 'Search Engine Results Page. The page displayed by a search engine in response to a query by a searcher.', example: "Our goal is to rank on the first SERP for relevant keywords." },
  { id: 'fc_dm_8', categoryId: 'fc_cat_digital_marketing', term: 'Backlink', definition: 'An incoming hyperlink from one web page to another website.', example: "High-quality backlinks can improve SEO." },
  { id: 'fc_dm_9', categoryId: 'fc_cat_digital_marketing', term: 'Affiliate Marketing', definition: 'A marketing arrangement by which an online retailer pays commission to an external website for traffic or sales generated from its referrals.', example: "She earns income through affiliate marketing on her blog." },
  { id: 'fc_dm_10', categoryId: 'fc_cat_digital_marketing', term: 'Email Automation', definition: 'The process of sending targeted, triggered emails to subscribers at specific times or after specific actions.', example: "Welcome emails are part of our email automation strategy." },
  { id: 'fc_dm_11', categoryId: 'fc_cat_digital_marketing', term: 'Funnel (Marketing)', definition: 'A visual representation of the customer journey, from initial awareness to conversion or purchase.', example: "We're optimizing each stage of our marketing funnel." },
  { id: 'fc_dm_12', categoryId: 'fc_cat_digital_marketing', term: 'Influencer', definition: 'An individual who has the power to affect purchase decisions of others because of their authority, knowledge, position, or relationship with their audience.', example: "Partnering with an influencer can expand brand reach." },
];
// To add 1000 words per category, you would continue this pattern for each categoryId.
// The system is designed to handle many more cards if populated.


    