
"use client";
import { useState, useEffect } from 'react';
import { getPaymentSubmissions, updatePaymentSubmissionStatus, type PaymentSubmission } from '@/data/mockData';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { SendToBack, BadgeCheck, BadgeX, Hourglass, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

const PAYMENT_SUBMISSIONS_KEY = 'paymentSubmissions';


export default function PaymentSubmissions() {
  const [submissions, setSubmissions] = useState<PaymentSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchSubmissions = () => {
    setIsLoading(true);
    const data = getPaymentSubmissions();
    // Sort by date, newest first
    data.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
    setSubmissions(data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const handleStatusUpdate = (submissionId: string, status: PaymentSubmission['status']) => {
    const updatedSubmission = updatePaymentSubmissionStatus(submissionId, status);
    if (updatedSubmission) {
      setSubmissions(prev => 
        prev.map(s => s.id === submissionId ? { ...s, status } : s)
        .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
      );
      toast({ title: "Status Updated", description: `Submission for ${updatedSubmission.courseTitle} by ${updatedSubmission.userEmail} marked as ${status}.`});
    } else {
      toast({ variant: "destructive", title: "Update Failed", description: "Could not update submission status."});
    }
  };


  if (isLoading) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-xl md:text-2xl font-headline">
            <SendToBack className="mr-2 md:mr-3 h-6 w-6 md:h-7 md:w-7 text-primary" /> Payment Submissions
          </CardTitle>
          <CardDescription>Review user payment submissions and manage their status.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Loading submissions...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center text-xl md:text-2xl font-headline">
          <SendToBack className="mr-2 md:mr-3 h-6 w-6 md:h-7 md:w-7 text-primary" /> Payment Submissions
        </CardTitle>
        <CardDescription>Review user payment submissions. Status changes are saved in localStorage.</CardDescription>
        <div className="pt-2">
          <Button onClick={fetchSubmissions} variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" /> Refresh List
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {submissions.length > 0 ? (
          <div className="relative w-full overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User Email</TableHead>
                  <TableHead>Course Title</TableHead>
                  <TableHead>File Name</TableHead>
                  <TableHead>Submitted At</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {submissions.map((submission) => (
                  <TableRow key={submission.id}>
                    <TableCell className="font-medium">{submission.userEmail}</TableCell>
                    <TableCell>{submission.courseTitle}</TableCell>
                    <TableCell className="break-all max-w-xs">{submission.fileName}</TableCell>
                    <TableCell>{format(new Date(submission.submittedAt), 'PPpp')}</TableCell>
                    <TableCell>
                      <Badge variant={
                        submission.status === 'verified' ? 'default' :
                        submission.status === 'rejected' ? 'destructive' :
                        'secondary'
                      } className="capitalize">
                        {submission.status === 'verified' && <BadgeCheck className="mr-1 h-3 w-3"/>}
                        {submission.status === 'rejected' && <BadgeX className="mr-1 h-3 w-3"/>}
                        {submission.status === 'pending' && <Hourglass className="mr-1 h-3 w-3"/>}
                        {submission.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleStatusUpdate(submission.id, 'verified')}
                        disabled={submission.status === 'verified'}
                        className="border-green-500 text-green-600 hover:bg-green-50 hover:text-green-700 disabled:opacity-50"
                      >
                        <BadgeCheck className="mr-1 h-4 w-4" /> Verify
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleStatusUpdate(submission.id, 'rejected')}
                        disabled={submission.status === 'rejected'}
                        className="border-red-500 text-red-600 hover:bg-red-50 hover:text-red-700 disabled:opacity-50"
                      >
                         <BadgeX className="mr-1 h-4 w-4" /> Reject
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleStatusUpdate(submission.id, 'pending')}
                        disabled={submission.status === 'pending'}
                        className="border-gray-500 text-gray-600 hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50"
                      >
                         <Hourglass className="mr-1 h-4 w-4" /> Pend
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
    </Card>
  );
}
