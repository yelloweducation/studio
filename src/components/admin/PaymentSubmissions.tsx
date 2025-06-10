
"use client";
import React, { useState, useEffect } from 'react';
import { paymentSubmissions as initialSubmissions, users as mockUsers, courses as mockCourses, type PaymentSubmission, type User, type Course, type PaymentSubmissionStatus } from '@/data/mockData';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreditCard, CheckCircle, XCircle, Hourglass, Edit, ExternalLink, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
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
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '../ui/input'; // Assuming Input is in ui folder

const USER_PAYMENT_SUBMISSIONS_KEY = 'adminPaymentSubmissions';

export default function PaymentSubmissions() {
  const [submissions, setSubmissions] = useState<PaymentSubmission[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>(mockUsers); // Assuming users don't change often for this mock
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const { toast } = useToast();

  const [editingSubmission, setEditingSubmission] = useState<PaymentSubmission | null>(null);
  const [adminNotes, setAdminNotes] = useState('');


  useEffect(() => {
    // Load courses (admin might have modified them)
    const storedCoursesString = localStorage.getItem('adminCourses');
    if (storedCoursesString) {
        try {
            const parsed = JSON.parse(storedCoursesString);
            setAllCourses(Array.isArray(parsed) ? parsed : mockCourses);
        } catch (e) { setAllCourses(mockCourses); }
    } else {
        setAllCourses(mockCourses);
    }

    // Load submissions
    const storedSubmissionsString = localStorage.getItem(USER_PAYMENT_SUBMISSIONS_KEY);
    if (storedSubmissionsString) {
      try {
        const parsedSubmissions = JSON.parse(storedSubmissionsString) as PaymentSubmission[];
        setSubmissions(parsedSubmissions);
      } catch (e) {
        console.error("Failed to parse payment submissions from localStorage", e);
        setSubmissions(initialSubmissions);
      }
    } else {
      setSubmissions(initialSubmissions);
    }
    setIsDataLoaded(true);
  }, []);

  useEffect(() => {
    if (isDataLoaded) {
      localStorage.setItem(USER_PAYMENT_SUBMISSIONS_KEY, JSON.stringify(submissions));
    }
  }, [submissions, isDataLoaded]);

  const getUserName = (userId: string) => allUsers.find(u => u.id === userId)?.name || 'Unknown User';
  const getCourseTitle = (courseId: string) => allCourses.find(c => c.id === courseId)?.title || 'Unknown Course';

  const handleUpdateStatus = (submissionId: string, newStatus: PaymentSubmissionStatus, notes?: string) => {
    setSubmissions(prev => prev.map(sub => 
      sub.id === submissionId 
        ? { ...sub, status: newStatus, reviewedAt: new Date().toISOString(), adminNotes: notes || sub.adminNotes } 
        : sub
    ));
    toast({ title: "Submission Updated", description: `Status changed to ${newStatus}.` });
    setEditingSubmission(null);
    setAdminNotes('');
  };
  
  const openEditModal = (submission: PaymentSubmission) => {
    setEditingSubmission(submission);
    setAdminNotes(submission.adminNotes || '');
  };


  const statusBadgeVariant = (status: PaymentSubmissionStatus) => {
    switch (status) {
      case 'approved': return 'default'; // Default is usually primary/success
      case 'pending': return 'secondary'; // Secondary is often neutral/pending
      case 'rejected': return 'destructive';
      default: return 'outline';
    }
  };
   const statusIcon = (status: PaymentSubmissionStatus) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending': return <Hourglass className="h-4 w-4 text-yellow-500" />;
      case 'rejected': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return null;
    }
  };


  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center text-xl md:text-2xl font-headline">
          <CreditCard className="mr-2 md:mr-3 h-6 w-6 md:h-7 md:w-7 text-primary" /> Payment Submissions
        </CardTitle>
        <CardDescription>Manage and review manual payment submissions from users.</CardDescription>
      </CardHeader>
      <CardContent>
        {submissions.length > 0 ? (
          <div className="relative w-full overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Screenshot</TableHead>
                  <TableHead>Submitted At</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {submissions.map((sub) => (
                  <TableRow key={sub.id}>
                    <TableCell className="font-medium">{getUserName(sub.userId)}</TableCell>
                    <TableCell>{getCourseTitle(sub.courseId)}</TableCell>
                    <TableCell className="text-right">{sub.amount.toFixed(2)} {sub.currency}</TableCell>
                    <TableCell>
                      <Button variant="link" size="sm" asChild className="p-0 h-auto">
                        <a href={sub.screenshotUrl} target="_blank" rel="noopener noreferrer">
                          View Proof <ExternalLink className="ml-1 h-3 w-3" />
                        </a>
                      </Button>
                    </TableCell>
                    <TableCell>{new Date(sub.submittedAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge variant={statusBadgeVariant(sub.status)} className="capitalize flex items-center gap-1 w-28 justify-center">
                        {statusIcon(sub.status)}
                        {sub.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                       <Button variant="outline" size="sm" onClick={() => openEditModal(sub)}>
                         <Edit className="mr-1 h-4 w-4" /> Review
                       </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-6">No payment submissions yet.</p>
        )}
      </CardContent>

       {editingSubmission && (
        <Dialog open={!!editingSubmission} onOpenChange={(isOpen) => !isOpen && setEditingSubmission(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Review Payment Submission</DialogTitle>
              <DialogDescription>
                Review details for {getCourseTitle(editingSubmission.courseId)} by {getUserName(editingSubmission.userId)}.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
                <p><strong>Amount:</strong> {editingSubmission.amount.toFixed(2)} {editingSubmission.currency}</p>
                <p><strong>Submitted:</strong> {new Date(editingSubmission.submittedAt).toLocaleString()}</p>
                <p>
                    <strong>Screenshot:</strong> 
                    <Button variant="link" asChild className="p-0 h-auto ml-1">
                        <a href={editingSubmission.screenshotUrl} target="_blank" rel="noopener noreferrer">
                        View Proof <ExternalLink className="ml-1 h-3 w-3" />
                        </a>
                    </Button>
                </p>
                 <div>
                    <Label htmlFor="adminNotes">Admin Notes</Label>
                    <Textarea 
                        id="adminNotes" 
                        value={adminNotes} 
                        onChange={(e) => setAdminNotes(e.target.value)}
                        placeholder="Optional notes for this submission..."
                        className="mt-1"
                    />
                </div>
                {editingSubmission.adminNotes && !adminNotes && (
                    <p className="text-xs text-muted-foreground">Previous notes: {editingSubmission.adminNotes}</p>
                )}

            </div>
            <DialogFooter className="sm:justify-between gap-2">
              <div className="flex gap-2">
                <Button 
                    variant="destructive" 
                    onClick={() => handleUpdateStatus(editingSubmission.id, 'rejected', adminNotes)}
                    disabled={editingSubmission.status === 'rejected'}
                >
                    <XCircle className="mr-2 h-4 w-4" /> Reject
                </Button>
                <Button 
                    variant="default" 
                    className="bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => handleUpdateStatus(editingSubmission.id, 'approved', adminNotes)}
                    disabled={editingSubmission.status === 'approved'}
                >
                     <CheckCircle className="mr-2 h-4 w-4" /> Approve
                </Button>
              </div>
               <DialogClose asChild>
                  <Button type="button" variant="outline">
                    Close
                  </Button>
                </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </Card>
  );
}
