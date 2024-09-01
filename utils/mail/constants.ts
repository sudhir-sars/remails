import { IFrontendLabel, ISystemLabels } from "./types";
import { IFetchDataHistory } from "./types";



  export type ISysLabel = 
  | 'CHAT'
  | 'SENT'
  | 'INBOX'
  | 'IMPORTANT'
  | 'TRASH'
  | 'DRAFT'
  | 'SPAM'
  | 'CATEGORY_FORUMS'
  | 'CATEGORY_UPDATES'
  | 'CATEGORY_PERSONAL'
  | 'CATEGORY_PROMOTIONS'
  | 'CATEGORY_SOCIAL'
  | 'STARRED'
  | 'UNREAD';




const sysLabels: ReadonlyArray<ISysLabel> = [
  'CHAT',
  'SENT',
  'INBOX',
  'IMPORTANT',
  'TRASH',
  'DRAFT',
  'SPAM',
  'CATEGORY_FORUMS',
  'CATEGORY_UPDATES',
  'CATEGORY_PERSONAL',
  'CATEGORY_PROMOTIONS',
  'CATEGORY_SOCIAL',
  'STARRED',
  'UNREAD'
];

export function isSysLabel(label: string): label is ISysLabel {

  return sysLabels.includes(label as ISysLabel);
}

