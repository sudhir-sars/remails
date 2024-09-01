import { cookies } from 'next/headers';
import { Suspense } from 'react';
import MailPage from '@/components/mail/MailPage';
import ScaledApp from '@/components/Scaler';
export default function Home() {
  const cookieStore = cookies();

  const layout = cookieStore.get('react-resizable-panels:layout');

  const collapsed = cookieStore.get('react-resizable-panels:collapsed');

  const defaultLayout = layout ? JSON.parse(layout.value) : undefined;

  const defaultCollapsed = collapsed ? JSON.parse(collapsed.value) : undefined;

  return (
    <>
      <Suspense>
        {/* <ScaledApp> */}
        <MailPage
          defaultLayout={defaultLayout}
          defaultCollapsed={defaultCollapsed}
        />
        {/* </ScaledApp> */}
      </Suspense>
    </>
  );
}
