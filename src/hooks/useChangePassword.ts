// hooks/useChangePassword.ts
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import  api  from '@/utils/api';

interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export const useChangePassword = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { user } = useAuth();

  const changePassword = async (data: ChangePasswordData) => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Validate passwords match
      if (data.newPassword !== data.confirmPassword) {
        throw new Error("New passwords don't match");
      }

      // Validate password strength
      if (data.newPassword.length < 6) {
        throw new Error("Password must be at least 6 characters long");
      }

      await api.patch('/api/users/change-my-password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword
      });

      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to change password');
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setError(null);
    setSuccess(false);
  };

  return {
    changePassword,
    isLoading,
    error,
    success,
    reset
  };
};