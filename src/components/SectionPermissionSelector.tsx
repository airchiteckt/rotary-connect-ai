import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ALL_SECTIONS, SECTION_LABELS, type AppSection } from '@/hooks/usePermissions';

interface SectionPermissionSelectorProps {
  selectedPermissions: AppSection[];
  onPermissionsChange: (permissions: AppSection[]) => void;
  title?: string;
  showSelectAll?: boolean;
}

export function SectionPermissionSelector({
  selectedPermissions,
  onPermissionsChange,
  title = "Permessi Sezioni",
  showSelectAll = true
}: SectionPermissionSelectorProps) {
  
  const handleSectionToggle = (section: AppSection, checked: boolean) => {
    if (checked) {
      onPermissionsChange([...selectedPermissions, section]);
    } else {
      onPermissionsChange(selectedPermissions.filter(s => s !== section));
    }
  };

  const handleSelectAll = () => {
    if (selectedPermissions.length === ALL_SECTIONS.length) {
      onPermissionsChange([]);
    } else {
      onPermissionsChange([...ALL_SECTIONS]);
    }
  };

  const allSelected = selectedPermissions.length === ALL_SECTIONS.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-sm">
          {title}
          {showSelectAll && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleSelectAll}
            >
              {allSelected ? 'Deseleziona Tutto' : 'Seleziona Tutto'}
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {ALL_SECTIONS.map((section) => (
            <div key={section} className="flex items-center space-x-2">
              <Checkbox
                id={section}
                checked={selectedPermissions.includes(section)}
                onCheckedChange={(checked) => handleSectionToggle(section, checked as boolean)}
              />
              <Label htmlFor={section} className="text-sm font-normal">
                {SECTION_LABELS[section]}
              </Label>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}