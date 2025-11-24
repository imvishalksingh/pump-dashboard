// hooks/useNotifications.ts
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import api from "@/utils/api";

export interface Notification {
  _id: string;
  type: string;
  description: string;
  priority: "Low" | "Medium" | "High";
  status: "Read" | "Unread";
  createdAt: string;
  metadata?: Record<string, any>;
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchNotifications = async () => {
    try {
      const response = await api.get("/api/notifications");
      setNotifications(response.data);
    } catch (error: any) {
      console.error("Failed to fetch notifications:", error);
      toast({
        title: "Error",
        description: "Failed to load notifications",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await api.put(`/api/notifications/${id}/read`);
      setNotifications(prev => 
        prev.map(notif => 
          notif._id === id ? { ...notif, status: "Read" as const } : notif
        )
      );
      toast({
        title: "Success",
        description: "Notification marked as read",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to mark notification as read",
        variant: "destructive",
      });
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put("/api/notifications/read-all");
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, status: "Read" as const }))
      );
      toast({
        title: "Success",
        description: "All notifications marked as read",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to mark all as read",
        variant: "destructive",
      });
    }
  };

  // Calculate unread count
  const unreadCount = notifications.filter(n => n.status === "Unread").length;

  useEffect(() => {
    fetchNotifications();
  }, []);

  return {
    notifications,
    loading,
    unreadCount, // Add this to the return object
    markAsRead,
    markAllAsRead,
    refreshNotifications: fetchNotifications
  };
};