export type IFrontendLabel = 
  | "chat" | "sent" | "inbox" | "important" | "trash" | "draft" | "spam"
  | "forums" | "updates" | "personal" | "promotions" | "social" | "starred" | "unread";

  type IGmailApiLabelItems = 
  | "CHAT" | "SENT" | "INBOX" | "IMPORTANT" | "TRASH" | "DRAFT" | "SPAM"
  | "CATEGORY_FORUMS" | "CATEGORY_UPDATES" | "CATEGORY_PERSONAL" | "CATEGORY_PROMOTIONS" | "CATEGORY_SOCIAL"
  | "STARRED" | "UNREAD";
export type ISystemLabels = 
  | "CHAT" | "SENT" | "INBOX" | "IMPORTANT" | "TRASH" | "DRAFT" | "SPAM"
  | "CATEGORY_FORUMS" | "CATEGORY_UPDATES" | "CATEGORY_PERSONAL" | "CATEGORY_PROMOTIONS" | "CATEGORY_SOCIAL"
  | "STARRED" | "UNREAD";
import { IEmail } from "@/components/mail/components/IMail";
import { IEmails } from "@/components/mail/components/IMail";


  export type  ILabelData= {
    userId: string;
    label: IUserLabels;
  }

// export type  IMailsWithFilter ={
//   [key: string]: IEmails;
// }
export type ICategoryAttributes= {

  labelId:string
    pageToken: string | undefined;
    initialFetched: 'notFetched'|'fetched';
    lastFetchedPage:number;
    totalEmails:number
  
  }
export type IFetchDataHistory = {
  [key: string]: ICategoryAttributes;
};


export type IGmailApiLabel = (IGmailApiLabelItems | string)[];


export interface IUserLabels {
  labelId: string;
  title: string;
  personalEmails: string[];
  domainEmails: string[];
  icon: string;
  fallback: boolean;
}



export type  ICreateLabelApiRes ={
  success: boolean;
  message?: string;
  error?: string;
  response?: any;
}
export type  IUserData ={
  userId:string
  success: boolean;
  email?: string;
  error?: string;
  response?: any;
}
