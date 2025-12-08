// hooks/useNozzleman.ts
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '@/utils/api';

export interface Nozzleman {
  _id: string;
  employeeId: string;
  name: string;
  mobile: string;
  shift: string;
  status: string;
  assignedPump?: any;
  assignedNozzles: any[];
  rating: number;
  totalShifts: number;
  totalFuelDispensed: number;
  averageCashHandled: number;
  joinDate: string;
}

export const useNozzleman = () => {
  const { user } = useAuth();
  const [nozzlemen, setNozzlemen] = useState<Nozzleman[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get all nozzlemen (for admin/supervisor)
const fetchNozzlemen = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/api/nozzlemen');
      
      // Handle the response format properly
      let nozzlemenData = [];
      const responseData = response.data;
      
      console.log("API Response:", responseData); // Debug log
      
      if (Array.isArray(responseData)) {
        // Direct array response
        nozzlemenData = responseData;
      } else if (responseData && responseData.success && Array.isArray(responseData.data)) {
        // Response with {success: true, data: [...]} format
        nozzlemenData = responseData.data;
      } else if (responseData && Array.isArray(responseData.data)) {
        // Alternative format
        nozzlemenData = responseData.data;
      } else {
        console.error("Unexpected API response format:", responseData);
        nozzlemenData = [];
      }
      
      console.log("Parsed nozzlemen data:", nozzlemenData); // Debug log
      setNozzlemen(nozzlemenData);
      return nozzlemenData;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch nozzlemen';
      setError(errorMessage);
      console.error('Failed to fetch nozzlemen:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get nozzleman by ID
  const fetchNozzlemanById = async (id: string) => {
    try {
      const response = await api.get(`/api/nozzlemen/${id}`);
      return response.data;
    } catch (err: any) {
      console.error('Failed to fetch nozzleman:', err);
      throw err;
    }
  };

  // Update nozzleman
  const updateNozzleman = async (id: string, data: Partial<Nozzleman>) => {
    try {
      const response = await api.put(`/api/nozzlemen/${id}`, data);
      
      // Update local state if successful
      setNozzlemen(prev => prev.map(n => 
        n._id === id ? response.data : n
      ));
      
      return response.data;
    } catch (err: any) {
      console.error('Failed to update nozzleman:', err);
      throw err;
    }
  };

  // Delete nozzleman
  const deleteNozzleman = async (id: string) => {
    try {
      await api.delete(`/api/nozzlemen/${id}`);
      
      // Update local state
      setNozzlemen(prev => prev.filter(n => n._id !== id));
    } catch (err: any) {
      console.error('Failed to delete nozzleman:', err);
      throw err;
    }
  };

  // Get current user's nozzleman profile
  const getCurrentNozzleman = () => {
    // Check if user has nozzlemanProfile or if user is nozzleman
    if (user?.nozzlemanProfile) {
      return user.nozzlemanProfile;
    }
    
    // If user role is nozzleman, try to find in nozzlemen list
    if (user?.role === 'nozzleman') {
      return nozzlemen.find(n => n._id === user._id) || null;
    }
    
    return null;
  };

  // Check if current user is a nozzleman
  const isNozzleman = user?.role === 'nozzleman';

  // Check if user can manage nozzlemen (admin/supervisor)
  const canManageNozzlemen = user?.role === 'admin' || user?.role === 'supervisor';

  // Load nozzlemen on mount if user can manage them
  useEffect(() => {
    if (canManageNozzlemen) {
      fetchNozzlemen();
    }
  }, [canManageNozzlemen]);

  // Get current nozzleman profile data (for nozzleman users)
  const currentNozzleman = getCurrentNozzleman();

  return {
    // Data
    nozzlemen,
    currentNozzleman,
    
    // State
    loading,
    error,
    
    // Permissions
    isNozzleman,
    canManageNozzlemen,
    
    // Actions
    fetchNozzlemen,
    fetchNozzlemanById,
    updateNozzleman,
    deleteNozzleman,
    
    // Utility functions
    getActiveNozzlemen: () => nozzlemen.filter(n => n.status === 'Active'),
    getNozzlemanById: (id: string) => nozzlemen.find(n => n._id === id),
    
    // Status counts
    getStatusCounts: () => ({
      active: nozzlemen.filter(n => n.status === 'Active').length,
      inactive: nozzlemen.filter(n => n.status === 'Inactive').length,
      onLeave: nozzlemen.filter(n => n.status === 'On Leave').length,
    }),
  };
};