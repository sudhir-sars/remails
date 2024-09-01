"use client"
const EMAILS_KEY = 'userEmails';
const DEFAULT_EMAILS = [['Sudhir Saraswat','sudhir.sars@gmail.com'], ['Sudhir saraswat','sudhir.72744@gmail.com']];

export const getEmailsFromLocalStorage = (): string[] => {
  const emails = localStorage.getItem(EMAILS_KEY);
  if (emails) {
    return JSON.parse(emails);
  } else {
    initializeEmailsInLocalStorage()
    return getEmailsFromLocalStorage();
  }
};

const initializeEmailsInLocalStorage = (): void => {
  const emails = localStorage.getItem(EMAILS_KEY);
  if (!emails) {
    localStorage.setItem(EMAILS_KEY, JSON.stringify(DEFAULT_EMAILS));
  }
};
 export const saveEmailToLocalStorage = (email: string): void => {
  const emails = getEmailsFromLocalStorage() ||[];

  if (!emails.includes(email)) {
    emails.push(email);
    localStorage.setItem(EMAILS_KEY, JSON.stringify(emails));
  }
};