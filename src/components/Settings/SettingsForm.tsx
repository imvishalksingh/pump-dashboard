import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "../../context/AuthContext";
import api from "@/utils/api";

interface SettingsData {
  companyName: string;
  GST: string;
  address: string;
  phone: string;
  email: string;
  taxSettings: {
    cgst: number;
    sgst: number;
    cess: number;
  };
  preferences: {
    units: {
      fuel: string;
      currency: string;
    };
    dateFormat: string;
    timeFormat: string;
  };
}

export const SettingsForm = () => {
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const [settings, setSettings] = useState<SettingsData>({
    companyName: "",
    GST: "",
    address: "",
    phone: "",
    email: "",
    taxSettings: {
      cgst: 9,
      sgst: 9,
      cess: 0,
    },
    preferences: {
      units: {
        fuel: "liters",
        currency: "inr",
      },
      dateFormat: "dd-mm-yyyy",
      timeFormat: "24",
    },
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Debug user info
  useEffect(() => {
    console.log("🔍 User debug info:", {
      user,
      isAuthenticated,
      userRole: user?.role,
      roleType: typeof user?.role,
      isAdmin: user?.role === "admin"
    });
  }, [user, isAuthenticated]);

  // Load settings on component mount
  useEffect(() => {
    if (isAuthenticated) {
      loadSettings();
    }
  }, [isAuthenticated]);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/api/settings");
      
      if (response.data) {
        setSettings(response.data);
      }
    } catch (error: any) {
      console.error("Error loading settings:", error);
      const errorMessage = error.response?.data?.message || "Failed to load settings";
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const response = await api.put("/api/settings", settings);

      if (response.data) {
        setSettings(response.data.settings);
        toast({
          title: "Success",
          description: "Settings saved successfully",
        });
      }
    } catch (error: any) {
      console.error("Error saving settings:", error);
      const errorMessage = error.response?.data?.message || "Failed to save settings";
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    try {
      if (!confirm("Are you sure you want to reset all settings to defaults? This action cannot be undone.")) {
        return;
      }

      const response = await api.post("/api/settings/reset");

      if (response.data) {
        setSettings(response.data.settings);
        toast({
          title: "Success",
          description: "Settings reset to defaults",
        });
      }
    } catch (error: any) {
      console.error("Error resetting settings:", error);
      const errorMessage = error.response?.data?.message || "Failed to reset settings";
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setSettings(prev => {
      const fields = field.split('.');
      const newSettings = JSON.parse(JSON.stringify(prev));
      
      let current: any = newSettings;
      for (let i = 0; i < fields.length - 1; i++) {
        if (!current[fields[i]]) {
          current[fields[i]] = {};
        }
        current = current[fields[i]];
      }
      current[fields[fields.length - 1]] = value;
      
      return newSettings;
    });
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-lg">Loading settings...</div>
      </div>
    );
  }

  // Show authentication warning
  if (!isAuthenticated) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-lg text-destructive">
          Please log in to access settings
        </div>
      </div>
    );
  }

  // Debug: Show current user role info
  console.log("🛠️ Current user role check:", {
    userRole: user?.role,
    expected: "Admin",
    isMatch: user?.role === "admin",
    strictMatch: user?.role === "admin"
  });

  // Check for Admin role with multiple possible values
  const isAdmin =  
                  user?.role === "admin" || 
                  user?.role?.toLowerCase() === "admin";

  console.log("🔐 Final admin check:", { isAdmin, userRole: user?.role });

  if (!isAdmin) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-center space-y-2">
          <div className="text-lg text-destructive">
            You don't have permission to access settings. Admin role required.
          </div>
          <div className="text-sm text-muted-foreground">
            Your current role: <strong>{user?.role || "Unknown"}</strong>
          </div>
          <div className="text-sm text-muted-foreground">
            Required role: <strong>Admin</strong>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Company Information */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Company Information</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                value={settings.companyName}
                onChange={(e) => handleInputChange("companyName", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gst">GST Number</Label>
              <Input
                id="gst"
                value={settings.GST}
                onChange={(e) => handleInputChange("GST", e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              rows={3}
              value={settings.address}
              onChange={(e) => handleInputChange("address", e.target.value)}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Contact Number</Label>
              <Input
                id="phone"
                value={settings.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={settings.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Tax Settings */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Tax Settings</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cgst">CGST (%)</Label>
              <Input
                id="cgst"
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={settings.taxSettings.cgst}
                onChange={(e) => handleInputChange("taxSettings.cgst", parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sgst">SGST (%)</Label>
              <Input
                id="sgst"
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={settings.taxSettings.sgst}
                onChange={(e) => handleInputChange("taxSettings.sgst", parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cess">Cess (%)</Label>
              <Input
                id="cess"
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={settings.taxSettings.cess}
                onChange={(e) => handleInputChange("taxSettings.cess", parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Preferences */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Preferences</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="unit">Measurement Unit</Label>
              <Select
                value={settings.preferences.units.fuel}
                onValueChange={(value) => handleInputChange("preferences.units.fuel", value)}
              >
                <SelectTrigger id="unit">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="liters">Liters</SelectItem>
                  <SelectItem value="gallons">Gallons</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select
                value={settings.preferences.units.currency}
                onValueChange={(value) => handleInputChange("preferences.units.currency", value)}
              >
                <SelectTrigger id="currency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="inr">₹ INR</SelectItem>
                  <SelectItem value="usd">$ USD</SelectItem>
                  <SelectItem value="eur">€ EUR</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dateFormat">Date Format</Label>
              <Select
                value={settings.preferences.dateFormat}
                onValueChange={(value) => handleInputChange("preferences.dateFormat", value)}
              >
                <SelectTrigger id="dateFormat">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dd-mm-yyyy">DD-MM-YYYY</SelectItem>
                  <SelectItem value="mm-dd-yyyy">MM-DD-YYYY</SelectItem>
                  <SelectItem value="yyyy-mm-dd">YYYY-MM-DD</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="timeFormat">Time Format</Label>
              <Select
                value={settings.preferences.timeFormat}
                onValueChange={(value) => handleInputChange("preferences.timeFormat", value)}
              >
                <SelectTrigger id="timeFormat">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="12">12 Hour</SelectItem>
                  <SelectItem value="24">24 Hour</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </Card>

      <Separator />

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={handleReset} disabled={isSaving}>
          Reset to Defaults
        </Button>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </div>
  );
};