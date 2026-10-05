import { SurgicalDashboard } from '@/components/surgical/SurgicalDashboard';
import { PasswordGate } from '@/components/PasswordGate';

const Index = () => {
  return (
    <PasswordGate>
      <SurgicalDashboard />
    </PasswordGate>
  );
};

export default Index;
