
"use client";
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { type PaymentSubmission, type User, type Course, type PaymentSubmissionStatus } from '@/lib/dbUtils'; 
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreditCard, CheckCircle, XCircle, Hourglass, Eye, ExternalLink, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { serverGetAllPaymentSubmissions, serverUpdatePaymentSubmissionStatus } from '@/actions/adminDataActions';

export default function PaymentSubmissions() {
  const [submissions, setSubmissions] = useState<PaymentSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const [editingSubmission, setEditingSubmission] = useState<PaymentSubmission | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const submissionsFromDb = await serverGetAllPaymentSubmissions();
        setSubmissions(submissionsFromDb);
      } catch (error) {
        console.error("Failed to load data for payment submissions:", error);
        toast({ variant: "destructive", title: "Error", description: "Failed to load payment submission data." });
      }
      setIsLoading(false);
    };
    loadData();
  }, [toast]);

  const getUserName = (submission: PaymentSubmission) => submission.user?.name || 'Unknown User';
  const getCourseTitle = (submission: PaymentSubmission) => submission.course?.title || 'Unknown Course';

  const handleUpdateStatus = async (submissionId: string, newStatus: PaymentSubmissionStatus, notes?: string | null) => {
    setIsUpdating(true);
    try {
      const updatedSubmission = await serverUpdatePaymentSubmissionStatus(submissionId, newStatus, notes);
      setSubmissions(prev => prev.map(sub => 
        sub.id === submissionId 
          ? updatedSubmission
          : sub
      ));
      toast({ title: "Submission Updated", description: `Status changed to ${newStatus}.` });
      setEditingSubmission(null);
      setAdminNotes('');
    } catch (error) {
      toast({ variant: "destructive", title: "Update Failed", description: (error as Error).message || "Could not update submission status." });
    } finally {
      setIsUpdating(false);
    }
  };
  
  const openEditModal = (submission: PaymentSubmission) => {
    setEditingSubmission(submission);
    setAdminNotes(submission.adminNotes || '');
  };

  const statusBadgeVariant = (status: PaymentSubmissionStatus | null) => {
    switch (status) {
      case 'APPROVED': return 'default'; 
      case 'PENDING': return 'secondary'; 
      case 'REJECTED': return 'destructive';
      default: return 'outline';
    }
  };
   const statusIcon = (status: PaymentSubmissionStatus | null) => {
    switch (status) {
      case 'APPROVED': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'PENDING': return <Hourglass className="h-4 w-4 text-yellow-500" />;
      case 'REJECTED': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return null;
    }
  };

  if (isLoading) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
           <CardTitle className="flex items-center text-xl md:text-2xl font-headline">
            <CreditCard className="mr-2 md:mr-3 h-6 w-6 md:h-7 md:w-7 text-primary" /> Payment Submissions
          </CardTitle>
          <CardDescription>Loading payment submissions from your database...</CardDescription>
        </CardHeader>
        <CardContent className="py-10">
          <div className="flex justify-center items-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center text-xl md:text-2xl font-headline">
          <CreditCard className="mr-2 md:mr-3 h-6 w-6 md:h-7 md:w-7 text-primary" /> Payment Submissions
        </CardTitle>
        <CardDescription>Manage and review manual payment submissions from users (data from Neon/Postgres via Prisma).</CardDescription>
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
                  <TableHead>Submitted At</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {submissions.map((sub) => (
                  <TableRow key={sub.id}>
                    <TableCell className="font-medium">{getUserName(sub)}</TableCell>
                    <TableCell>{getCourseTitle(sub)}</TableCell>
                    <TableCell className="text-right">{sub.amount.toFixed(2)} {sub.currency}</TableCell>
                    <TableCell>{sub.submittedAt ? new Date(sub.submittedAt).toLocaleDateString() : 'N/A'}</TableCell>
                    <TableCell>
                      <Badge variant={statusBadgeVariant(sub.status)} className="capitalize flex items-center gap-1 w-28 justify-center">
                        {statusIcon(sub.status)}
                        {sub.status?.toLowerCase() || 'unknown'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                       <Button variant="outline" size="sm" onClick={() => openEditModal(sub)} disabled={isUpdating}>
                         <Eye className="mr-1 h-4 w-4" /> Review
                       </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-6">No payment submissions found.</p>
        )}
      </CardContent>

       {editingSubmission && (
        <Dialog open={!!editingSubmission} onOpenChange={(isOpen) => !isOpen && setEditingSubmission(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Review Payment Submission</DialogTitle>
              <DialogDescription>
                Review details for {getCourseTitle(editingSubmission)} by {getUserName(editingSubmission)}.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2 max-h-[60vh] overflow-y-auto pr-2">
                <p><strong>Amount:</strong> {editingSubmission.amount.toFixed(2)} {editingSubmission.currency}</p>
                <p><strong>Submitted:</strong> {editingSubmission.submittedAt ? new Date(editingSubmission.submittedAt).toLocaleString() : 'N/A'}</p>
                <div>
                    <p className="font-medium mb-1"><strong>Screenshot Proof:</strong></p>
                    {editingSubmission.screenshotUrl && editingSubmission.screenshotUrl.startsWith('data:image') ? (
                         <a href={editingSubmission.screenshotUrl} target="_blank" rel="noopener noreferrer" title="Open image in new tab">
                            <Image src={editingSubmission.screenshotUrl} alt="Payment Screenshot" width={400} height={300} className="rounded-md border object-contain max-h-[300px] w-auto cursor-pointer hover:opacity-80 transition-opacity" />
                         </a>
                    ) : (
                        <p className="text-sm text-muted-foreground">
                            No valid image preview. Link (if available): 
                            {editingSubmission.screenshotUrl ? (
                                <Button variant="link" asChild className="p-0 h-auto ml-1">
                                    <a href={editingSubmission.screenshotUrl} target="_blank" rel="noopener noreferrer">
                                        View Original <ExternalLink className="ml-1 h-3 w-3" />
                                    </a>
                                </Button>
                            ) : " Not provided"}
                        </p>
                    )}
                </div>
                 <div>
                    <Label htmlFor="adminNotes">Admin Notes</Label>
                    <Textarea 
                        id="adminNotes" 
                        value={adminNotes} 
                        onChange={(e) => setAdminNotes(e.target.value)}
                        placeholder="Optional notes for this submission (e.g., reason for rejection, confirmation details)..."
                        className="mt-1"
                        rows={3}
                        disabled={isUpdating}
                    />
                </div>
                {editingSubmission.adminNotes && !adminNotes && (
                    <p className="text-xs text-muted-foreground mt-1">Previous notes: {editingSubmission.adminNotes}</p>
                )}
            </div>
            <DialogFooter className="sm:justify-between gap-2 pt-4 border-t">
              <div className="flex gap-2">
                <Button 
                    variant="destructive" 
                    onClick={() => handleUpdateStatus(editingSubmission.id, 'REJECTED', adminNotes)}
                    disabled={editingSubmission.status === 'REJECTED' || isUpdating}
                    className="shadow-md hover:shadow-sm active:translate-y-px transition-all duration-150"
                >
                    {isUpdating && editingSubmission.status !== 'REJECTED' ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <XCircle className="mr-2 h-4 w-4" />} Reject
                </Button>
                <Button 
                    variant="default" 
                    className="bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-sm active:translate-y-px transition-all duration-150"
                    onClick={() => handleUpdateStatus(editingSubmission.id, 'APPROVED', adminNotes)}
                    disabled={editingSubmission.status === 'APPROVED' || isUpdating}
                >
                     {isUpdating && editingSubmission.status !== 'APPROVED' ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <CheckCircle className="mr-2 h-4 w-4" />} Approve
                </Button>
              </div>
               <DialogClose asChild>
                  <Button type="button" variant="outline" className="shadow-md hover:shadow-sm active:translate-y-px transition-all duration-150" disabled={isUpdating}>
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

    