
import type { Metadata } from 'next';
import SettingsClient from './settings-client';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export const metadata: Metadata = {
  title: 'User Settings | Yellow Institute',
  description: 'Manage your account settings, update your profile, and change your password.',
};

export default function UserSettingsPageContainer() {
  return (
    <ProtectedRoute allowedRoles={['student', 'admin']}> {/* Allow both roles to access settings */}
      <SettingsClient />
    </ProtectedRoute>
  );
}
