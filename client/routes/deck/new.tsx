import { useState } from 'react';
import { DeckEditor } from '#/components/deck/DeckEditor';
import { JobSelector } from '#/components/deck/JobSelector';
import { AppLayout } from '#/components/layout/AppLayout';
import { Job } from '@/types';

export default function DeckNew() {
  const [job, setJob] = useState<Job | null>(null);

  return (
    <AppLayout size={job ? 'lg' : 'md'}>
      <div className="px-3 pb-3">
        {job ? (
          <DeckEditor job={job} />
        ) : (
          <>
            <h1 className="text-center text-2xl my-3 hidden md:block">使用する職業を選択</h1>
            <div className="lg:mt-7 lg:max-w-3xl mx-auto">
              <JobSelector onSelect={setJob} />
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}
