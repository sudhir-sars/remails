// app/mail/server.tsx
import { cookies } from 'next/headers';
import { Mail } from './components/Mail';
import { accounts, mails } from './data';
import MailPage from './components/page';
import { Suspense } from 'react';

export default function MailComponent() {
  const cookieStore = cookies();

  const layout = cookieStore.get('react-resizable-panels:layout');

  const collapsed = cookieStore.get('react-resizable-panels:collapsed');

  const defaultLayout = layout ? JSON.parse(layout.value) : undefined;

  const defaultCollapsed = collapsed ? JSON.parse(collapsed.value) : undefined;

  return (
    <Suspense>
      <span className="w-full h-full overflow-x-hidden ">
        <MailPage
          defaultLayout={defaultLayout}
          defaultCollapsed={defaultCollapsed}
        />
      </span>
    </Suspense>
  );
}
