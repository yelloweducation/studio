
"use client";
import { useState, useEffect, type FormEvent } from 'react';
import Image from 'next/image';
import type { Category } from '@/lib/dbUtils'; // Updated import path for type
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Edit3, Trash2, Shapes, Image as ImageIcon, Tag, Info, Loader2 } from 'lucide-react';
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
import * as LucideIcons from 'lucide-react';
import { 
  getCategoriesFromDb, 
  addCategoryToDb, 
  updateCategoryInDb, 
  deleteCategoryFromDb 
} from '@/lib/dbUtils'; // Updated import path for functions

const isValidLucideIcon = (iconName: string | undefined): iconName is keyof typeof LucideIcons => {
  return typeof iconName === 'string' && iconName in LucideIcons;
};

const CategoryForm = ({
  category,
  onSubmit,
  onCancel,
  isSubmitting
}: {
  category?: Category,
  onSubmit: (data: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>,
  onCancel: () => void,
  isSubmitting: boolean
}) => {
  const [name, setName] = useState(category?.name || '');
  const [imageUrl, setImageUrl] = useState(category?.imageUrl || 'https://placehold.co/200x150.png');
  const [dataAiHint, setDataAiHint] = useState(category?.dataAiHint || 'category default');
  const [iconName, setIconName] = useState(category?.iconName || 'Shapes');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const categoryData: Omit<Category, 'id' | 'createdAt' | 'updatedAt'> = {
      name,
      imageUrl: imageUrl || null, // Ensure null if empty
      dataAiHint: dataAiHint || null,
      iconName: iconName || null,
    };
    await onSubmit(categoryData);
  };

  const IconComponent = isValidLucideIcon(iconName || undefined) ? LucideIcons[iconName as keyof typeof LucideIcons] as React.ElementType : LucideIcons.Shapes;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <ScrollArea className="h-[60vh] sm:h-[70vh] pr-4">
        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1">Category Name</label>
            <div className="relative">
              <Input id="name" value={name} onChange={e => setName(e.target.value)} required className="pl-8" disabled={isSubmitting} />
              <Tag className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
          </div>
          <div>
            <label htmlFor="imageUrl" className="block text-sm font-medium text-foreground mb-1">Image URL</label>
            <div className="relative">
              <Input id="imageUrl" value={imageUrl || ''} onChange={e => setImageUrl(e.target.value)} className="pl-8" disabled={isSubmitting}/>
              <ImageIcon className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
            {imageUrl && (
              <div className="mt-2 relative w-32 aspect-[4/3] border rounded overflow-hidden bg-muted">
                <Image src={imageUrl} alt="Image preview" layout="fill" objectFit="cover" key={imageUrl}/>
              </div>
            )}
          </div>
          <div>
            <label htmlFor="dataAiHint" className="block text-sm font-medium text-foreground mb-1">Image AI Hint</label>
             <div className="relative">
                <Input id="dataAiHint" value={dataAiHint || ''} onChange={e => setDataAiHint(e.target.value)} placeholder="e.g. technology learning" className="pl-8" disabled={isSubmitting}/>
                <Info className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
          </div>
          <div>
            <label htmlFor="iconName" className="block text-sm font-medium text-foreground mb-1">Lucide Icon Name</label>
             <div className="relative">
                <Input id="iconName" value={iconName || ''} onChange={e => setIconName(e.target.value)} placeholder="e.g. Globe, BrainCircuit" className="pl-8" disabled={isSubmitting}/>
                 <IconComponent className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
             </div>
            <p className="text-xs text-muted-foreground mt-1">Enter a valid Lucide icon name (e.g., Globe, Code, BarChart). See Lucide React docs for options. Defaults to 'Shapes' if invalid.</p>
          </div>
        </div>
      </ScrollArea>
      <DialogFooter className="pt-6 border-t">
        <DialogClose asChild>
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>Cancel</Button>
        </DialogClose>
        <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {category ? 'Save Changes' : 'Add Category'}
        </Button>
      </DialogFooter>
    </form>
  );
};

export default function CategoryManagement() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingCategory, setEditingCategory] = useState<Category | undefined>(undefined);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const loadCategories = async () => {
      setIsLoadingData(true);
      const dbCategories = await getCategoriesFromDb();
      setCategories(dbCategories);
      setIsLoadingData(false);
    };
    loadCategories();
  }, []);

  const handleAddCategory = async (data: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) => {
    setIsSubmittingForm(true);
    try {
      const newCategory = await addCategoryToDb(data);
      setCategories(prev => [newCategory, ...prev].sort((a, b) => a.name.localeCompare(b.name)));
      closeForm();
      toast({ title: "Category Added", description: `${data.name} has been successfully added.` });
    } catch (error) {
      toast({ title: "Error Adding Category", description: "Could not add category. Please try again.", variant: "destructive" });
    } finally {
      setIsSubmittingForm(false);
    }
  };

  const handleEditCategory = async (data: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!editingCategory || !editingCategory.id) return;
    setIsSubmittingForm(true);
    try {
      const updatedCategory = await updateCategoryInDb(editingCategory.id, data);
      setCategories(prev => prev.map(c => c.id === updatedCategory.id ? updatedCategory : c).sort((a,b) => a.name.localeCompare(b.name)));
      closeForm();
      toast({ title: "Category Updated", description: `${data.name} has been successfully updated.` });
    } catch (error) {
      toast({ title: "Error Updating Category", description: "Could not update category. Please try again.", variant: "destructive" });
    } finally {
      setIsSubmittingForm(false);
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    const categoryToDelete = categories.find(c => c.id === categoryId);
    try {
      await deleteCategoryFromDb(categoryId);
      setCategories(prev => prev.filter(c => c.id !== categoryId));
      toast({ title: "Category Deleted", description: `${categoryToDelete?.name} has been deleted.`, variant: "destructive" });
    } catch (error) {
      toast({ title: "Error Deleting Category", description: "Could not delete category. Please try again.", variant: "destructive" });
    }
  };

  const openForm = (category?: Category) => {
    setEditingCategory(category ? JSON.parse(JSON.stringify(category)) : undefined);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingCategory(undefined);
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center text-xl md:text-2xl font-headline">
          <Shapes className="mr-2 md:mr-3 h-6 w-6 md:h-7 md:w-7 text-primary" /> Category Management
        </CardTitle>
        <CardDescription>Add, edit, or delete course categories. Data is stored in your Postgres database via Prisma.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6 text-right">
          <Dialog open={isFormOpen} onOpenChange={(isOpen) => { if(!isOpen) closeForm(); else setIsFormOpen(true);}}>
            <DialogTrigger asChild>
              <Button onClick={() => openForm()} className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-md hover:shadow-sm active:translate-y-px transition-all duration-150 w-full sm:w-auto">
                <PlusCircle className="mr-2 h-5 w-5" /> Add New Category
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader className="pb-4">
                <DialogTitle className="font-headline text-xl md:text-2xl">{editingCategory ? 'Edit Category' : 'Add New Category'}</DialogTitle>
                <DialogDescription>
                  {editingCategory ? 'Modify the details of the existing category.' : 'Fill in the details for the new category.'}
                </DialogDescription>
              </DialogHeader>
              <CategoryForm
                category={editingCategory}
                onSubmit={editingCategory ? handleEditCategory : handleAddCategory}
                onCancel={closeForm}
                isSubmitting={isSubmittingForm}
              />
            </DialogContent>
          </Dialog>
        </div>

        {isLoadingData ? (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-2 text-muted-foreground">Loading categories...</p>
          </div>
        ) : categories.length > 0 ? (
          <ul className="space-y-4">
            {categories.map(category => {
              const IconComponent = isValidLucideIcon(category.iconName || undefined) ? LucideIcons[category.iconName as keyof typeof LucideIcons] as React.ElementType : LucideIcons.Shapes;
              return (
              <li key={category.id} className="p-3 sm:p-4 border rounded-lg bg-card flex flex-col gap-3 sm:flex-row sm:items-center shadow-sm hover:shadow-md transition-shadow">
                {category.imageUrl && (
                  <div className="relative w-16 h-12 sm:w-20 sm:h-16 border rounded overflow-hidden shrink-0 bg-muted">
                    <Image src={category.imageUrl} alt={category.name} layout="fill" objectFit="cover" data-ai-hint={category.dataAiHint || 'category image'}/>
                  </div>
                )}
                <div className="flex-grow sm:ml-4">
                  <h3 className="font-semibold font-headline text-md md:text-lg flex items-center">
                   <IconComponent className="mr-2 h-5 w-5 text-accent shrink-0" />
                    {category.name}
                  </h3>
                  <p className="text-xs text-muted-foreground">Icon: {category.iconName || 'Shapes'}</p>
                </div>
                <div className="flex flex-col sm:flex-row sm:space-x-2 gap-2 sm:gap-0 w-full sm:w-auto sm:items-center mt-2 sm:mt-0 shrink-0">
                  <Button variant="outline" size="sm" onClick={() => openForm(category)} className="w-full sm:w-auto hover:border-primary hover:text-primary">
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
                          Are you sure you want to delete the category "{category.name}"? This action cannot be undone and might affect courses linked to it.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter className="pt-2">
                        <DialogClose asChild>
                          <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <DialogClose asChild>
                          <Button variant="destructive" onClick={() => handleDeleteCategory(category.id)}>Delete Category</Button>
                        </DialogClose>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-center text-muted-foreground py-4">No categories found in the database. Add some!</p>
        )}
      </CardContent>
    </Card>
  );
}
