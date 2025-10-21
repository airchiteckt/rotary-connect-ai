import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Star } from 'lucide-react';
import { ALL_SECTIONS, SECTION_LABELS, type AppSection } from '@/hooks/usePermissions';

interface SectionPermissionSelectorProps {
  selectedPermissions: AppSection[];
  onPermissionsChange: (permissions: AppSection[]) => void;
  responsibleSections?: AppSection[];
  onResponsibleChange?: (sections: AppSection[]) => void;
  title?: string;
  showSelectAll?: boolean;
}

export function SectionPermissionSelector({
  selectedPermissions,
  onPermissionsChange,
  responsibleSections = [],
  onResponsibleChange,
  title = "Permessi Sezioni",
  showSelectAll = true
}: SectionPermissionSelectorProps) {
  
  const handleSectionToggle = (section: AppSection, checked: boolean) => {
    if (checked) {
      onPermissionsChange([...selectedPermissions, section]);
    } else {
      onPermissionsChange(selectedPermissions.filter(s => s !== section));
      // If removing permission, also remove responsible status
      if (onResponsibleChange && responsibleSections.includes(section)) {
        onResponsibleChange(responsibleSections.filter(s => s !== section));
      }
    }
  };

  const handleResponsibleToggle = (section: AppSection) => {
    if (!onResponsibleChange) return;
    
    if (responsibleSections.includes(section)) {
      onResponsibleChange(responsibleSections.filter(s => s !== section));
    } else {
      onResponsibleChange([...responsibleSections, section]);
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
        <div className="space-y-3">
          {ALL_SECTIONS.map((section) => {
            const isSelected = selectedPermissions.includes(section);
            const isResponsible = responsibleSections.includes(section);
            
            return (
              <div key={section} className="flex items-center justify-between space-x-2 p-2 rounded-lg hover:bg-muted/50">
                <div className="flex items-center space-x-2 flex-1">
                  <Checkbox
                    id={section}
                    checked={isSelected}
                    onCheckedChange={(checked) => handleSectionToggle(section, checked as boolean)}
                  />
                  <Label htmlFor={section} className="text-sm font-normal cursor-pointer">
                    {SECTION_LABELS[section]}
                  </Label>
                </div>
                {onResponsibleChange && isSelected && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => handleResponsibleToggle(section)}
                    title={isResponsible ? "Rimuovi come responsabile" : "Imposta come responsabile"}
                  >
                    <Star 
                      className={`h-4 w-4 ${isResponsible ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`}
                    />
                  </Button>
                )}
              </div>
            );
          })}
        </div>
        {onResponsibleChange && (
          <p className="text-xs text-muted-foreground mt-4 pt-4 border-t">
            <Star className="h-3 w-3 inline fill-yellow-400 text-yellow-400 mr-1" />
            Clicca sulla stella per designare l'utente come responsabile della sezione
          </p>
        )}
      </CardContent>
    </Card>
  );
}