import { Send, ShieldAlert, ShieldOff, Megaphone, Rss, UsersRound, Star, LucideIcon } from 'lucide-react';
import { UserRound } from 'lucide-react';
interface LabelIconsMapping {
  [key: string]: LucideIcon;
}



const labelIconsMapping: LabelIconsMapping = {
  'IMPORTANT': ShieldAlert,
  'SENT': Send,
  'STARRED': Star,
  'PRIMARY': ShieldAlert,
  'CATEGORY_PERSONAL': Megaphone,

  'CATEGORY_SOCIAL': UsersRound,
  'CATEGORY_UPDATES': Rss,
  'CATEGORY_PROMOTIONS': Megaphone,
};

export  {labelIconsMapping};
