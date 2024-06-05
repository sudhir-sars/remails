// mailList.ts
interface Mail {
  id: string;
  sender: string;
  subject: string;
  content: string;
  date: Date;
  read: boolean;
  tag: string;
}


const defaultMailItem :Mail={
    id: '999',
    sender: "Remails Team",
    subject: "Welcome to Remails!",
    content: "Dear User,\n\nWelcome to Remails! We're thrilled to have you on board.\n\nAs the creator of Remails, I want to personally thank you for choosing our platform. Our team has worked hard to develop an intuitive and efficient email client that meets your needs.\n\nIf you have any questions, feedback, or suggestions, feel free to reach out to us. We're here to help!\n\nWishing you a productive and enjoyable experience with Remails.\n\nBest regards,\nThe Remails Team",
    date: new Date("2024-06-01T10:00:00"),
    read: false,
    tag: 'Inbox'
  
}
const mailList: Mail[] = [
    
    {
      id: "0",
      sender: "Alice Johnson",
      subject: "Meeting Reminder",
      content: "Hi Team,\nJust a reminder about the meeting scheduled for tomorrow at 10 AM.\nPlease be on time.\nThanks! \n\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Sed gravida nunc eget justo ullamcorper, sed rhoncus odio pretium. Vivamus quis nisi nec ex vehicula tempus. Morbi interdum velit sit amet magna tempus tristique. Sed at lacus non ligula tristique volutpat. Quisque porta semper ligula, nec fermentum nibh tincidunt at. Cras at est risus. Vestibulum tincidunt euismod nunc, sit amet congue neque mattis nec. Maecenas tempor condimentum ipsum, a mattis odio. Fusce tincidunt tellus ac justo scelerisque, in bibendum neque dictum. Aenean id risus ac leo mattis ultricies. Nulla ac ultrices mi. Sed auctor nulla nec vehicula cursus. In vitae mauris sit amet felis lobortis lobortis sit amet at dui.",
      date: new Date("2024-06-01T10:00:00"),
      read: true,
      tag: "Inbox"
    },
  {
    id: '1',
    sender: "Alice Johnson",
    subject: "Meeting Reminder",
    content: "Hi Team,\nJust a reminder about the meeting scheduled for tomorrow at 10 AM.\nPlease be on time.\nThanks!",
    date: new Date("2024-06-01T10:00:00"),
    read: true,
    tag: 'Inbox'
  },
  {
    id: '2',
    sender: "Bob Smith",
    subject: "Project Update",
    content: "Hello,\nThe project is on track and we are making good progress.\nThe next milestone is due next week.\nBest regards.",
    date: new Date("2024-06-02T14:30:00"),
    read: false,
    tag: 'Sent'
  },
  {
    id: '3',
    sender: "Carol White",
    subject: "Vacation Request",
    content: "Dear HR,\nI would like to request vacation time from July 1st to July 15th.\nPlease let me know if this is approved.\nThank you!",
    date: new Date("2024-06-03T08:45:00"),
    read: true,
    tag: 'Drafts'
  },
  {
    id: '4',
    sender: "David Brown",
    subject: "Invoice Attached",
    content: "Hi,\nPlease find the attached invoice for the recent purchase.\nLet me know if you have any questions.\nBest regards.",
    date: new Date("2024-06-04T16:20:00"),
    read: false,
    tag: 'Junk'
  },
  {
    id: '5',
    sender: "Eve Davis",
    subject: "Team Outing",
    content: "Hello Team,\nWe are planning a team outing next month.\nPlease suggest any preferred dates.\nLooking forward to it!",
    date: new Date("2024-06-05T11:10:00"),
    read: true,
    tag: 'Trash'
  },
  {
    id: '6',
    sender: "Frank Miller",
    subject: "New Policy Update",
    content: "Dear All,\nPlease be informed of the new company policy on remote work.\nDetails are attached.\nRegards, HR.",
    date: new Date("2024-06-06T09:30:00"),
    read: false,
    tag: 'Archive'
  },
  {
    id: '7',
    sender: "Grace Wilson",
    subject: "Client Feedback",
    content: "Hi Team,\nWe received some feedback from the client.\nPlease review and let me know your thoughts.\nThanks!",
    date: new Date("2024-06-07T13:45:00"),
    read: true,
    tag: 'Inbox'
  },
  {
    id: '8',
    sender: "Hannah Lee",
    subject: "Lunch Meeting",
    content: "Hi,\nCan we reschedule our lunch meeting to next Tuesday?\nThanks!",
    date: new Date("2024-06-08T12:00:00"),
    read: false,
    tag: 'Sent'
  },
  {
    id: '9',
    sender: "Ivan Harris",
    subject: "Weekly Report",
    content: "Hello,\nPlease find the weekly report attached.\nBest regards.",
    date: new Date("2024-06-09T15:00:00"),
    read: true,
    tag: 'Drafts'
  },
  {
    id: '10',
    sender: "Jackie Clark",
    subject: "Event Invitation",
    content: "Dear Team,\nYou are invited to our annual event.\nPlease RSVP.\nThank you!",
    date: new Date("2024-06-10T18:00:00"),
    read: false,
    tag: 'Junk'
  },
  {
    id: '11',
    sender: "Karl Young",
    subject: "Follow-Up",
    content: "Hi,\nJust following up on our last conversation.\nPlease get back to me when you can.\nBest.",
    date: new Date("2024-06-11T11:30:00"),
    read: true,
    tag: 'Trash'
  },
  {
    id: '12',
    sender: "Laura Green",
    subject: "Document Review",
    content: "Hi,\nCould you please review the attached document and provide your feedback?\nThanks!",
    date: new Date("2024-06-12T14:15:00"),
    read: false,
    tag: 'Archive'
  },
  {
    id: '13',
    sender: "Michael Brown",
    subject: "Meeting Reschedule",
    content: "Hi Team,\nThe meeting scheduled for tomorrow has been rescheduled to next week.\nPlease update your calendars.\nThanks!",
    date: new Date("2024-06-13T09:00:00"),
    read: true,
    tag: 'Inbox'
  },
  {
    id: '14',
    sender: "Nancy Wilson",
    subject: "Client Meeting Notes",
    content: "Hi,\nPlease find the meeting notes attached.\nBest regards.",
    date: new Date("2024-06-14T10:45:00"),
    read: false,
    tag: 'Sent'
  },
  {
    id: '15',
    sender: "Oliver Smith",
    subject: "Contract Update",
    content: "Dear Team,\nThe contract has been updated.\nPlease review the changes.\nThanks!",
    date: new Date("2024-06-15T13:00:00"),
    read: true,
    tag: 'Drafts'
  },
  {
    id: '16',
    sender: "Paul Jones",
    subject: "Urgent: Action Required",
    content: "Hi,\nPlease take immediate action on the attached request.\nThank you.",
    date: new Date("2024-06-16T08:30:00"),
    read: false,
    tag: 'Junk'
  },
  {
    id: '17',
    sender: "Quincy Brown",
    subject: "System Update",
    content: "Hello,\nThere will be a system update this weekend.\nPlease save your work.\nRegards.",
    date: new Date("2024-06-17T17:00:00"),
    read: true,
    tag: 'Trash'
  },
  {
    id: '18',
    sender: "Rachel Adams",
    subject: "Team Meeting Agenda",
    content: "Hi Team,\nPlease find the agenda for the upcoming team meeting attached.\nThanks!",
    date: new Date("2024-06-18T09:45:00"),
    read: false,
    tag: 'Archive'
  },
  {
    id: '19',
    sender: "Samuel Roberts",
    subject: "Budget Approval",
    content: "Hi,\nThe budget has been approved.\nPlease proceed with the next steps.\nThanks.",
    date: new Date("2024-06-19T14:00:00"),
    read: true,
    tag: 'Inbox'
  },
  {
    id: '20',
    sender: "Tina Turner",
    subject: "Product Launch",
    content: "Dear All,\nWe are excited to announce the launch of our new product.\nPlease find the details attached.\nBest regards.",
    date: new Date("2024-06-20T16:30:00"),
    read: false,
    tag: 'Sent'
  },
  {
    id: '21',
    sender: "Uma Patel",
    subject: "Workshop Invitation",
    content: "Hi,\nYou are invited to a workshop on the new software.\nPlease RSVP.\nThanks.",
    date: new Date("2024-06-21T11:15:00"),
    read: true,
    tag: 'Drafts'
  },
  {
    id: '22',
    sender: "Victor Chen",
    subject: "Job Application",
    content: "Hello,\nPlease find my job application attached.\nThank you for your consideration.\nBest regards.",
    date: new Date("2024-06-22T14:45:00"),
    read: false,
    tag: 'Junk'
  },
  {
    id: '23',
    sender: "Wendy Green",
    subject: "Project Plan",
    content: "Hi Team,\nPlease review the project plan and provide your feedback.\nThanks.",
    date: new Date("2024-06-23T10:00:00"),
    read: true,
    tag: 'Trash'
  },
  {
    id: '24',
    sender: "Xavier Lewis",
    subject: "Account Update",
    content: "Hi,\nYour account has been updated.\nPlease review the changes.\nThanks.",
    date: new Date("2024-06-24T12:30:00"),
    read: false,
    tag: 'Archive'
  },
  {
    id: '25',
    sender: "Yvonne Scott",
    subject: "Team Building Activity",
    content: "Hello Team,\nWe have planned a team building activity for next month.\nPlease join us!\nRegards.",
    date: new Date("2024-06-25T09:15:00"),
    read: true,
    tag: 'Inbox'
  },
  {
    id: '26',
    sender: "Zachary King",
    subject: "New Hire Orientation",
    content: "Hi,\nWelcome to the team!\nPlease find the orientation schedule attached.\nBest regards.",
    date: new Date("2024-06-26T13:30:00"),
    read: false,
    tag: 'Sent'
  },
  {
    id: '27',
    sender: "Amy White",
    subject: "Performance Review",
    content: "Dear Team,\nPlease complete your performance review by the end of the month.\nThank you!",
    date: new Date("2024-06-27T15:45:00"),
    read: true,
    tag: 'Drafts'
  },
  {
    id: '28',
    sender: "Brian Clark",
    subject: "Expense Report",
    content: "Hi,\nPlease find the expense report attached.\nLet me know if you have any questions.\nThanks.",
    date: new Date("2024-06-28T11:00:00"),
    read: false,
    tag: 'Junk'
  },
  {
    id: '29',
    sender: "Catherine Lee",
    subject: "Meeting Confirmation",
    content: "Hi,\nThis is a confirmation for our meeting next week.\nPlease let me know if there are any changes.\nThanks!",
    date: new Date("2024-06-29T14:20:00"),
    read: true,
    tag: 'Trash'
  },
  {
    id: '30',
    sender: "Daniel Garcia",
    subject: "Training Session",
    content: "Hello,\nPlease attend the training session scheduled for this Friday.\nDetails are attached.\nBest regards.",
    date: new Date("2024-06-30T09:40:00"),
    read: false,
    tag: 'Archive'
  },
  {
    id: '31',
    sender: "Elena Martinez",
    subject: "Feedback Request",
    content: "Hi,\nCould you please provide feedback on the attached document?\nThank you.",
    date: new Date("2024-07-01T11:50:00"),
    read: true,
    tag: 'Inbox'
  },
  {
    id: '32',
    sender: "Felix Lopez",
    subject: "Holiday Schedule",
    content: "Dear All,\nPlease find the holiday schedule for this year attached.\nRegards, HR.",
    date: new Date("2024-07-02T16:10:00"),
    read: false,
    tag: 'Sent'
  },
  {
    id: '33',
    sender: "Gabriella Hernandez",
    subject: "Policy Update",
    content: "Hi,\nThere has been an update to our company policy.\nPlease review the attached document.\nThanks.",
    date: new Date("2024-07-03T09:05:00"),
    read: true,
    tag: 'Drafts'
  },
  {
    id: '34',
    sender: "Henry Davis",
    subject: "System Downtime",
    content: "Hello,\nPlease note that the system will be down for maintenance this weekend.\nRegards.",
    date: new Date("2024-07-04T14:25:00"),
    read: false,
    tag: 'Junk'
  },
  {
    id: '35',
    sender: "Isabella Thompson",
    subject: "Project Proposal",
    content: "Hi,\nPlease find the project proposal attached.\nLooking forward to your feedback.\nBest regards.",
    date: new Date("2024-07-05T10:30:00"),
    read: true,
    tag: 'Trash'
  },
  {
    id: '36',
    sender: "James White",
    subject: "Weekly Update",
    content: "Hello Team,\nPlease find the weekly update attached.\nBest regards.",
    date: new Date("2024-07-06T13:10:00"),
    read: false,
    tag: 'Archive'
  },
  {
    id: '37',
    sender: "Karen Allen",
    subject: "Thank You",
    content: "Hi,\nThank you for your support on the recent project.\nGreat job, everyone!\nRegards.",
    date: new Date("2024-07-07T15:20:00"),
    read: true,
    tag: 'Inbox'
  },
  {
    id: '38',
    sender: "Leon Scott",
    subject: "Client Meeting",
    content: "Hi,\nPlease prepare for the client meeting next week.\nDetails are attached.\nThanks.",
    date: new Date("2024-07-08T09:50:00"),
    read: false,
    tag: 'Sent'
  },
  {
    id: '39',
    sender: "Mia Clark",
    subject: "Conference Details",
    content: "Hello,\nPlease find the details for the upcoming conference attached.\nBest regards.",
    date: new Date("2024-07-09T12:15:00"),
    read: true,
    tag: 'Drafts'
  },
  {
    id: '40',
    sender: "Noah Walker",
    subject: "Annual Report",
    content: "Hi Team,\nPlease review the annual report and provide your feedback.\nThanks!",
    date: new Date("2024-07-10T14:40:00"),
    read: false,
    tag: 'Junk'
  },
  {
    id: '41',
    sender: "Alice Walker",
    subject: "Project Deadline",
    content: "Hi Team,\nJust a reminder that the project deadline is next Monday.\nPlease ensure all tasks are completed.\nBest regards.",
    date: new Date("2024-07-11T10:00:00"),
    read: false,
    tag: 'Inbox'
  },
  {
    id: '42',
    sender: "Bob Johnson",
    subject: "New Assignment",
    content: "Hello,\nYou have been assigned a new task.\nPlease check the details and start working on it.\nThanks.",
    date: new Date("2024-07-12T11:30:00"),
    read: true,
    tag: 'Sent'
  },
  {
    id: '43',
    sender: "Carol Lewis",
    subject: "Meeting Notes",
    content: "Hi,\nPlease find the meeting notes attached.\nLet me know if you have any questions.\nRegards.",
    date: new Date("2024-07-13T08:45:00"),
    read: false,
    tag: 'Drafts'
  },
  {
    id: '44',
    sender: "David Johnson",
    subject: "Monthly Report",
    content: "Hello Team,\nPlease review the monthly report attached.\nThanks!",
    date: new Date("2024-07-14T16:20:00"),
    read: true,
    tag: 'Junk'
  },
  {
    id: '45',
    sender: "Eve Martin",
    subject: "Holiday Request",
    content: "Dear HR,\nI would like to request a holiday from August 1st to August 10th.\nPlease let me know if this is approved.\nThanks.",
    date: new Date("2024-07-15T11:10:00"),
    read: false,
    tag: 'Trash'
  },
  {
    id: '46',
    sender: "Frank Clark",
    subject: "Policy Change",
    content: "Dear All,\nPlease be informed of the new policy changes effective next month.\nDetails are attached.\nBest regards.",
    date: new Date("2024-07-16T09:30:00"),
    read: true,
    tag: 'Archive'
  },
  {
    id: '47',
    sender: "Grace Adams",
    subject: "Client Feedback",
    content: "Hi Team,\nWe have received some feedback from the client.\nPlease review and let me know your thoughts.\nThanks.",
    date: new Date("2024-07-17T13:45:00"),
    read: false,
    tag: 'Inbox'
  },
  {
    id: '48',
    sender: "Hannah Harris",
    subject: "Rescheduled Meeting",
    content: "Hi,\nCan we reschedule our meeting to next Wednesday?\nThanks!",
    date: new Date("2024-07-18T12:00:00"),
    read: true,
    tag: 'Sent'
  },
  {
    id: '49',
    sender: "Ivan Roberts",
    subject: "Project Plan",
    content: "Hello,\nPlease review the project plan and provide your feedback.\nBest regards.",
    date: new Date("2024-07-19T15:00:00"),
    read: false,
    tag: 'Drafts'
  },
  {
    id: '50',
    sender: "Jackie Scott",
    subject: "Invitation to Event",
    content: "Dear Team,\nYou are invited to our annual event.\nPlease RSVP.\nThank you!",
    date: new Date("2024-07-20T18:00:00"),
    read: true,
    tag: 'Junk'
  },
  {
    id: '51',
    sender: "Karl Young",
    subject: "Follow-Up",
    content: "Hi,\nJust following up on our last conversation.\nPlease get back to me when you can.\nBest regards.",
    date: new Date("2024-07-21T11:30:00"),
    read: false,
    tag: 'Trash'
  },
  {
    id: '52',
    sender: "Laura Green",
    subject: "Document Review",
    content: "Hi,\nCould you please review the attached document and provide your feedback?\nThanks.",
    date: new Date("2024-07-22T14:15:00"),
    read: true,
    tag: 'Archive'
  },
  {
    id: '53',
    sender: "Michael Brown",
    subject: "Meeting Rescheduled",
    content: "Hi Team,\nThe meeting scheduled for tomorrow has been rescheduled to next week.\nPlease update your calendars.\nThanks!",
    date: new Date("2024-07-23T09:00:00"),
    read: false,
    tag: 'Inbox'
  },
  {
    id: '54',
    sender: "Nancy Wilson",
    subject: "Client Meeting Notes",
    content: "Hi,\nPlease find the meeting notes attached.\nBest regards.",
    date: new Date("2024-07-24T10:45:00"),
    read: true,
    tag: 'Sent'
  },
  {
    id: '55',
    sender: "Oliver Smith",
    subject: "Contract Update",
    content: "Dear Team,\nThe contract has been updated.\nPlease review the changes.\nThanks!",
    date: new Date("2024-07-25T13:00:00"),
    read: false,
    tag: 'Drafts'
  },
  {
    id: '56',
    sender: "Paul Jones",
    subject: "Urgent: Action Required",
    content: "Hi,\nPlease take immediate action on the attached request.\nThank you.",
    date: new Date("2024-07-26T08:30:00"),
    read: true,
    tag: 'Junk'
  },
  {
    id: '57',
    sender: "Quincy Brown",
    subject: "System Update",
    content: "Hello,\nThere will be a system update this weekend.\nPlease save your work.\nRegards.",
    date: new Date("2024-07-27T17:00:00"),
    read: false,
    tag: 'Trash'
  },
  {
    id: '58',
    sender: "Rachel Adams",
    subject: "Team Meeting Agenda",
    content: "Hi Team,\nPlease find the agenda for the upcoming team meeting attached.\nThanks!",
    date: new Date("2024-07-28T09:45:00"),
    read: true,
    tag: 'Archive'
  },
  {
    id: '59',
    sender: "Samuel Roberts",
    subject: "Budget Approval",
    content: "Hi,\nThe budget has been approved.\nPlease proceed with the next steps.\nThanks.",
    date: new Date("2024-07-29T14:00:00"),
    read: false,
    tag: 'Inbox'
  },
  {
    id: '60',
    sender: "Tina Turner",
    subject: "Product Launch",
    content: "Dear All,\nWe are excited to announce the launch of our new product.\nPlease find the details attached.\nBest regards.",
    date: new Date("2024-07-30T16:30:00"),
    read: true,
    tag: 'Sent'
  },
  {
    id: '61',
    sender: "Uma Patel",
    subject: "Workshop Invitation",
    content: "Hi,\nYou are invited to a workshop on the new software.\nPlease RSVP.\nThanks.",
    date: new Date("2024-07-31T11:15:00"),
    read: false,
    tag: 'Drafts'
  },
  {
    id: '62',
    sender: "Victor Chen",
    subject: "Job Application",
    content: "Hello,\nPlease find my job application attached.\nThank you for your consideration.\nBest regards.",
    date: new Date("2024-08-01T14:45:00"),
    read: true,
    tag: 'Junk'
  },
  {
    id: '63',
    sender: "Wendy Green",
    subject: "Project Plan",
    content: "Hi Team,\nPlease review the project plan and provide your feedback.\nThanks.",
    date: new Date("2024-08-02T10:00:00"),
    read: false,
    tag: 'Trash'
  },
  {
    id: '64',
    sender: "Xavier Lewis",
    subject: "Account Update",
    content: "Hi,\nYour account has been updated.\nPlease review the changes.\nThanks.",
    date: new Date("2024-08-03T12:30:00"),
    read: true,
    tag: 'Archive'
  },
  {
    id: '65',
    sender: "Yvonne Scott",
    subject: "Team Building Activity",
    content: "Hello Team,\nWe have planned a team building activity for next month.\nPlease join us!\nRegards.",
    date: new Date("2024-08-04T09:15:00"),
    read: false,
    tag: 'Inbox'
  },
  {
    id: '66',
    sender: "Zachary King",
    subject: "New Hire Orientation",
    content: "Hi,\nWelcome to the team!\nPlease find the orientation schedule attached.\nBest regards.",
    date: new Date("2024-08-05T13:30:00"),
    read: true,
    tag: 'Sent'
  },
  {
    id: '67',
    sender: "Amy White",
    subject: "Performance Review",
    content: "Dear Team,\nPlease complete your performance review by the end of the month.\nThank you!",
    date: new Date("2024-08-06T15:45:00"),
    read: false,
    tag: 'Drafts'
  },
  {
    id: '68',
    sender: "Brian Clark",
    subject: "Expense Report",
    content: "Hi,\nPlease find the expense report attached.\nLet me know if you have any questions.\nThanks.",
    date: new Date("2024-08-07T11:00:00"),
    read: true,
    tag: 'Junk'
  },
  {
    id: '69',
    sender: "Catherine Lee",
    subject: "Meeting Confirmation",
    content: "Hi,\nThis is a confirmation for our meeting next week.\nPlease let me know if there are any changes.\nThanks!",
    date: new Date("2024-08-08T14:20:00"),
    read: false,
    tag: 'Trash'
  },
  {
    id: '70',
    sender: "Daniel Garcia",
    subject: "Training Session",
    content: "Hello,\nPlease attend the training session scheduled for this Friday.\nDetails are attached.\nBest regards.",
    date: new Date("2024-08-09T09:40:00"),
    read: true,
    tag: 'Archive'
  },
  {
    id: '71',
    sender: "Elena Martinez",
    subject: "Feedback Request",
    content: "Hi,\nCould you please provide feedback on the attached document?\nThank you.",
    date: new Date("2024-08-10T11:50:00"),
    read: false,
    tag: 'Inbox'
  },
  {
    id: '72',
    sender: "Felix Lopez",
    subject: "Holiday Schedule",
    content: "Dear All,\nPlease find the holiday schedule for this year attached.\nRegards, HR.",
    date: new Date("2024-08-11T16:10:00"),
    read: true,
    tag: 'Sent'
  },
  {
    id: '73',
    sender: "Gabriella Hernandez",
    subject: "Policy Update",
    content: "Hi,\nThere has been an update to our company policy.\nPlease review the attached document.\nThanks.",
    date: new Date("2024-08-12T09:05:00"),
    read: false,
    tag: 'Drafts'
  },
  {
    id: '74',
    sender: "Henry Davis",
    subject: "System Downtime",
    content: "Hello,\nPlease note that the system will be down for maintenance this weekend.\nRegards.",
    date: new Date("2024-08-13T14:25:00"),
    read: true,
    tag: 'Junk'
  },
  {
    id: '75',
    sender: "Isabella Thompson",
    subject: "Project Proposal",
    content: "Hi,\nPlease find the project proposal attached.\nLooking forward to your feedback.\nBest regards.",
    date: new Date("2024-08-14T10:30:00"),
    read: false,
    tag: 'Trash'
  },
  {
    id: '76',
    sender: "James White",
    subject: "Weekly Update",
    content: "Hello Team,\nPlease find the weekly update attached.\nBest regards.",
    date: new Date("2024-08-15T13:10:00"),
    read: true,
    tag: 'Archive'
  },
  {
    id: '77',
    sender: "Karen Allen",
    subject: "Thank You",
    content: "Hi,\nThank you for your support on the recent project.\nGreat job, everyone!\nRegards.",
    date: new Date("2024-08-16T15:20:00"),
    read: false,
    tag: 'Inbox'
  },
  {
    id: '78',
    sender: "Leon Scott",
    subject: "Client Meeting",
    content: "Hi,\nPlease prepare for the client meeting next week.\nDetails are attached.\nThanks.",
    date: new Date("2024-08-17T09:50:00"),
    read: true,
    tag: 'Sent'
  },
  {
    id: '79',
    sender: "Mia Clark",
    subject: "Conference Details",
    content: "Hello,\nPlease find the details for the upcoming conference attached.\nBest regards.",
    date: new Date("2024-08-18T12:15:00"),
    read: false,
    tag: 'Drafts'
  },
  {
    id: '80',
    sender: "Noah Walker",
    subject: "Annual Report",
    content: "Hi Team,\nPlease review the annual report and provide your feedback.\nThanks!",
    date: new Date("2024-08-19T14:40:00"),
    read: true,
    tag: 'Junk'
  },
];




const NavComponents = {
  Default: mailList.filter(mail => mail.id === "999"),
  Inbox: mailList.filter(mail => mail.tag === 'Inbox'),
  Sent: mailList.filter(mail => mail.tag === 'Sent'),
  Drafts: mailList.filter(mail => mail.tag === 'Drafts'),
  Junk: mailList.filter(mail => mail.tag === 'Junk'),
  Trash: mailList.filter(mail => mail.tag === 'Trash'),
  Archive: mailList.filter(mail => mail.tag === 'Archive'),
  Spam: mailList.filter(mail => mail.tag === 'Spam'),
  Unread: mailList.filter(mail => mail.tag === 'Unread')
};

export type NavComponentKeys = keyof typeof NavComponents;
export { NavComponents ,defaultMailItem};
