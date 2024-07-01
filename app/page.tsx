import { cookies } from 'next/headers';
import { Suspense } from 'react';
import MailPage from '@/components/mail/MailPage';
export default function Home() {
  const cookieStore = cookies();

  const layout = cookieStore.get('react-resizable-panels:layout');

  const collapsed = cookieStore.get('react-resizable-panels:collapsed');

  const defaultLayout = layout ? JSON.parse(layout.value) : undefined;

  const defaultCollapsed = collapsed ? JSON.parse(collapsed.value) : undefined;

  return (
    <>
      <Suspense>
        <MailPage
          defaultLayout={defaultLayout}
          defaultCollapsed={defaultCollapsed}
        />
      </Suspense>
    </>
  );
}
