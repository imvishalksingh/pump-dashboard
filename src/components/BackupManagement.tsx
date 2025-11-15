import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw, Download, Upload, Database, AlertCircle, LogIn } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BackupStatus {
  status: string;
  totalBackups: number;
  latestBackup: string | null;
  lastBackupTime: string | null;
  backupSize: string;
  backups?: string[];
  message?: string;
}

interface ApiResponse {
  success: boolean;
  message: string;
  data?: BackupStatus | any;
  error?: string;
}

export const BackupManagement = () => {
  const [status, setStatus] = useState<BackupStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [backupLoading, setBackupLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const { toast } = useToast();

  // Get authentication token with better checking
  const getAuthToken = (): string | null => {
    const token = localStorage.getItem('token');
    console.log('🔐 Auth token check:', token ? 'Token found' : 'No token');
    return token;
  };

  const getAuthHeaders = (): HeadersInit => {
    const token = getAuthToken();
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    };
    console.log('🔐 Request headers:', { 
      hasAuth: !!token, 
      authHeader: token ? 'Bearer ***' : 'None' 
    });
    return headers;
  };

  // Check authentication status
  const checkAuthentication = (): boolean => {
    const token = getAuthToken();
    const authenticated = !!token;
    setIsAuthenticated(authenticated);
    console.log('🔐 Authentication status:', authenticated ? 'Authenticated' : 'Not authenticated');
    return authenticated;
  };

  const fetchStatus = async (): Promise<void> => {
  if (!checkAuthentication()) {
    toast({
      title: "Authentication Required",
      description: "Please log in to access backup features",
      variant: "destructive",
    });
    return;
  }

  setLoading(true);
  try {
    console.log('🔄 Fetching backup status...');
    const response = await fetch('/api/backups/status', {
      headers: getAuthHeaders(),
    });

    console.log('📡 Status response:', response.status, response.statusText);

    if (!response.ok) {
      // Try to get detailed error message
      let errorMessage = `Failed to fetch backup status: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch (e) {
        // If we can't parse JSON, use the status text
        errorMessage = `Failed to fetch backup status: ${response.status} ${response.statusText}`;
      }
      
      if (response.status === 401) {
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        throw new Error('Session expired. Please login again.');
      }
      throw new Error(errorMessage);
    }

    const data: ApiResponse = await response.json();
    console.log('📊 Backup status data received:', data);
    
    if (data.success && data.data) {
      setStatus(data.data as BackupStatus);
    } else {
      throw new Error(data.message || 'Invalid response from server');
    }
  } catch (error: any) {
    console.error('Failed to fetch backup status:', error);
    toast({
      title: "Error",
      description: error.message || "Failed to fetch backup status",
      variant: "destructive",
    });
  } finally {
    setLoading(false);
  }
};

  const createBackup = async (): Promise<void> => {
    if (!checkAuthentication()) {
      toast({
        title: "Authentication Required",
        description: "Please log in to create backups",
        variant: "destructive",
      });
      return;
    }

    setBackupLoading(true);
    try {
      console.log('🚀 Creating backup...');
      const response = await fetch('/api/backups/create', {
        method: 'POST',
        headers: getAuthHeaders(),
      });

      console.log('📡 Backup creation response:', response.status, response.statusText);

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          setIsAuthenticated(false);
          throw new Error('Session expired. Please login again.');
        }
        
        // Get detailed error message
        let errorMessage = `Backup failed: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          // Ignore JSON parse errors
        }
        throw new Error(errorMessage);
      }

      const result: ApiResponse = await response.json();
      console.log('✅ Backup creation result:', result);
      
      if (result.success) {
        toast({
          title: "Success",
          description: result.message || "Backup created successfully",
        });

        // Refresh status after 2 seconds to show new backup
        setTimeout(fetchStatus, 2000);
      } else {
        throw new Error(result.message || 'Backup creation failed');
      }
    } catch (error: any) {
      console.error('Backup failed:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create backup",
        variant: "destructive",
      });
    } finally {
      setBackupLoading(false);
    }
  };

  const listBackups = async (): Promise<void> => {
    if (!checkAuthentication()) {
      toast({
        title: "Authentication Required",
        description: "Please log in to list backups",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch('/api/backups/list', {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to list backups: ${response.status}`);
      }

      const result: ApiResponse = await response.json();
      
      if (result.success) {
        console.log('Available backups:', result.data);
        toast({
          title: "Success",
          description: `Found ${result.data.total} backups`,
        });
      } else {
        throw new Error(result.message || 'Failed to list backups');
      }
    } catch (error: any) {
      console.error('Failed to list backups:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to list backups",
        variant: "destructive",
      });
    }
  };

  const handleLoginRedirect = () => {
    // Redirect to your login page
    window.location.href = '/login'; // Adjust based on your routing
  };

  useEffect(() => {
    checkAuthentication();
    if (isAuthenticated) {
      fetchStatus();
    }
  }, [isAuthenticated]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Database Backup Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Authentication Warning */}
          {!isAuthenticated && (
            <div className="bg-amber-50 border border-amber-200 p-3 rounded-md">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <p className="text-amber-800 font-semibold">Authentication Required</p>
              </div>
              <p className="text-amber-700 text-sm mb-3">
                You need to be logged in to manage backups.
              </p>
              <Button 
                onClick={handleLoginRedirect}
                className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700"
              >
                <LogIn className="h-4 w-4" />
                Go to Login
              </Button>
            </div>
          )}

          {/* Loading State */}
          {loading && isAuthenticated && (
            <div className="flex items-center justify-center p-4">
              <RefreshCw className="h-6 w-6 animate-spin" />
              <span className="ml-2">Loading backup status...</span>
            </div>
          )}

          {/* Status - Only show when authenticated */}
          {isAuthenticated && status && !loading && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">Total Backups</p>
                <p className="text-2xl font-bold">{status.totalBackups}</p>
              </div>
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">Latest Backup</p>
                <p className="text-sm font-medium truncate" title={status.latestBackup || 'No backup'}>
                  {status.latestBackup ? 
                    new Date(status.lastBackupTime!).toLocaleDateString() : 
                    'None'
                  }
                </p>
              </div>
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">Backup Size</p>
                <p className="text-sm font-medium">{status.backupSize || '0 MB'}</p>
              </div>
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">Status</p>
                <p className={`text-sm font-medium ${
                  status.status === 'active' ? 'text-green-600' : 
                  status.status === 'no_backups' ? 'text-amber-600' : 
                  'text-red-600'
                }`}>
                  {status.status === 'active' ? 'Active' : 
                   status.status === 'no_backups' ? 'No Backups' : 
                   'Error'}
                </p>
              </div>
            </div>
          )}

          {/* Actions - Only show when authenticated */}
          {isAuthenticated && (
            <div className="flex gap-4 flex-wrap">
              <Button 
                onClick={createBackup} 
                disabled={backupLoading}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${backupLoading ? 'animate-spin' : ''}`} />
                {backupLoading ? 'Creating Backup...' : 'Create Backup Now'}
              </Button>
              
              <Button 
                variant="outline" 
                onClick={fetchStatus}
                disabled={loading}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh Status
              </Button>

              <Button 
                variant="outline" 
                onClick={listBackups}
              >
                List Backups
              </Button>
            </div>
          )}

          {/* Info */}
          <div className="bg-blue-50 border border-blue-200 p-3 rounded-md">
            <p className="text-blue-800 text-sm">
              💡 Automatic backups run daily at 2 AM. Backups are retained for 30 days.
              {!isAuthenticated && (
                <span className="font-semibold"> Please login to access backup features.</span>
              )}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};