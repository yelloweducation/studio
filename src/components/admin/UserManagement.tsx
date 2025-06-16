
"use client";
import React, { useState, useEffect, type FormEvent } from 'react';
import type { User, Role as PrismaRoleType } from '@prisma/client'; 
import {
  getAllUsersServerAction,
  serverAdminUpdateUserRole,
  serverAdminAddUser,
  serverAdminUpdateUserStatus,
  serverAdminSetUserPassword,
} from '@/actions/authActions';
import { SUPER_ADMIN_EMAIL } from '@/lib/authUtils';
import { useAuth } from '@/hooks/useAuth';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users as UsersIcon, ShieldCheck, UserCheck, ArrowUpDown, Loader2, PlusCircle, KeyRound, UserCog, Edit3 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';


const addUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Invalid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
  role: z.enum(["STUDENT", "ADMIN"], { required_error: "Role is required." }),
});
type AddUserFormValues = z.infer<typeof addUserSchema>;

const resetPasswordSchema = z.object({
  newPassword: z.string().min(6, "New password must be at least 6 characters."),
});
type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;


export default function UserManagement() {
  const [managedUsers, setManagedUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user: currentAdminUser, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [isResetPasswordDialogOpen, setIsResetPasswordDialogOpen] = useState(false);
  const [userToResetPassword, setUserToResetPassword] = useState<User | null>(null);

  const addUserForm = useForm<AddUserFormValues>({ resolver: zodResolver(addUserSchema), defaultValues: { role: "STUDENT" } });
  const resetPasswordForm = useForm<ResetPasswordFormValues>({ resolver: zodResolver(resetPasswordSchema) });


  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        const usersFromDb = await getAllUsersServerAction();
        setManagedUsers(usersFromDb.map(u => ({...u, name: u.name ?? 'N/A'})));
      } catch (error) {
        toast({ variant: "destructive", title: "Fetch Failed", description: "Could not load users." });
      }
      setIsLoading(false);
    };
    fetchUsers();
  }, [toast]);

  useEffect(() => {
    if (currentAdminUser) {
      setIsSuperAdmin(currentAdminUser.email === SUPER_ADMIN_EMAIL);
    }
  }, [currentAdminUser]);

  const handleAddUserSubmit = async (values: AddUserFormValues) => {
    try {
      const newUser = await serverAdminAddUser(values);
      if (newUser) {
        setManagedUsers(prev => [...prev, {...newUser, name: newUser.name ?? 'N/A'}].sort((a,b) => (a.name ?? '').localeCompare(b.name ?? '')));
        toast({ title: "User Added", description: `${newUser.name} created successfully.` });
        setIsAddUserDialogOpen(false);
        addUserForm.reset();
      } else {
        throw new Error("Failed to create user.");
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "Add User Failed", description: error.message || "Could not add user." });
    }
  };

  const handleRoleChange = async (targetUserId: string, newRole: PrismaRoleType) => {
    try {
      const updatedUser = await serverAdminUpdateUserRole(targetUserId, newRole);
      if (updatedUser) {
        setManagedUsers(prevUsers => prevUsers.map(u =>
          u.id === targetUserId ? { ...u, role: newRole, name: updatedUser.name ?? 'N/A' } : u
        ));
        toast({ title: "User Role Updated", description: `User ${updatedUser.name}'s role changed to ${newRole}.` });
      } else { throw new Error("Update operation returned null."); }
    } catch (error: any) {
      toast({ variant: "destructive", title: "Update Failed", description: error.message || "Could not update user role." });
    }
  };

  const handleStatusToggle = async (targetUser: User) => {
    if (targetUser.email === SUPER_ADMIN_EMAIL && targetUser.isActive) {
        toast({ variant: "destructive", title: "Action Denied", description: "Super admin cannot be deactivated." });
        return;
    }
    try {
      const updatedUser = await serverAdminUpdateUserStatus(targetUser.id, !targetUser.isActive);
      if (updatedUser) {
        setManagedUsers(prevUsers => prevUsers.map(u =>
          u.id === targetUser.id ? { ...u, isActive: updatedUser.isActive, name: updatedUser.name ?? 'N/A' } : u
        ));
        toast({ title: "User Status Updated", description: `${updatedUser.name} is now ${updatedUser.isActive ? 'active' : 'inactive'}.` });
      } else { throw new Error("Update operation returned null."); }
    } catch (error: any) {
      toast({ variant: "destructive", title: "Status Update Failed", description: error.message || "Could not update user status." });
    }
  };
  
  const openResetPasswordDialog = (user: User) => {
    if (user.email === SUPER_ADMIN_EMAIL) {
        toast({ variant: "destructive", title: "Action Denied", description: "Super admin password cannot be reset from here." });
        return;
    }
    setUserToResetPassword(user);
    setIsResetPasswordDialogOpen(true);
    resetPasswordForm.reset();
  };

  const handleResetPasswordSubmit = async (values: ResetPasswordFormValues) => {
    if (!userToResetPassword) return;
    try {
      const result = await serverAdminSetUserPassword(userToResetPassword.id, values.newPassword);
      if (result.success) {
        toast({ title: "Password Reset", description: `Password for ${userToResetPassword.name} has been updated.` });
        setIsResetPasswordDialogOpen(false);
        setUserToResetPassword(null);
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "Password Reset Failed", description: error.message || "Could not reset password." });
    }
  };

  if (isLoading || authLoading) {
    return (
      <Card className="shadow-lg"><CardHeader><CardTitle className="flex items-center text-xl md:text-2xl font-headline"><UsersIcon className="mr-2 md:mr-3 h-6 w-6 md:h-7 md:w-7 text-primary" /> User Management</CardTitle><CardDescription>Loading users...</CardDescription></CardHeader><CardContent className="py-10"><div className="flex justify-center items-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div></CardContent></Card>
    );
  }

  return (
    <>
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
                <CardTitle className="flex items-center text-xl md:text-2xl font-headline">
                    <UsersIcon className="mr-2 md:mr-3 h-6 w-6 md:h-7 md:w-7 text-primary" /> User Management
                </CardTitle>
                <CardDescription>Manage users, roles, status, and passwords. Data from Neon/Postgres via Prisma.</CardDescription>
            </div>
            {isSuperAdmin && (
                <Dialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-md w-full sm:w-auto"><PlusCircle className="mr-2 h-4 w-4"/>Add New User</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader><DialogTitle>Add New User</DialogTitle><DialogDescription>Create a new user account and assign a role.</DialogDescription></DialogHeader>
                        <Form {...addUserForm}>
                            <form onSubmit={addUserForm.handleSubmit(handleAddUserSubmit)} className="space-y-4 py-2">
                                <FormField control={addUserForm.control} name="name" render={({ field }) => (<FormItem><FormLabel>Full Name</FormLabel><Input {...field} placeholder="John Doe" disabled={addUserForm.formState.isSubmitting} /><FormMessage /></FormItem>)} />
                                <FormField control={addUserForm.control} name="email" render={({ field }) => (<FormItem><FormLabel>Email</FormLabel><Input type="email" {...field} placeholder="user@example.com" disabled={addUserForm.formState.isSubmitting} /><FormMessage /></FormItem>)} />
                                <FormField control={addUserForm.control} name="password" render={({ field }) => (<FormItem><FormLabel>Password</FormLabel><Input type="password" {...field} placeholder="••••••••" disabled={addUserForm.formState.isSubmitting} /><FormMessage /></FormItem>)} />
                                <FormField control={addUserForm.control} name="role" render={({ field }) => (<FormItem><FormLabel>Role</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value} disabled={addUserForm.formState.isSubmitting}><SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger><SelectContent><SelectItem value="STUDENT">Student</SelectItem><SelectItem value="ADMIN">Admin</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                                <DialogFooter className="pt-4"><DialogClose asChild><Button type="button" variant="outline" disabled={addUserForm.formState.isSubmitting}>Cancel</Button></DialogClose><Button type="submit" disabled={addUserForm.formState.isSubmitting}>{addUserForm.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}Add User</Button></DialogFooter>
                            </form>
                        </Form>
                    </DialogContent>
                </Dialog>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {managedUsers.length > 0 ? (
            <div className="relative w-full overflow-auto">
              <Table>
                <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Role</TableHead><TableHead>Status</TableHead><TableHead className="text-center">Actions</TableHead></TableRow></TableHeader>
                <TableBody>
                  {managedUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant={user.email === SUPER_ADMIN_EMAIL ? "default" : (user.role === 'ADMIN' ? 'destructive' : 'secondary')} className="capitalize">
                          {user.email === SUPER_ADMIN_EMAIL ? <ShieldCheck className="mr-1.5 h-3.5 w-3.5" /> : (user.role === 'ADMIN' ? <UserCog className="mr-1.5 h-3.5 w-3.5" /> : null)}
                          {user.email === SUPER_ADMIN_EMAIL ? 'Super Admin' : user.role.toLowerCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {isSuperAdmin && user.email !== SUPER_ADMIN_EMAIL ? (
                             <Switch id={`status-${user.id}`} checked={user.isActive} onCheckedChange={() => handleStatusToggle(user)} aria-label={`Toggle status for ${user.name}`}/>
                        ) : (
                             <Badge variant={user.isActive ? "secondary" : "outline"} className={user.isActive ? "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300" : "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300"}>
                                {user.isActive ? "Active" : "Inactive"}
                             </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-center space-x-1">
                        {isSuperAdmin && user.email !== SUPER_ADMIN_EMAIL ? (
                          <>
                            {user.role === 'STUDENT' ? (
                                <Button variant="outline" size="sm" onClick={() => handleRoleChange(user.id, 'ADMIN')} className="hover:bg-green-500/10 border-green-500 text-green-600"><UserCheck className="mr-1 h-4 w-4"/>Promote</Button>
                            ) : (
                                <Button variant="outline" size="sm" onClick={() => handleRoleChange(user.id, 'STUDENT')} className="hover:bg-amber-500/10 border-amber-500 text-amber-600"><ArrowUpDown className="mr-1 h-4 w-4"/>Demote</Button>
                            )}
                            <Button variant="outline" size="sm" onClick={() => openResetPasswordDialog(user)}><KeyRound className="mr-1 h-4 w-4"/>Password</Button>
                          </>
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
          ) : (<p className="text-center text-muted-foreground py-4">No users found.</p>)}
        </CardContent>
      </Card>

      {userToResetPassword && (
        <Dialog open={isResetPasswordDialogOpen} onOpenChange={setIsResetPasswordDialogOpen}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader><DialogTitle>Reset Password for {userToResetPassword.name}</DialogTitle><DialogDescription>Enter a new password for this user.</DialogDescription></DialogHeader>
                <Form {...resetPasswordForm}>
                    <form onSubmit={resetPasswordForm.handleSubmit(handleResetPasswordSubmit)} className="space-y-4 py-2">
                        <FormField control={resetPasswordForm.control} name="newPassword" render={({ field }) => (<FormItem><FormLabel>New Password</FormLabel><Input type="password" {...field} placeholder="••••••••" disabled={resetPasswordForm.formState.isSubmitting} /><FormMessage /></FormItem>)} />
                        <DialogFooter className="pt-4"><DialogClose asChild><Button type="button" variant="outline" disabled={resetPasswordForm.formState.isSubmitting}>Cancel</Button></DialogClose><Button type="submit" disabled={resetPasswordForm.formState.isSubmitting}>{resetPasswordForm.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}Reset Password</Button></DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
      )}
    </>
  );
}

    