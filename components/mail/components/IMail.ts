
export interface IAttachemnts{
  data?: string | null | undefined;
  size?: number | null | undefined;
  filename?: string;
  mimeType?: string;
  attachmentId?: string;
}

export interface IEmail {
  id: string;
  threadId: string;
  name: string;
  email: string;
  reply: string;
  snippet: string;
  subject: string;
  htmlBody: string;
  textBody: string;
  date: string;
  read: boolean;
  labels: string[];
  attachments?:IAttachemnts[]
}

export interface IThread {
  threadId: string;
  emails: IEmail[];
}

export type IThreads = IThread[];

