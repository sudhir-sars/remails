export interface IEmail {
  id: string;
  threadId: string;
  name: string;
  email: string;
  reply: string;
  snippet: string;
  subject: string;
  htmlBody: string;
  date: string;
  read: boolean;
  labels: string[];
}

export interface IThread {
  threads: IEmail[];
}

export type IThreads = IThread[];
