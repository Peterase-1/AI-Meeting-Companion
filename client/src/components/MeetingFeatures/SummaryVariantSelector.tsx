import React from 'react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { User, Briefcase, Code, DollarSign } from 'lucide-react';

interface SummaryVariantSelectorProps {
  selectedRole: string;
  onRoleChange: (role: string) => void;
  loading: boolean;
}

export const SummaryVariantSelector: React.FC<SummaryVariantSelectorProps> = ({ selectedRole, onRoleChange, loading }) => {
  const roles = [
    { value: "General", icon: User, label: "General" },
    { value: "CEO", icon: Briefcase, label: "CEO" },
    { value: "Engineer", icon: Code, label: "Engineer" },
    { value: "Sales", icon: DollarSign, label: "Sales" },
  ];

  return (
    <div className="flex items-center space-x-1 bg-muted/30 p-1 rounded-lg border border-border/50">
      {roles.map((role) => {
        const Icon = role.icon;
        const isSelected = selectedRole === role.value;
        return (
          <Button
            key={role.value}
            variant={isSelected ? "secondary" : "ghost"}
            size="sm"
            onClick={() => onRoleChange(role.value)}
            disabled={loading}
            className={cn(
              "h-8 px-2 lg:px-3 gap-2 transition-all",
              isSelected && "bg-background shadow-sm hover:bg-background/90"
            )}
          >
            <Icon className="h-4 w-4" />
            <span className="hidden sm:inline">{role.label}</span>
          </Button>
        );
      })}
      {loading && <span className="text-xs text-muted-foreground animate-pulse ml-2">Updating...</span>}
    </div>
  );
};

// Refactor pass 19: verified component render.
