
"use client";
import { useState, useEffect, type FormEvent, type ChangeEvent } from 'react';
import { courses as initialCourses, type Course, type Module, type Lesson } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Edit3, Trash2, ListOrdered, BookOpen, Film, FileText } from 'lucide-react'; // DollarSign, Milestone removed
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
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '../ui/label';

const CourseForm = ({
  course,
  onSubmit,
  onCancel
}: {
  course?: Course,
  onSubmit: (data: Course) => void,
  onCancel: () => void
}) => {
  const [title, setTitle] = useState(course?.title || '');
  const [description, setDescription] = useState(course?.description || '');
  const [category, setCategory] = useState(course?.category || '');
  const [instructor, setInstructor] = useState(course?.instructor || '');
  const [imageUrl, setImageUrl] = useState(course?.imageUrl || 'https://placehold.co/600x400.png');
  const [dataAiHint, setDataAiHint] = useState(course?.dataAiHint || 'education course');
  const [modules, setModules] = useState<Module[]>(course?.modules || []);
  // price and currency state removed

  const handleModuleChange = (index: number, field: keyof Module, value: string) => {
    const newModules = [...modules];
    newModules[index] = { ...newModules[index], [field]: value };
    setModules(newModules);
  };

  const addModule = () => {
    setModules([...modules, { id: `mod${Date.now()}`, title: '', lessons: [] }]);
  };

  const removeModule = (index: number) => {
    setModules(modules.filter((_, i) => i !== index));
  };

  const handleLessonChange = (moduleIndex: number, lessonIndex: number, field: keyof Lesson, value: string) => {
    const newModules = [...modules];
    const newLessons = [...newModules[moduleIndex].lessons];
    newLessons[lessonIndex] = { ...newLessons[lessonIndex], [field]: value };
    newModules[moduleIndex].lessons = newLessons;
    setModules(newModules);
  };

  const addLesson = (moduleIndex: number) => {
    const newModules = [...modules];
    newModules[moduleIndex].lessons.push({ id: `les${Date.now()}`, title: '', duration: '', description: '', embedUrl: '' });
    setModules(newModules);
  };

  const removeLesson = (moduleIndex: number, lessonIndex: number) => {
    const newModules = [...modules];
    newModules[moduleIndex].lessons = newModules[moduleIndex].lessons.filter((_, i) => i !== lessonIndex);
    setModules(newModules);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const courseData: Course = {
      id: course?.id || `course${Date.now()}`,
      title,
      description,
      category,
      instructor,
      modules,
      imageUrl,
      dataAiHint,
      // price and currency removed from submission
    };
    onSubmit(courseData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <ScrollArea className="h-[60vh] sm:h-[70vh] pr-4">
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input id="title" value={title} onChange={e => setTitle(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" value={description} onChange={e => setDescription(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="category">Category</Label>
            <Input id="category" value={category} onChange={e => setCategory(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="instructor">Instructor</Label>
            <Input id="instructor" value={instructor} onChange={e => setInstructor(e.target.value)} required />
          </div>
           <div>
            <Label htmlFor="imageUrl">Image URL</Label>
            <Input id="imageUrl" value={imageUrl} onChange={e => setImageUrl(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="dataAiHint">Image AI Hint (keywords)</Label>
            <Input id="dataAiHint" value={dataAiHint} onChange={e => setDataAiHint(e.target.value)} placeholder="e.g. education programming"/>
          </div>
          {/* Price and Currency inputs removed */}

          <div className="space-y-4 pt-4 border-t">
            <h3 className="text-lg font-semibold flex items-center"><BookOpen className="mr-2 h-5 w-5 text-primary"/> Modules</h3>
            {modules.map((module, modIndex) => (
              <Card key={module.id || modIndex} className="p-4 space-y-3 bg-muted/50">
                <div className="flex justify-between items-center">
                  <Input
                    placeholder={`Module ${modIndex + 1} Title`}
                    value={module.title}
                    onChange={e => handleModuleChange(modIndex, 'title', e.target.value)}
                    className="flex-grow mr-2"
                  />
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeModule(modIndex)} className="text-destructive hover:bg-destructive/10">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-3 pl-4 border-l-2 border-primary/50">
                   <h4 className="text-md font-medium flex items-center"><FileText className="mr-2 h-4 w-4 text-accent"/> Lessons</h4>
                  {module.lessons.map((lesson, lesIndex) => (
                    <Card key={lesson.id || lesIndex} className="p-3 space-y-2 bg-card shadow-sm">
                       <div className="flex justify-between items-center">
                        <Input
                            placeholder={`Lesson ${lesIndex + 1} Title`}
                            value={lesson.title}
                            onChange={e => handleLessonChange(modIndex, lesIndex, 'title', e.target.value)}
                            className="flex-grow mr-2 text-sm"
                        />
                        <Button type="button" variant="ghost" size="icon" onClick={() => removeLesson(modIndex, lesIndex)} className="text-destructive hover:bg-destructive/10">
                            <Trash2 className="h-4 w-4" />
                        </Button>
                       </div>
                      <Input
                        placeholder="Duration (e.g., 10min)"
                        value={lesson.duration}
                        onChange={e => handleLessonChange(modIndex, lesIndex, 'duration', e.target.value)}
                        className="text-sm"
                      />
                      <Textarea
                        placeholder="Lesson Description"
                        value={lesson.description || ''}
                        onChange={e => handleLessonChange(modIndex, lesIndex, 'description', e.target.value)}
                        className="text-sm min-h-[60px]"
                      />
                      <div className="relative">
                        <Input
                            placeholder="Video Embed URL (e.g., YouTube, Google Drive)"
                            value={lesson.embedUrl || ''}
                            onChange={e => handleLessonChange(modIndex, lesIndex, 'embedUrl', e.target.value)}
                            className="text-sm pl-8"
                        />
                        <Film className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      </div>
                    </Card>
                  ))}
                  <Button type="button" variant="outline" size="sm" onClick={() => addLesson(modIndex)} className="mt-2 hover:border-accent hover:text-accent">
                    <PlusCircle className="mr-2 h-4 w-4"/> Add Lesson to this Module
                  </Button>
                </div>
              </Card>
            ))}
            <Button type="button" variant="outline" onClick={addModule} className="w-full sm:w-auto hover:border-primary hover:text-primary">
              <PlusCircle className="mr-2 h-5 w-5" /> Add Module
            </Button>
          </div>
        </div>
      </ScrollArea>
      <DialogFooter className="pt-6 border-t">
        <DialogClose asChild>
          <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        </DialogClose>
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
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const storedCoursesString = localStorage.getItem('adminCourses');
    if (storedCoursesString) {
      try {
        const parsedCourses = JSON.parse(storedCoursesString) as Course[];
        setCourses(parsedCourses);
      } catch (e) {
        console.error("Failed to parse adminCourses from localStorage in CourseManagement", e);
        setCourses(initialCourses);
      }
    } else {
      setCourses(initialCourses);
    }
    setIsDataLoaded(true);
  }, []);

  useEffect(() => {
    if (isDataLoaded) {
      localStorage.setItem('adminCourses', JSON.stringify(courses));
    }
  }, [courses, isDataLoaded]);


  const handleAddCourse = (data: Course) => {
    const newCourseWithIds = {
      ...data,
      id: data.id || `course${Date.now()}`,
      modules: data.modules.map(m => ({
        ...m,
        id: m.id || `mod${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        lessons: m.lessons.map(l => ({
          ...l,
          id: l.id || `les${Date.now()}-${Math.random().toString(36).substr(2, 5)}`
        }))
      }))
    };
    setCourses(prev => [newCourseWithIds, ...prev]);
    setIsFormOpen(false);
    setEditingCourse(undefined);
    toast({ title: "Course Added", description: `${newCourseWithIds.title} has been successfully added.` });
  };

  const handleEditCourse = (data: Course) => {
     const updatedCourseWithIds = {
      ...data,
      modules: data.modules.map(m => ({
        ...m,
        id: m.id || `mod${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        lessons: m.lessons.map(l => ({
          ...l,
          id: l.id || `les${Date.now()}-${Math.random().toString(36).substr(2, 5)}`
        }))
      }))
    };
    setCourses(prev => prev.map(c => c.id === updatedCourseWithIds.id ? updatedCourseWithIds : c));
    setEditingCourse(undefined);
    setIsFormOpen(false);
    toast({ title: "Course Updated", description: `${updatedCourseWithIds.title} has been successfully updated.` });
  };

  const handleDeleteCourse = (courseId: string) => {
    const courseToDelete = courses.find(c => c.id === courseId);
    setCourses(prev => prev.filter(c => c.id !== courseId));
    toast({ title: "Course Deleted", description: `${courseToDelete?.title} has been deleted.`, variant: "destructive" });
  };

  const openForm = (course?: Course) => {
    setEditingCourse(course ? JSON.parse(JSON.stringify(course)) : undefined);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingCourse(undefined);
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center text-xl md:text-2xl font-headline">
          <ListOrdered className="mr-2 md:mr-3 h-6 w-6 md:h-7 md:w-7 text-primary" /> Course Management
        </CardTitle>
        <CardDescription>Add, edit, or delete courses and their content.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6 text-right">
          <Dialog open={isFormOpen} onOpenChange={(isOpen) => { if(!isOpen) closeForm(); else setIsFormOpen(true);}}>
            <DialogTrigger asChild>
              <Button onClick={() => openForm()} className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-md hover:shadow-sm active:translate-y-px transition-all duration-150 w-full sm:w-auto">
                <PlusCircle className="mr-2 h-5 w-5" /> Add New Course
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-3xl">
              <DialogHeader className="pb-4">
                <DialogTitle className="font-headline text-xl md:text-2xl">{editingCourse ? 'Edit Course' : 'Add New Course'}</DialogTitle>
                <DialogDescription>
                  {editingCourse ? 'Modify the details and content of the existing course.' : 'Fill in the details and content for the new course.'}
                </DialogDescription>
              </DialogHeader>
              <CourseForm
                course={editingCourse}
                onSubmit={editingCourse ? handleEditCourse : handleAddCourse}
                onCancel={closeForm}
              />
            </DialogContent>
          </Dialog>
        </div>

        {courses.length > 0 ? (
          <ul className="space-y-4">
            {courses.map(course => (
              <li key={course.id} className="p-3 sm:p-4 border rounded-lg bg-card flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center shadow-sm hover:shadow-md transition-shadow">
                <div className="flex-grow">
                  <h3 className="font-semibold font-headline text-md md:text-lg">{course.title}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">{course.category} - By {course.instructor}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">Modules: {course.modules.length}</p>
                  {/* Price display removed */}
                </div>
                <div className="flex flex-col sm:flex-row sm:space-x-2 gap-2 sm:gap-0 w-full sm:w-auto">
                  <Button variant="outline" size="sm" onClick={() => openForm(course)} className="w-full sm:w-auto hover:border-primary hover:text-primary">
                    <Edit3 className="mr-1 h-4 w-4" /> Edit
                  </Button>
                   <Dialog>
                    <DialogTrigger asChild>
                       <Button variant="destructive" size="sm" className="w-full sm:w-auto">
                        <Trash2 className="mr-1 h-4 w-4" /> Delete
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-xs">
                      <DialogHeader>
                        <DialogTitle>Confirm Deletion</DialogTitle>
                        <DialogDescription>
                          Are you sure you want to delete the course "{course.title}"? This action cannot be undone.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter className="pt-2">
                        <DialogClose asChild>
                          <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <DialogClose asChild>
                          <Button variant="destructive" onClick={() => handleDeleteCourse(course.id)}>Delete Course</Button>
                        </DialogClose>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
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
