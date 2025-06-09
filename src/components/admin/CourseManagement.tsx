
"use client";
import { useState, useEffect, type FormEvent } from 'react';
import { courses as initialCourses, type Course } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Edit3, Trash2, ListOrdered } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { useToast } from '@/hooks/use-toast';

// Simplified form for demo
const CourseForm = ({ course, onSubmit, onCancel }: { course?: Course, onSubmit: (data: Partial<Course>) => void, onCancel: () => void }) => {
  const [title, setTitle] = useState(course?.title || '');
  const [description, setDescription] = useState(course?.description || '');
  const [category, setCategory] = useState(course?.category || '');
  const [instructor, setInstructor] = useState(course?.instructor || '');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit({ id: course?.id || `course${Date.now()}`, title, description, category, instructor, modules: course?.modules || [] });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-foreground mb-1">Title</label>
        <Input id="title" value={title} onChange={e => setTitle(e.target.value)} required />
      </div>
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-foreground mb-1">Description</label>
        <Textarea id="description" value={description} onChange={e => setDescription(e.target.value)} required />
      </div>
      <div>
        <label htmlFor="category" className="block text-sm font-medium text-foreground mb-1">Category</label>
        <Input id="category" value={category} onChange={e => setCategory(e.target.value)} required />
      </div>
       <div>
        <label htmlFor="instructor" className="block text-sm font-medium text-foreground mb-1">Instructor</label>
        <Input id="instructor" value={instructor} onChange={e => setInstructor(e.target.value)} required />
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90">
          {course ? 'Save Changes' : 'Add Course'}
        </Button>
      </DialogFooter>
    </form>
  );
};


export default function CourseManagement() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [editingCourse, setEditingCourse] = useState<Course | undefined>(undefined);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setCourses(initialCourses); // Load initial mock data
  }, []);

  const handleAddCourse = (data: Partial<Course>) => {
    const newCourse = { ...data, id: `course${Date.now()}`, modules: [], imageUrl: 'https://placehold.co/600x400.png?text=New+Course' } as Course;
    setCourses(prev => [newCourse, ...prev]);
    setIsFormOpen(false);
    toast({ title: "Course Added", description: `${newCourse.title} has been successfully added.` });
  };

  const handleEditCourse = (data: Partial<Course>) => {
    setCourses(prev => prev.map(c => c.id === data.id ? { ...c, ...data } as Course : c));
    setEditingCourse(undefined);
    setIsFormOpen(false);
    toast({ title: "Course Updated", description: `${data.title} has been successfully updated.` });
  };

  const handleDeleteCourse = (courseId: string) => {
    const courseToDelete = courses.find(c => c.id === courseId);
    setCourses(prev => prev.filter(c => c.id !== courseId));
    toast({ title: "Course Deleted", description: `${courseToDelete?.title} has been deleted.`, variant: "destructive" });
  };
  
  const openForm = (course?: Course) => {
    setEditingCourse(course);
    setIsFormOpen(true);
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center text-2xl font-headline">
          <ListOrdered className="mr-3 h-7 w-7 text-primary" /> Course Management
        </CardTitle>
        <CardDescription>Add, edit, or delete courses in the system.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6 text-right">
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => openForm()} className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-md hover:shadow-sm active:translate-y-px transition-all duration-150">
                <PlusCircle className="mr-2 h-5 w-5" /> Add New Course
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle className="font-headline">{editingCourse ? 'Edit Course' : 'Add New Course'}</DialogTitle>
                <DialogDescription>
                  {editingCourse ? 'Modify the details of the existing course.' : 'Fill in the details for the new course.'}
                </DialogDescription>
              </DialogHeader>
              <CourseForm 
                course={editingCourse} 
                onSubmit={editingCourse ? handleEditCourse : handleAddCourse}
                onCancel={() => { setIsFormOpen(false); setEditingCourse(undefined); }}
              />
            </DialogContent>
          </Dialog>
        </div>

        {courses.length > 0 ? (
          <ul className="space-y-4">
            {courses.map(course => (
              <li key={course.id} className="p-4 border rounded-lg bg-card flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center shadow-sm">
                <div className="flex-grow">
                  <h3 className="font-semibold font-headline text-lg">{course.title}</h3>
                  <p className="text-sm text-muted-foreground">{course.category} - By {course.instructor}</p>
                </div>
                <div className="flex flex-col sm:flex-row sm:space-x-2 gap-2 sm:gap-0 w-full sm:w-auto">
                  <Button variant="outline" size="sm" onClick={() => openForm(course)} className="w-full sm:w-auto hover:border-primary hover:text-primary">
                    <Edit3 className="mr-1 h-4 w-4" /> Edit
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDeleteCourse(course.id)} className="w-full sm:w-auto">
                    <Trash2 className="mr-1 h-4 w-4" /> Delete
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-muted-foreground py-4">No courses available. Add some!</p>
        )}
      </CardContent>
    </Card>
  );
}
