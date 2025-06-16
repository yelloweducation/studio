
"use client";
import React, { useState, useEffect, type FormEvent } from 'react';
import { type Certificate, type User, type Course } from '@/lib/dbUtils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { PlusCircle, Trash2, Award, User as UserIcon, BookOpen, Loader2, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { serverGetCertificates, serverIssueCertificate, serverDeleteCertificate } from '@/actions/adminDataActions';
import { getAllUsersServerAction } from '@/actions/authActions'; 
import { serverGetCourses } from '@/actions/adminDataActions'; 

const IssueCertificateForm = ({
  users,
  courses,
  onSubmit,
  onCancel,
  isSubmitting,
}: {
  users: User[];
  courses: Course[];
  onSubmit: (data: { userId: string; courseId: string; certificateUrl?: string }) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}) => {
  const [userId, setUserId] = useState<string>('');
  const [courseId, setCourseId] = useState<string>('');
  const [certificateUrl, setCertificateUrl] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!userId || !courseId) {
      alert("User and Course must be selected.");
      return;
    }
    await onSubmit({ userId, courseId, certificateUrl: certificateUrl || undefined });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <ScrollArea className="h-[60vh] pr-3">
        <div className="space-y-4">
          <div>
            <Label htmlFor="userId">Select User</Label>
            <Select value={userId} onValueChange={setUserId} disabled={isSubmitting}>
              <SelectTrigger id="userId"><SelectValue placeholder="Select a user" /></SelectTrigger>
              <SelectContent>
                {users.map(user => (
                  <SelectItem key={user.id} value={user.id}>{user.name} ({user.email})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="courseId">Select Course</Label>
            <Select value={courseId} onValueChange={setCourseId} disabled={isSubmitting}>
              <SelectTrigger id="courseId"><SelectValue placeholder="Select a course" /></SelectTrigger>
              <SelectContent>
                {courses.map(course => (
                  <SelectItem key={course.id} value={course.id}>{course.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="certificateUrl">Certificate URL (Optional)</Label>
            <Input
              id="certificateUrl"
              value={certificateUrl}
              onChange={e => setCertificateUrl(e.target.value)}
              placeholder="e.g., https://example.com/certificate/123.pdf"
              disabled={isSubmitting}
            />
             <p className="text-xs text-muted-foreground mt-1">
              If you generate certificates externally, provide the link here. Otherwise, leave blank.
            </p>
          </div>
        </div>
      </ScrollArea>
      <DialogFooter className="pt-6 border-t">
        <DialogClose asChild><Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>Cancel</Button></DialogClose>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Issue Certificate
        </Button>
      </DialogFooter>
    </form>
  );
};


export default function CertificateManagement() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  
  const [isIssueFormOpen, setIsIssueFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      try {
        const [certs, dbUsers, dbCourses] = await Promise.all([
          serverGetCertificates(),
          getAllUsersServerAction(),
          serverGetCourses(),
        ]);
        setCertificates(certs);
        setUsers(dbUsers.map(u => ({...u, name: u.name ?? 'N/A'} as User)));
        setCourses(dbCourses);
      } catch (error) {
        console.error("Error loading data for Certificate Management:", error);
        toast({ variant: "destructive", title: "Load Error", description: (error as Error).message });
      }
      setIsLoading(false);
    };
    loadInitialData();
  }, [toast]);

  const handleIssueCertificate = async (data: { userId: string; courseId: string; certificateUrl?: string }) => {
    setIsSubmitting(true);
    try {
      const newCertificate = await serverIssueCertificate({
        userId: data.userId,
        courseId: data.courseId,
        certificateUrl: data.certificateUrl || null,
      });
      setCertificates(prev => [newCertificate, ...prev].sort((a,b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime()));
      setIsIssueFormOpen(false);
      toast({ title: "Certificate Issued", description: `Certificate issued for ${newCertificate.userName} for course ${newCertificate.courseTitle}.` });
    } catch (error: any) {
      console.error("Error issuing certificate:", error);
      toast({ variant: "destructive", title: "Issue Failed", description: error.message || "Could not issue certificate." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCertificate = async (certificateId: string) => {
    const certToDelete = certificates.find(c => c.id === certificateId);
    try {
      await serverDeleteCertificate(certificateId);
      setCertificates(prev => prev.filter(c => c.id !== certificateId));
      toast({ title: "Certificate Revoked", description: `Certificate for ${certToDelete?.userName} revoked.`, variant: "destructive" });
    } catch (error) {
      toast({ variant: "destructive", title: "Revoke Failed", description: (error as Error).message || "Could not revoke certificate." });
    }
  };

  if (isLoading) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-xl md:text-2xl font-headline"><Award className="mr-2 md:mr-3 h-6 w-6 md:h-7 md:w-7 text-primary" /> Certificate Management</CardTitle>
          <DialogDescription>Loading certificate data...</DialogDescription>
        </CardHeader>
        <CardContent className="py-10"><div className="flex justify-center items-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div></CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center text-xl md:text-2xl font-headline">
          <Award className="mr-2 md:mr-3 h-6 w-6 md:h-7 md:w-7 text-primary" /> Certificate Management
        </CardTitle>
        <DialogDescription>Issue, view, and revoke course completion certificates.</DialogDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6 text-right">
          <Dialog open={isIssueFormOpen} onOpenChange={setIsIssueFormOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setIsIssueFormOpen(true)} className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-md">
                <PlusCircle className="mr-2 h-5 w-5" /> Issue New Certificate
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader className="pb-4">
                <DialogTitle className="font-headline text-xl">Issue New Certificate</DialogTitle>
                <DialogDescription>Select a user and course to issue a certificate for.</DialogDescription>
              </DialogHeader>
              {isIssueFormOpen && (
                <IssueCertificateForm
                  users={users}
                  courses={courses}
                  onSubmit={handleIssueCertificate}
                  onCancel={() => setIsIssueFormOpen(false)}
                  isSubmitting={isSubmitting}
                />
              )}
            </DialogContent>
          </Dialog>
        </div>

        {certificates.length > 0 ? (
          <div className="relative w-full overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User Name</TableHead>
                  <TableHead>Course Title</TableHead>
                  <TableHead>Issue Date</TableHead>
                  <TableHead>Certificate URL</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {certificates.map(cert => (
                  <TableRow key={cert.id}>
                    <TableCell className="font-medium flex items-center">
                      <UserIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                      {cert.userName}
                    </TableCell>
                    <TableCell>
                      <BookOpen className="mr-2 h-4 w-4 text-muted-foreground inline-block" />
                      {cert.courseTitle}
                    </TableCell>
                    <TableCell>{new Date(cert.issueDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {cert.certificateUrl ? (
                        <a href={cert.certificateUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center text-sm">
                          View Certificate <ExternalLink className="ml-1 h-3 w-3"/>
                        </a>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">Not Provided</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="destructive" size="sm"><Trash2 className="mr-1 h-4 w-4" /> Revoke</Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-xs">
                          <DialogHeader>
                            <DialogTitle>Confirm Revoke</DialogTitle>
                            <DialogDescription>
                              Are you sure you want to revoke the certificate for "{cert.userName}" for the course "{cert.courseTitle}"? This action cannot be undone.
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter className="pt-2">
                            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                            <DialogClose asChild><Button variant="destructive" onClick={() => handleDeleteCertificate(cert.id)}>Revoke</Button></DialogClose>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-6">No certificates have been issued yet.</p>
        )}
      </CardContent>
    </Card>
  );
}
