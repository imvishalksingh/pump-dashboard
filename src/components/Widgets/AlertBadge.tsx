import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface AlertBadgeProps {
  type: "low-stock" | "pending" | "critical" | "warning" | "info";
  children: React.ReactNode;
  className?: string;
}

export const AlertBadge = ({ type, children, className }: AlertBadgeProps) => {
  const variantMap = {
    "low-stock": "destructive",
    "pending": "secondary",
    "critical": "destructive",
    "warning": "default",
    "info": "outline",
  };

  return (
    <Badge 
      variant={variantMap[type] as any}
      className={cn(className)}
    >
      {children}
    </Badge>
  );
};
