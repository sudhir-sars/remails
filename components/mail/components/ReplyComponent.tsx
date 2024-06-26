// 'use client';

// import dynamic from 'next/dynamic';
// import 'react-quill/dist/quill.snow.css';

// import { IoIosClose } from 'react-icons/io';
// import { ScrollArea } from '@/components/ui/scroll-area';

// import AddPeople from './compose mail/AddPeople';
// import FloatingToolBar from './compose mail/FloatingToolBar';
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from '@/components/ui/dropdown-menu';
// import { FaAngleDown } from 'react-icons/fa';
// import { addMinutes, addDays, format } from 'date-fns';
// import React, { useEffect, useState, useRef } from 'react';
// import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
// import { IEmail } from './IMail';
// import { IoClose } from 'react-icons/io5';
// import { MdOutlineModeEditOutline } from 'react-icons/md';
// import { Button } from '@/components/ui/button';
// import TextEditor from './TextEditor';
// import { IoCloseOutline } from 'react-icons/io5';
// import { FiMaximize2 } from 'react-icons/fi';
// import { VscChromeMinimize } from 'react-icons/vsc';
// import { error } from 'console';
// import { BsArrowsCollapse } from 'react-icons/bs';

// // interface MailDisplayProps {
// //   mail: IEmail;
// //   setReply: (item: boolean) => void;
// //   fullView: boolean;
// //   setFullView: (item: boolean) => void;
// // }

// export function ReplyComponent({ mail }) {
//   const [addCc, setAddCc] = useState(false);
//   const [ccInputValue, setCcInputValue] = useState('');
//   const [ccList, setCcList] = useState<Set<string>>(new Set());

//   const [addBcc, setAddBcc] = useState(false);
//   const [bccList, setBccList] = useState<Set<string>>(new Set());
//   const [bccInputValue, setBccInputValue] = useState('');

//   const [addSubject, setAddSubject] = useState(false);
//   const [subject, setSubject] = useState(mail.subject);
//   const [subjectInputValue, setSubjectInputValue] = useState('');
//   const [toList, setToList] = useState<Set<string>>(new Set());

//   const [addTo, setAddTo] = useState(false);
//   const [to, setTo] = useState(mail.reply);
//   const [toInputValue, setToInputValue] = useState('');

//   const [isSendButtonActive, setIsSendButtonActive] = useState(false);

//   const [scheduleTime, setScheduleTime] = useState<Date | null>(null);
//   const [isScheduled, setIsScheduled] = useState<boolean>(false);

//   const [editorHtml, setEditorHtml] = useState('');
//   const editorRef = useRef<HTMLDivElement>(null);

//   const [fontStyle, setFontStyle] = useState('Inter');
//   const [fontWeight, setFontWeight] = useState('Medium');
//   const [lineSpacing, setLineSpacing] = useState(1.5);
//   const [letterSpacing, setLetterSpacing] = useState(0.4);
//   const [fontSize, setFontSize] = useState(14);
//   const [fontColor, setFontColor] = useState('7ec4b7');
//   const [opacity, setOpacity] = useState(100);

//   const addToToList = () => {
//     setToList((pre) => new Set([...Array.from(pre), to]));
//   };

//   React.useEffect(() => {
//     addToToList();
//   }, []);

//   const resetStylesToDefault = () => {
//     setFontStyle('Arial');
//     setFontWeight('Normal');
//     setLineSpacing(1.0);
//     setLetterSpacing(0.3);
//     setFontColor('000000');
//     setFontSize(12);
//     setOpacity(100);
//     console.log('Styles reset to default');
//   };
//   const applyStyleNaively = (styleProps: { [key: string]: string }) => {
//     const selection = window.getSelection();
//     if (!selection || selection.rangeCount === 0) return;

//     const range = selection.getRangeAt(0);
//     const startNode = range.startContainer;

//     const findParentSpanOrDiv = (node: Node): HTMLElement | null => {
//       while (node && node !== document.body) {
//         if (
//           node.nodeType === Node.ELEMENT_NODE &&
//           (node.nodeName === 'SPAN' || node.nodeName === 'DIV')
//         ) {
//           return node as HTMLElement;
//         }
//         node = node.parentNode!;
//       }
//       return null;
//     };

//     const applyStyleToElement = (
//       element: HTMLElement,
//       styleProps: { [key: string]: string }
//     ) => {
//       Object.assign(element.style, styleProps);

//       const applyStyleToChildNodes = (parent: HTMLElement) => {
//         const childNodes = parent.querySelectorAll('*');
//         childNodes.forEach((child) => {
//           if (child instanceof HTMLElement) {
//             Object.assign(child.style, styleProps);
//           }
//         });
//       };

//       applyStyleToChildNodes(element);
//     };

//     const wrapTextInDiv = (node: Node) => {
//       const div = document.createElement('div');
//       div.textContent = node.textContent || '';
//       Object.assign(div.style, styleProps);
//       node.parentNode?.replaceChild(div, node);
//       return div;
//     };

//     const parentElement = findParentSpanOrDiv(startNode);
//     if (parentElement) {
//       applyStyleToElement(parentElement, styleProps);
//     } else if (startNode.nodeType === Node.TEXT_NODE) {
//       wrapTextInDiv(startNode);
//     }

//     if (editorRef.current) {
//       setEditorHtml(editorRef.current.innerHTML);
//     }
//   };

//   const handleToolBarButtonClick = (command: string, value?: any) => {
//     if (editorRef.current) {
//       editorRef.current.focus();
//       switch (command) {
//         case 'bold':
//           applyStyleNaively({ fontWeight: 'bold' });
//           break;
//         case 'italic':
//           applyStyleNaively({ fontStyle: 'italic' });
//           break;
//         case 'underline':
//           applyStyleNaively({ textDecoration: 'underline' });
//           break;
//         case 'justifyLeft':
//         case 'justifyCenter':
//         case 'justifyRight':
//           applyStyleNaively({
//             textAlign: command.replace('justify', '').toLowerCase(),
//           });
//           break;
//         case 'applyFontStyle':
//           applyStyleNaively({ fontFamily: value });

//           setFontStyle(value);
//           break;
//         case 'applyFontWeight':
//           applyStyleNaively({ fontWeight: value.toLowerCase() });
//           setFontWeight(value);
//           break;
//         case 'applyFontSize':
//           applyStyleNaively({ fontSize: `${value}px` });
//           setFontSize(value);
//           break;
//         case 'applyLineSpacing':
//           applyStyleNaively({ lineHeight: value });
//           setLineSpacing(value);
//           break;
//         case 'applyLetterSpacing':
//           applyStyleNaively({ letterSpacing: `${value}rem` });
//           setLetterSpacing(value);
//           break;
//         case 'applyFontColor':
//           applyStyleNaively({ color: `#${value}` });
//           setFontColor(value);
//           break;
//         case 'applyOpacity':
//           applyStyleNaively({ opacity: `${value / 100}` });
//           setOpacity(value);
//           break;
//         default:
//           break;
//       }
//     }
//   };

//   const handleSchedule = (
//     option: '5min' | '30min' | '60min' | '1day' | null
//   ) => {
//     let timeToSchedule: Date | null = null;
//     switch (option) {
//       case '5min':
//         timeToSchedule = addMinutes(new Date(), 5);
//         break;
//       case '30min':
//         timeToSchedule = addMinutes(new Date(), 30);
//         break;
//       case '60min':
//         timeToSchedule = addMinutes(new Date(), 60);
//         break;
//       case '1day':
//         timeToSchedule = addDays(new Date(), 1);
//         break;
//       default:
//         timeToSchedule = null;
//     }
//     setIsScheduled(true);
//     setScheduleTime(timeToSchedule);
//   };

//   const handleSend = async () => {
//     const token = localStorage.getItem('refreshToken');
//     const response = await fetch('/api/send/gmail', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         Authorization: `Bearer ${token}`,
//       },
//       body: JSON.stringify({
//         to: to,
//         subject: 'subject',
//         html: editorHtml,
//       }),
//     });

//     if (response.ok) {
//       alert('Email sent successfully');
//     } else {
//       alert('Failed to send email');
//     }

//     if (scheduleTime) {
//       alert(`Email scheduled to be sent on ${format(scheduleTime, 'PPpp')}`);
//     }
//   };

//   const handleKeyDownCcList = (e: React.KeyboardEvent<HTMLInputElement>) => {
//     if (e.key === 'Enter' && toInputValue != '') {
//       e.preventDefault();
//       setTo(toInputValue);
//       setAddTo(false);
//       setToInputValue('');
//     }
//     if (e.key === 'Enter' && subjectInputValue != '') {
//       e.preventDefault();
//       setSubject(subjectInputValue);
//       setAddSubject(false);
//       setSubjectInputValue('');
//     }
//   };

//   const dummyArray = Array.from({ length: 10 }, (_, index) => ({
//     id: index + 1,
//   }));
//   const [fullView, setFullView] = useState(true);
//   const [reply, setReply] = useState<boolean>(true);
//   return (
//     <>
//       <span className={`flex justify-center mt-7 mb-10`}>
//         <div className=" absolute right-0  bottom-0 ">
//           <FloatingToolBar
//             fontStyle={fontStyle}
//             fontWeight={fontWeight}
//             lineSpacing={lineSpacing}
//             letterSpacing={letterSpacing}
//             fontSize={fontSize}
//             fontColor={fontColor}
//             opacity={opacity}
//             handleToolBarButtonClick={handleToolBarButtonClick}
//           />
//         </div>
//         <div
//           className={`relative border-2 border-white py-2 px-[0.35rem] w-[32rem]  shadow-lg  bg-[#f1f2f4] rounded-xl   mb-2 `}
//         >
//           <div className="  h-[39.7rem] ">
//             <span className="font-semibold text-lg pl-3 flex justify-between items-center   ">
//               <span>New Message</span>
//               <span>
//                 <button
//                   onClick={() => {
//                     console.log(editorHtml);
//                     setFullView(!fullView);
//                   }}
//                 >
//                   print
//                 </button>
//               </span>
//               <span className="flex justify-center items-center">
//                 <span onClick={() => setFullView(false)} className="px-1">
//                   <VscChromeMinimize className="text-sm text-muted-foreground  hover:text-black hover:dark:text-muted-foreground" />
//                 </span>
//                 <span className="px-1">
//                   <FiMaximize2 className="text-sm text-muted-foreground  hover:text-black hover:dark:text-muted-foreground" />
//                 </span>
//                 <span className=" pr-2">
//                   <IoCloseOutline
//                     onClick={() => {
//                       setReply(false);
//                     }}
//                     className="text-xl text-muted-foreground  rounded-full hover:text-black hover:dark:text-muted-foreground"
//                   />
//                 </span>
//               </span>
//             </span>
//             <div className="bg-white mt-4 rounded-xl rounded-b-none px-4 pt-2">
//               <span>
//                 <span className="w-full flex justify-start items-center">
//                   <span className="flex space-x-2 w-full py-1 h-9 rounded-lg text-sm items-center ">
//                     <span className="text-gray-700 mr-[0.3rem] text-xs font-semibold">
//                       To:
//                     </span>
//                     {!addTo && (
//                       <span className="flex ">
//                         <span className="ml-1">
//                           <span className="text-sm cursor-default border shadow-sm rounded-full w-auto flex flex-row pl-1 pr-1 space-x-2 items-center">
//                             <span>
//                               <Avatar className="w-5 h-5">
//                                 <AvatarImage
//                                   src="https://github.com/shadcn.png"
//                                   alt="@shadcn"
//                                 />
//                                 <AvatarFallback className="text-[0.5rem]  p-1">
//                                   CN
//                                 </AvatarFallback>
//                               </Avatar>
//                             </span>
//                             <span className="mb-1">{to.substring(0, 22)}</span>
//                             <span className="pr-1">
//                               <IoClose
//                                 onClick={() => {
//                                   setAddTo(true);
//                                 }}
//                                 className="text-xs text-white bg-gray-400 hover:bg-black rounded-full hover:text-white hover:dark:text-muted-foreground"
//                               />
//                             </span>
//                           </span>
//                         </span>
//                       </span>
//                     )}
//                     {addTo && (
//                       <input
//                         type="text"
//                         value={toInputValue}
//                         onChange={(e) => setToInputValue(e.target.value)}
//                         onKeyDown={handleKeyDownCcList}
//                         className="w-full outline-none caret-purple-600 bg-transparent placeholder:text-xs"
//                         placeholder=""
//                       />
//                     )}
//                   </span>
//                 </span>
//               </span>
//             </div>
//             <div className="bg-white px-4 mt-[0.08rem]">
//               <span>
//                 <span className="w-full flex justify-between items-center  ">
//                   <span className="flex space-x-2  py-1 w-full  rounded-lg text-sm items-center  ">
//                     <span className="flex justify-between items-center ">
//                       <span className="text-gray-700 mr-[0.3rem]  text-xs font-semibold  ">
//                         Subject:
//                       </span>

//                       {!addSubject && (
//                         <span className="flex justify-between w-full ">
//                           <span className="text-xs line-clamp-3 w-80 text-wrap">
//                             {subject}
//                           </span>
//                         </span>
//                       )}
//                     </span>
//                     {addSubject && (
//                       <input
//                         type="text"
//                         value={subjectInputValue}
//                         onChange={(e) => setSubjectInputValue(e.target.value)}
//                         onKeyDown={handleKeyDownCcList}
//                         className="w-full outline-none caret-purple-600 bg-transparent placeholder:text-xs"
//                         placeholder=""
//                       />
//                     )}
//                   </span>

//                   <span>
//                     <MdOutlineModeEditOutline
//                       onClick={() => {
//                         setAddSubject(true);
//                       }}
//                       className={`text-2xl p-1 hover:bg-black rounded-full hover:text-white hover:dark:text-muted-foreground ${
//                         addSubject ? 'bg-black text-white' : ''
//                       }`}
//                     />
//                   </span>
//                 </span>
//               </span>
//             </div>
//             <div className="   ">
//               <TextEditor
//                 editorRef={editorRef}
//                 setEditorHtml={setEditorHtml}
//                 handleToolBarButtonClick={handleToolBarButtonClick}
//                 editorHtml={editorHtml}
//                 resetStylesToDefault={resetStylesToDefault}
//               />
//             </div>
//             <div className="bg-white text-base rounded-b-lg overflow-hidden mt-[0.1rem]">
//               <span className="flex items-center justify-between">
//                 <Button
//                   size={'toolBar'}
//                   variant={'outline'}
//                   className="flex items-center ml-2"
//                   onClick={handleSend}
//                 >
//                   <span className="">Save as Drafts</span>
//                 </Button>
//                 <span className="flex justify-end items-center mr-2 my-2">
//                   {isScheduled && (
//                     <span className="pl-1 py-[0.15rem] text-muted-foreground mr-2 text-xs cursor-default bg-muted rounded-full w-auto shadow-md flex pr-4 space-x-2 items-center">
//                       <span className="pl-3">
//                         Scheduled at{' '}
//                         {format(scheduleTime, 'MMM d, yyyy, h:mm a')}
//                       </span>
//                       <span>
//                         <IoIosClose
//                           onClick={() => {
//                             setIsScheduled(false);
//                             setScheduleTime(null);
//                           }}
//                           className="text-base hover:bg-primary rounded-full hover:text-white hover:dark:text-black"
//                         />
//                       </span>
//                     </span>
//                   )}
//                   <Button
//                     size={'toolBar'}
//                     className="flex items-center rounded-r-none"
//                     onClick={handleSend}
//                   >
//                     <span className="pl-2">Send</span>
//                   </Button>
//                   <DropdownMenu>
//                     <DropdownMenuTrigger>
//                       <Button
//                         size={'toolBar'}
//                         className="ml-[0.08rem] flex items-center rounded-l-none"
//                       >
//                         <FaAngleDown className="text-md" />
//                       </Button>
//                     </DropdownMenuTrigger>
//                     <DropdownMenuContent>
//                       <DropdownMenuLabel>Schedule Email</DropdownMenuLabel>
//                       <DropdownMenuSeparator />
//                       <DropdownMenuItem onClick={() => handleSchedule('5min')}>
//                         Send after 5 Min
//                       </DropdownMenuItem>
//                       <DropdownMenuItem onClick={() => handleSchedule('30min')}>
//                         Send after 30 Min
//                       </DropdownMenuItem>
//                       <DropdownMenuItem onClick={() => handleSchedule('60min')}>
//                         Send after 60 Min
//                       </DropdownMenuItem>
//                       <DropdownMenuItem onClick={() => handleSchedule('1day')}>
//                         Schedule for 1 day later
//                       </DropdownMenuItem>
//                     </DropdownMenuContent>
//                   </DropdownMenu>
//                 </span>
//               </span>
//             </div>
//           </div>
//         </div>
//       </span>
//     </>
//   );
// }
