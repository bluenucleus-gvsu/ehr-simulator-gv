'use client';

import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function StartSimulationPage() {
  const router = useRouter();

  const handleStartNewSession = () => {
    // Chart lives at /simulation/[caseId]/[sessionId]/chart/...; real IDs come from course assignments (profile).
    router.push('/user/profile');
  };

  return (
    <div className='h-screen w-full bg-lime-100 flex flex-col gap-4 items-center justify-center'>
      <h1 className='font-bold text-4xl'>Flex<span className='font-normal'>Chart</span></h1>
      <Button onClick={handleStartNewSession}>
        Start New Nursing Scenario
      </Button>
    </div>
  );
}