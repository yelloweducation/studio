
'use server'; // This can remain as a server action, but will use mock data utilities

import { 
    getCoursesFromDb, 
    getCategoriesFromDb, 
    getLearningPathsFromDb,
    type Course, // Use mock data types
    type Category,
    type LearningPath
} from '@/lib/dbUtils'; // dbUtils now uses mock data

interface SearchPageData {
    courses: Course[];
    categories: Category[];
    learningPaths: LearningPath[];
}

export async function getSearchPageData(): Promise<SearchPageData> {
    try {
        // These functions will now return data from mockData.ts or localStorage
        const [courses, categories, learningPaths] = await Promise.all([
            getCoursesFromDb(),
            getCategoriesFromDb(),
            getLearningPathsFromDb()
        ]);
        return { courses, categories, learningPaths };
    } catch (error) {
        console.error("Error fetching search page data (mock data source):", error);
        // Fallback to empty arrays if something goes wrong with mock data retrieval
        return { courses: [], categories: [], learningPaths: [] };
    }
}
