// app/mail/server.tsx
import { cookies } from 'next/headers';
import { Mail } from './components/mail';
import { accounts, mails } from './data';
import MailPage from './components/page';

export default function MailComponent() {
  const cookieStore = cookies();

  const layout = cookieStore.get('react-resizable-panels:layout');

  const collapsed = cookieStore.get('react-resizable-panels:collapsed');

  const defaultLayout = layout ? JSON.parse(layout.value) : undefined;

  const defaultCollapsed = collapsed ? JSON.parse(collapsed.value) : undefined;

  return (
    <span className="z-40 mt-1">
      <MailPage
        defaultLayout={defaultLayout}
        defaultCollapsed={defaultCollapsed}
      />
    </span>
  );
}
