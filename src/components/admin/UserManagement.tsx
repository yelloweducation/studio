
"use client";
import React, { useState, useEffect } from 'react';
import { type User } from '@/data/mockData';
import { getAllUsersFromFirestore, updateUserRoleInFirestore, findUserByEmail } from '@/lib/authUtils';
import { useAuth } from '@/hooks/useAuth';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users as UsersIcon, ShieldCheck, UserCheck, ArrowUpDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const SUPER_ADMIN_EMAIL = 'admin@example.com'; // This should ideally be configurable

export default function UserManagement() {
  const [managedUsers, setManagedUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user: currentAdminUser, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      const usersFromDb = await getAllUsersFromFirestore();
      setManagedUsers(usersFromDb);
      setIsLoading(false);
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    // Determine if the current admin is the super admin
    if (currentAdminUser) {
        // A more robust check might involve fetching the current admin's details from Firestore
        // if `currentAdminUser` from `useAuth` doesn't reliably indicate super admin status.
        // For now, we rely on email.
        setIsSuperAdmin(currentAdminUser.email === SUPER_ADMIN_EMAIL);
    }
  }, [currentAdminUser]);


  const handleRoleChange = async (targetUserId: string, newRole: 'admin' | 'student') => {
    try {
      await updateUserRoleInFirestore(targetUserId, newRole);
      const updatedUsers = managedUsers.map(u =>
        u.id === targetUserId ? { ...u, role: newRole } : u
      );
      setManagedUsers(updatedUsers);
      toast({
        title: "User Role Updated",
        description: `User ${updatedUsers.find(u=>u.id === targetUserId)?.name}'s role changed to ${newRole}.`,
      });
    } catch (error) {
      console.error("Failed to update user role:", error);
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "Could not update user role. Please try again.",
      });
    }
  };

  if (isLoading || authLoading) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-xl md:text-2xl font-headline">
            <UsersIcon className="mr-2 md:mr-3 h-6 w-6 md:h-7 md:w-7 text-primary" /> User Management
          </CardTitle>
          <CardDescription>Loading users...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-2">
            {[1,2,3].map(i => <div key={i} className="h-10 bg-muted rounded"></div>)}
          </div>
        </CardContent>
      </Card>
    );
  }


  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center text-xl md:text-2xl font-headline">
            <UsersIcon className="mr-2 md:mr-3 h-6 w-6 md:h-7 md:w-7 text-primary" /> User Management
        </CardTitle>
        <CardDescription>View and manage user roles. Only Super Admins can change roles.</CardDescription>
      </CardHeader>
      <CardContent>
        {managedUsers.length > 0 ? (
          <div className="relative w-full overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="whitespace-nowrap">Name</TableHead>
                  <TableHead className="whitespace-nowrap">Email</TableHead>
                  <TableHead className="whitespace-nowrap">Role</TableHead>
                  <TableHead className="whitespace-nowrap text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {managedUsers.map((user: User) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium whitespace-nowrap">{user.name}</TableCell>
                    <TableCell className="whitespace-nowrap">{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={user.role === 'admin' ? 'destructive' : 'secondary'} className="whitespace-nowrap capitalize">
                        {user.email === SUPER_ADMIN_EMAIL ? <ShieldCheck className="mr-1.5 h-3.5 w-3.5" /> : (user.role === 'admin' ? <UserCheck className="mr-1.5 h-3.5 w-3.5" /> : null)}
                        {user.email === SUPER_ADMIN_EMAIL ? 'Super Admin' : user.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center whitespace-nowrap">
                      {isSuperAdmin && user.email !== SUPER_ADMIN_EMAIL ? (
                        user.role === 'student' ? (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm" className="hover:bg-green-500 hover:text-white border-green-500 text-green-600">
                                <UserCheck className="mr-1.5 h-4 w-4"/> Promote to Admin
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Confirm Promotion</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to promote {user.name} to an Admin role?
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleRoleChange(user.id, 'admin')} className="bg-green-600 hover:bg-green-700">
                                  Promote
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        ) : (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                             <Button variant="outline" size="sm" className="hover:bg-amber-500 hover:text-white border-amber-500 text-amber-600">
                                <ArrowUpDown className="mr-1.5 h-4 w-4"/> Demote to Student
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Confirm Demotion</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to demote {user.name} to a Student role?
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleRoleChange(user.id, 'student')} className="bg-amber-600 hover:bg-amber-700">
                                  Demote
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )
                      ) : user.email === SUPER_ADMIN_EMAIL ? (
                        <span className="text-xs text-muted-foreground italic">Unchangeable</span>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">N/A</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-4">No users found.</p>
        )}
      </CardContent>
    </Card>
  );
}
