interface Email {
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

export const dummyEmail: Email = {
  id: "1900bf21c12c2ad2",
  threadId: "1900bf21c12c2ad2",
  name: "Team Unstop",
  email: "noreply@jobs.unstop.news",
  reply: "noreply@jobs.unstop.news",
  snippet: "Tap here to apply! ",
  subject: "Uber is hiring Engineering freshers!",
  htmlBody: "<p>Welcome to Remail!</p><p>We're excited to introduce our new email client, Remail, designed to streamline your email experience. With Remail, you can manage your emails efficiently and stay organized effortlessly.</p><p>Try out Remail today and discover the difference it can make in managing your inbox!</p>",
  date: "2024-06-12T10:15:34.000Z",
  read: false,
  labels: ["UNREAD", "CATEGORY_UPDATES", "INBOX"]
};
