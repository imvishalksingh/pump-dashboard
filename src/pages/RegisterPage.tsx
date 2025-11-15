// pages/RegisterPage.tsx
import { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Droplet, Mail, Lock, User, Ticket, CheckCircle, XCircle } from "lucide-react";
import { ROLE_ROUTES } from "@/utils/roles";

const RegisterPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [invitationToken, setInvitationToken] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingInvitation, setIsCheckingInvitation] = useState(false);
  const [invitationInfo, setInvitationInfo] = useState<{ 
    valid: boolean; 
    role?: string; 
    expiresAt?: string;
    message?: string;
  } | null>(null);
  
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { register, checkInvitation } = useAuth();
  const { toast } = useToast();

  // Check for invitation token in URL on component mount
  useEffect(() => {
    const token = searchParams.get('token');
    const emailParam = searchParams.get('email');
    
    console.log("🔍 URL Parameters:", { token, emailParam });
    
    if (token) {
      setInvitationToken(token);
      console.log("✅ Token set from URL:", token);
    }
    
    if (emailParam) {
      const decodedEmail = decodeURIComponent(emailParam);
      setEmail(decodedEmail);
      console.log("✅ Email set from URL:", decodedEmail);
      
      // Auto-validate if both token and email are available
      if (token) {
        console.log("🔄 Auto-validating invitation...");
        validateInvitation(token, decodedEmail);
      }
    }
  }, [searchParams]);

  const validateInvitation = async (token: string, email: string) => {
    if (!token || !email) {
      setInvitationInfo({ valid: false, message: "Token and email are required" });
      return;
    }
    
    setIsCheckingInvitation(true);
    const result = await checkInvitation(token, email);
    
    if (result.valid && result.data) {
      setInvitationInfo({
        valid: true,
        role: result.data.role,
        expiresAt: result.data.expiresAt,
        message: `You're invited as ${result.data.role}`
      });
      toast({
        title: "Invitation valid!",
        description: `You're invited as ${result.data.role}. Complete your registration.`,
      });
    } else {
      setInvitationInfo({
        valid: false,
        message: result.message || "Invalid invitation"
      });
      toast({
        title: "Invalid invitation",
        description: result.message || "Please check your invitation details",
        variant: "destructive",
      });
    }
    setIsCheckingInvitation(false);
  };

  const handleTokenCheck = async () => {
    if (!invitationToken || !email) {
      toast({
        title: "Missing information",
        description: "Please enter both email and invitation token",
        variant: "destructive",
      });
      return;
    }
    await validateInvitation(invitationToken, email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email || !password || !invitationToken) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters",
        variant: "destructive",
      });
      return;
    }

    if (!invitationInfo?.valid) {
      toast({
        title: "Invalid invitation",
        description: "Please validate your invitation token first",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    const result = await register(email, password, name, invitationToken);
    
    if (result.success) {
      toast({
        title: "Registration successful!",
        description: `Your ${invitationInfo.role} account has been created. Welcome!`,
      });
      
      const defaultRoute = ROLE_ROUTES[invitationInfo.role as keyof typeof ROLE_ROUTES] || "/dashboard";
      navigate(defaultRoute);
    } else {
      toast({
        title: "Registration failed",
        description: result.message || "Registration failed. Please try again.",
        variant: "destructive",
      });
    }

    setIsLoading(false);
  };

  const isFormValid = name && email && password && invitationToken && invitationInfo?.valid;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-primary/10 p-3">
              <Droplet className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">
            {invitationInfo?.valid ? `Join as ${invitationInfo.role}` : "Create Account"}
          </CardTitle>
          <CardDescription>
            {invitationInfo?.valid 
              ? `Complete your registration as ${invitationInfo.role}`
              : "Enter your invitation details to get started"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Invitation Section */}
            <div className="space-y-3 p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <Ticket className="h-4 w-4 text-muted-foreground" />
                <Label className="text-sm font-medium">Invitation Details</Label>
              </div>
              
              {/* ADDED: Email input field */}
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading || isCheckingInvitation}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="invitationToken">Invitation Token *</Label>
                <Input
                  id="invitationToken"
                  placeholder="Enter your invitation token"
                  value={invitationToken}
                  onChange={(e) => setInvitationToken(e.target.value)}
                  required
                  disabled={isLoading || isCheckingInvitation}
                />
              </div>

              <Button 
                type="button" 
                onClick={handleTokenCheck}
                disabled={!invitationToken || !email || isCheckingInvitation}
                className="w-full"
              >
                {isCheckingInvitation ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                    Validating Invitation...
                  </>
                ) : (
                  "Validate Invitation"
                )}
              </Button>
              
              {!invitationToken || !email ? (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
                  <p className="text-sm text-amber-800 text-center">
                    Please enter both email and invitation token to validate
                  </p>
                </div>
              ) : null}
              
              {invitationInfo && (
                <div className={`p-3 rounded-md border ${
                  invitationInfo.valid 
                    ? "bg-green-50 border-green-200 text-green-800" 
                    : "bg-red-50 border-red-200 text-red-800"
                }`}>
                  <div className="flex items-center gap-2">
                    {invitationInfo.valid ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <XCircle className="h-4 w-4" />
                    )}
                    <span className="text-sm font-medium">
                      {invitationInfo.valid ? "Invitation Valid!" : "Invalid Invitation"}
                    </span>
                  </div>
                  {invitationInfo.role && (
                    <p className="text-sm mt-1">Role: <strong className="capitalize">{invitationInfo.role}</strong></p>
                  )}
                  {invitationInfo.expiresAt && (
                    <p className="text-sm mt-1">
                      Expires: {new Date(invitationInfo.expiresAt).toLocaleDateString()}
                    </p>
                  )}
                  <p className="text-sm mt-1">{invitationInfo.message}</p>
                </div>
              )}
            </div>

            {/* Registration Fields - Only show if invitation is valid */}
            {invitationInfo?.valid && (
              <>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <Label htmlFor="name">Full Name</Label>
                  </div>
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Lock className="h-4 w-4 text-muted-foreground" />
                    <Label htmlFor="password">Password</Label>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    disabled={isLoading}
                  />
                  <p className="text-xs text-muted-foreground">
                    Password must be at least 6 characters long
                  </p>
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={!isFormValid || isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                      Creating Account...
                    </>
                  ) : (
                    `Create ${invitationInfo.role} Account`
                  )}
                </Button>
              </>
            )}
          </form>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-800 text-center">
              <strong>Need an invitation?</strong><br />
              Contact your administrator to get invited to the Petrol Pump Management System.
            </p>
          </div>

          <div className="mt-4 text-center text-sm">
            <span className="text-muted-foreground">Already have an account? </span>
            <Link to="/login" className="text-primary hover:underline font-medium">
              Sign in here
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegisterPage;