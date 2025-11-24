// components/AdminInvitationsPanel.tsx
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Mail, Copy, RefreshCw, Trash2 } from "lucide-react";
import api from "@/utils/api";

interface Invitation {
  _id: string;
  email: string;
  role: string;
  token: string;
  used: boolean;
  expiresAt: string;
  createdAt: string;
  invitedBy?: {
    name: string;
    email: string;
  };
}

const AdminInvitationsPanel = () => {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("auditor");
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchInvitations();
  }, []);

  const fetchInvitations = async () => {
    try {
      setIsFetching(true);
      console.log("🔍 Fetching invitations...");
      const response = await api.get("/api/admin/invitations");
      console.log("✅ API Response:", response.data);
      
      // FIX: Handle the response format correctly
      // The backend returns { invitations: [], totalPages, currentPage, total }
      const invitationsData = response.data.invitations || [];
      console.log("📨 Invitations data:", invitationsData);
      
      setInvitations(invitationsData);
    } catch (error: any) {
      console.error("❌ Failed to fetch invitations:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to fetch invitations",
        variant: "destructive",
      });
      setInvitations([]);
    } finally {
      setIsFetching(false);
    }
  };

  const createInvitation = async () => {
    if (!email) {
      toast({
        title: "Error",
        description: "Please enter an email address",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      console.log("📧 Creating invitation for:", email);
      const response = await api.post("/api/admin/invitations", { email, role });
      console.log("✅ Invitation created:", response.data);
      
      toast({
        title: "Invitation created!",
        description: `Invitation sent to ${email}. Link copied to clipboard.`,
      });

      setEmail("");
      
      // Refresh the invitations list
      fetchInvitations();

      // Copy invitation link to clipboard
      if (response.data.invitationLink) {
        navigator.clipboard.writeText(response.data.invitationLink);
      }
    } catch (error: any) {
      console.error("❌ Failed to create invitation:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create invitation",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resendInvitation = async (id: string) => {
    try {
      const response = await api.post(`/api/admin/invitations/${id}/resend`);
      
      toast({
        title: "Invitation resent!",
        description: "Invitation has been resent and link copied to clipboard.",
      });

      if (response.data.invitationLink) {
        navigator.clipboard.writeText(response.data.invitationLink);
      }

      // Refresh the list
      fetchInvitations();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to resend invitation",
        variant: "destructive",
      });
    }
  };

  const deleteInvitation = async (id: string) => {
    try {
      await api.delete(`/admin/invitations/${id}`);
      
      toast({
        title: "Invitation deleted",
        description: "Invitation has been deleted successfully.",
      });

      fetchInvitations();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete invitation",
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Token copied to clipboard",
    });
  };

  const getInvitationStatus = (invitation: Invitation) => {
    if (invitation.used) return { status: "Used", color: "bg-gray-100 text-gray-800" };
    if (new Date(invitation.expiresAt) < new Date()) return { status: "Expired", color: "bg-red-100 text-red-800" };
    return { status: "Active", color: "bg-green-100 text-green-800" };
  };

  // Show loading state
  if (isFetching) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading invitations...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Invitation Management</h1>
          <p className="text-muted-foreground">
            Create and manage user invitations for the system
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Send New Invitation</CardTitle>
          <CardDescription>
            Invite new users to the system by entering their email and selecting a role.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={role} onValueChange={setRole} disabled={isLoading}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auditor">Auditor</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={createInvitation} disabled={isLoading || !email}>
            <Mail className="w-4 h-4 mr-2" />
            {isLoading ? "Creating..." : "Create Invitation"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            Active Invitations 
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              ({invitations.length} total)
            </span>
          </CardTitle>
          <CardDescription>
            Manage pending and active invitations. Invitations expire after 7 days.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {invitations.length === 0 ? (
            <div className="text-center py-12">
              <Mail className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No invitations found.</p>
              <p className="text-sm text-muted-foreground mt-2">
                Create your first invitation using the form above.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {invitations.map((invitation) => {
                const status = getInvitationStatus(invitation);
                return (
                  <div key={invitation._id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <div className="flex-1">
                          <p className="font-medium text-lg">{invitation.email}</p>
                          <p className="text-sm text-muted-foreground">
                            Role: <span className="font-medium capitalize">{invitation.role}</span> • 
                            Expires: {new Date(invitation.expiresAt).toLocaleDateString()} •
                            Invited by: {invitation.invitedBy?.name || "System"}
                          </p>
                        </div>
                        <span className={`px-3 py-1 text-sm rounded-full ${status.color} font-medium`}>
                          {status.status}
                        </span>
                      </div>
                      
                      {!invitation.used && (
                        <div className="flex items-center gap-2 mt-3">
                          <Label className="text-sm">Invitation Token:</Label>
                          <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
                            {invitation.token}
                          </code>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(invitation.token)}
                            className="h-7"
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-2 ml-4">
                      {!invitation.used && new Date(invitation.expiresAt) > new Date() && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => resendInvitation(invitation._id)}
                          className="h-9"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteInvitation(invitation._id)}
                        className="h-9 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminInvitationsPanel;