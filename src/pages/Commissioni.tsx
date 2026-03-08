import { UserCheck } from "lucide-react";
import { CommissionManager } from '../components/CommissionManager';
import { SectionResponsible } from '@/components/SectionResponsible';
import { SectionRequests } from '@/components/SectionRequests';
import SectionPageLayout from '@/components/shared/SectionPageLayout';
import SectionPageHeader from '@/components/shared/SectionPageHeader';

export default function Commissioni() {
  return (
    <SectionPageLayout bgGradient="bg-gradient-to-br from-pink-50 to-rose-100">
      {() => (
        <>
          <SectionPageHeader
            title="Commissioni"
            subtitle="Gestione commissioni e assegnazione progetti"
            icon={UserCheck}
            iconColor="bg-pink-600"
          />
          <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
            <SectionResponsible section="commissioni" />
            <CommissionManager />
            <SectionRequests section="commissioni" />
          </main>
        </>
      )}
    </SectionPageLayout>
  );
}
