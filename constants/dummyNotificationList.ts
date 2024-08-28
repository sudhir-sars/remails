type NotificationType = 'admin' | 'gmail' | 'system';

interface INotification {
  id: string; // ID as string to match data
  title: string;
  description: string;
  type: NotificationType;
}

export const notificationsList:INotification[] = [
  {
    id: '1',
    title: 'New admin announcement',
    description: 'Important update for all users',
    type: 'admin',
  },
  {
    id: '2',
    title: 'New email received',
    description: 'You have a new message from John Doe',
    type: 'gmail',
  },
  {
    id: '3',
    title: 'System maintenance',
    description: 'Scheduled downtime on Sunday, 10 PM - 2 AM',
    type: 'system',
  },
  {
    id: '4',
    title: 'Password change alert',
    description: 'Your account password was changed recently',
    type: 'system',
  },
  {
    id: '5',
    title: 'New feature release',
    description: 'Check out our latest feature: Dark Mode',
    type: 'admin',
  },

];