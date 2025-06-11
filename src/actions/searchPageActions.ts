
'use server';

import { 
    getCoursesFromDb, 
    getCategoriesFromDb, 
    getLearningPathsFromDb,
    type Course,
    type Category,
    type LearningPath
} from '@/lib/dbUtils';

interface SearchPageData {
    courses: Course[];
    categories: Category[];
    learningPaths: LearningPath[];
}

export async function getSearchPageData(): Promise<SearchPageData> {
    try {
        const [courses, categories, learningPaths] = await Promise.all([
            getCoursesFromDb(),
            getCategoriesFromDb(),
            getLearningPathsFromDb()
        ]);
        return { courses, categories, learningPaths };
    } catch (error) {
        console.error("Error fetching search page data in server action:", error);
        // In a real app, you might want to return a more specific error structure
        // or throw the error to be caught by an error boundary if using one with server actions.
        // For now, returning empty arrays to prevent breaking the client too much on an error.
        return { courses: [], categories: [], learningPaths: [] };
    }
}
