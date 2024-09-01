
export interface IAttachemnts{
  data?: string | null | undefined;
  size?: number | null | undefined;
  filename?: string;
  mimeType?: string;
  attachmentId?: string;
}
export interface IHyperxMessage {
  type: 'user' | 'ai';
  content: string;
  queryType?: string;
  emailData?: IEmails;
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
  attachments:IAttachemnts[]
}
export type IEmails=IEmail[]

export type IEmailsObject = {
  [key: string]: IEmail;
};

export type IMailsWithFilter = {
  [key: string]: IEmailsObject;
};


import { Document } from 'mongoose';

export interface IAddress extends Document {
  name: string;
  email: string;
}
