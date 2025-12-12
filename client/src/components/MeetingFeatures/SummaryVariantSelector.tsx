import React from 'react';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { User, Briefcase, Code, DollarSign } from 'lucide-react';

interface SummaryVariantSelectorProps {
  selectedRole: string;
  onRoleChange: (role: string) => void;
  loading: boolean;
}

export const SummaryVariantSelector: React.FC<SummaryVariantSelectorProps> = ({ selectedRole, onRoleChange, loading }) => {
  return (
    <div className="flex items-center space-x-2 bg-muted/30 p-1 rounded-lg border border-border/50">
      <ToggleGroup
        type="single"
        value={selectedRole}
        onValueChange={(val) => val && onRoleChange(val)}
        disabled={loading}
      >
        <ToggleGroupItem value="General" aria-label="General" className="flex items-center gap-2">
          <User className="h-4 w-4" />
          <span className="hidden sm:inline">General</span>
        </ToggleGroupItem>
        <ToggleGroupItem value="CEO" aria-label="CEO" className="flex items-center gap-2">
          <Briefcase className="h-4 w-4" />
          <span className="hidden sm:inline">CEO</span>
        </ToggleGroupItem>
        <ToggleGroupItem value="Engineer" aria-label="Engineer" className="flex items-center gap-2">
          <Code className="h-4 w-4" />
          <span className="hidden sm:inline">Engineer</span>
        </ToggleGroupItem>
        <ToggleGroupItem value="Sales" aria-label="Sales" className="flex items-center gap-2">
          <DollarSign className="h-4 w-4" />
          <span className="hidden sm:inline">Sales</span>
        </ToggleGroupItem>
      </ToggleGroup>
      {loading && <span className="text-xs text-muted-foreground animate-pulse ml-2">Updating...</span>}
    </div>
  );
};
