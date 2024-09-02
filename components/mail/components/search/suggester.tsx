'use client';

import React, { ReactNode, useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import validSuffixes from '@/lib/validDomainExtensions';
import UserDataView from '../userEmailView';
import { X } from 'lucide-react';
import { IAddress } from '../IMail';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface ISuggestables {
  unMountreplyModule: boolean;
  suggestableMails: IAddress[];
  inputData: string;
  triggerElement?: ReactNode;
  setInPutData: (inputData: string) => void;
  setValidEmails: React.Dispatch<React.SetStateAction<string[]>>;
  validEmails: string[];
  borderStyle?: string;
  domainFlag?: boolean;
}

export default function Suggester({
  unMountreplyModule,
  domainFlag,
  borderStyle,
  suggestableMails,
  inputData,
  setInPutData,
  triggerElement,
  setValidEmails,
  validEmails,
}: ISuggestables) {
  const [open, setOpen] = useState<boolean>(false);
  const [filteredMails, setFilteredMails] = useState<IAddress[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [initialValidationDone, setInitialValidationDone] =
    useState<boolean>(false);

  useEffect(() => {
    setTimeout(() => {
      setInPutData('');
    }, 200);
  }, []);

  useEffect(() => {
    // Run this effect only once when the component mounts and when inputData changes
    if (inputData && !initialValidationDone && !unMountreplyModule) {
      const email = inputData.trim();
      let isValid = false;

      if (domainFlag) {
        const domainString = `@${email.split('@')[1]}`;
        if (
          isValidDomain(domainString) &&
          !validEmails.includes(domainString)
        ) {
          setValidEmails([...validEmails, domainString]);
          isValid = true;
        }
      } else if (isValidEmail(email) && !validEmails.includes(email)) {
        setValidEmails([...validEmails, email]);
        isValid = true;
      }

      if (isValid) {
        setInPutData(''); // Clear input
        setOpen(false); // Hide suggester
      }

      setInitialValidationDone(true); // Mark initial validation as done
    }
  }, []);

  useEffect(() => {
    // Ensure the suggester panel is not open initially if no valid input
    if (inputData && !initialValidationDone) {
      setOpen(false); // Hide the suggester if input is not valid
    }
  }, [initialValidationDone, inputData]);

  useEffect(() => {
    if (inputData.length > 0) {
      const tempFilteredMails = suggestableMails.filter(
        (mail) =>
          mail.email.toLowerCase().includes(inputData.toLowerCase()) ||
          mail.name.toLowerCase().includes(inputData.toLowerCase())
      );
      setFilteredMails(tempFilteredMails);
      setOpen(tempFilteredMails.length > 0 && inputData.length > 0);
    } else {
      setFilteredMails(suggestableMails);
      setOpen(false);
    }
  }, [inputData, suggestableMails]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target as Node) &&
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside, true);
    return () => {
      document.removeEventListener('click', handleClickOutside, true);
    };
  }, []);

  const handleInputFocus = () => {
    if (inputData.length > 0 && filteredMails.length > 0) {
      setOpen(true);
    }
  };

  const getPopoverStyle = () => {
    return filteredMails.length <= 5
      ? { maxHeight: 'auto' }
      : { height: '200px' };
  };

  const handleEditEmail = (index: number, newValue: string) => {
    const newEmails = [...validEmails];
    newEmails[index] = newValue;
    setValidEmails(newEmails);
  };

  const handleEditBlur = (index: number) => {
    if (
      domainFlag
        ? isValidDomain(validEmails[index])
        : isValidEmail(validEmails[index])
    ) {
      setEditingIndex(null);
    } else {
      removeEmail(index);
    }
  };

  const handleEditKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === 'Enter') {
      if (
        domainFlag
          ? isValidDomain(validEmails[index])
          : isValidEmail(validEmails[index])
      ) {
        setEditingIndex(null);
      } else {
        removeEmail(index);
      }
    } else if (e.key === 'Escape') {
      setEditingIndex(null);
    }
  };

  const isValidEmail = (email: string) => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(email);
  };

  const isValidDomain = (domain: string) => {
    return (
      domain.startsWith('@') &&
      validSuffixes.some((suffix) => domain.endsWith(suffix))
    );
  };

  const clearAllEmails = () => {
    setValidEmails([]);
    setEditingIndex(null);
    toast.success('All emails cleared', {
      duration: 3000,
      position: 'top-right',
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInPutData(newValue);
    const parts = newValue.split(' ');

    parts.forEach((part) => {
      if (part.includes('@')) {
        const [_, domain] = part.split('@');
        if (domain) {
          const domainString = `@${domain}`;
          if (domainFlag ? isValidDomain(domainString) : true) {
            if (!domainFlag && isValidEmail(part)) {
              addEmail(part);
            } else if (domainFlag) {
              addEmail(domainString);
            }
          }
        }
      }
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const email = inputData.trim();
      if (email && isValidEmail(email)) {
        addEmail(email);
      }
    } else if (
      e.key === 'Backspace' &&
      inputData === '' &&
      validEmails.length > 0
    ) {
      removeEmail(validEmails.length - 1);
    }
  };
  const addEmail = (email: string) => {
    const domain = email.split('@')[1];

    if (
      domainFlag &&
      email.startsWith('@') &&
      !validEmails.includes(email) &&
      isValidDomain(email)
    ) {
      setValidEmails([...validEmails, email]);
      setInPutData('');
      if (initialValidationDone) {
        toast.success('Domain added successfully', {
          duration: 3000,
          position: 'top-right',
        });
      }
    } else if (
      !domainFlag &&
      domain &&
      !validEmails.includes(email) &&
      isValidEmail(email) &&
      domain.includes('.') &&
      domain.split('.').pop()?.length! >= 2 &&
      !domain.endsWith('.co')
    ) {
      setValidEmails([...validEmails, email]);
      setInPutData('');
      if (initialValidationDone) {
        toast.success('Email added successfully', {
          duration: 3000,
          position: 'top-right',
        });
      }
    } else if (validEmails.includes(email)) {
      toast.error('Email already exists', {
        duration: 3000,
        position: 'top-right',
      });
    }
  };

  const removeEmail = (index: number) => {
    setValidEmails(validEmails.filter((_, i) => i !== index));
    if (editingIndex === index) {
      setEditingIndex(null);
    }
    toast.success('Email removed successfully', {
      duration: 3000,
      position: 'top-right',
    });
  };

  const handleEmailSelection = (email: string) => {
    if (validEmails.includes(email)) {
      setOpen(false);
      return;
    }
    if (domainFlag) {
      const domainPart = `@${email.split('@')[1]}`;
      if (isValidDomain(domainPart)) {
        addEmail(domainPart);
      } else {
        toast.error('Invalid domain part', {
          duration: 3000,
          position: 'top-right',
        });
      }
    } else {
      if (isValidEmail(email)) {
        addEmail(email);
      } else {
        toast.error('Invalid email address', {
          duration: 3000,
          position: 'top-right',
        });
      }
    }
    setOpen(false); // Hide suggester
    inputRef.current?.focus();
  };

  return (
    <div className="relative w-full">
      <div className="flex w-full">
        <div className="flex items-center p-2 py-0 gap-2">
          {validEmails.slice(0, 1).map((email, index) => (
            <div
              key={index}
              className="border px-3 py-1 text-nowrap border-border rounded-full text-xs flex items-center"
            >
              {editingIndex === index ? (
                <input
                  type="email"
                  value={email}
                  onChange={(e) => handleEditEmail(index, e.target.value)}
                  onBlur={() => handleEditBlur(index)}
                  onKeyDown={(e) => handleEditKeyDown(e, index)}
                  autoFocus
                  className="bg-transparent outline-none"
                />
              ) : (
                <span onClick={() => setEditingIndex(index)}>
                  {email.length > 9 ? `${email.substring(0, 7)}...` : email}
                </span>
              )}
              <button
                onClick={() => removeEmail(index)}
                className="ml-2 flex items-center"
              >
                <X className="text-red-500" size={15} />
              </button>
            </div>
          ))}
          {validEmails.length > 1 && (
            <Dialog>
              <DialogTrigger>
                <button className="border text-nowrap border-border rounded-full px-3 py-1 text-xs flex items-center">
                  {validEmails.length - 1} more...
                </button>
              </DialogTrigger>
              <DialogContent className="w-[35vw]">
                <DialogHeader>
                  <DialogTitle>All Emails</DialogTitle>
                </DialogHeader>
                <ScrollArea className="max-h-[300px]">
                  <div className="flex flex-wrap gap-2 py-4">
                    {validEmails.map((email, index) => (
                      <div
                        key={index}
                        className="border border-border rounded-full px-3 py-1 text-xs flex items-center"
                      >
                        {editingIndex === index ? (
                          <input
                            type="email"
                            value={email}
                            onChange={(e) =>
                              handleEditEmail(index, e.target.value)
                            }
                            onBlur={() => handleEditBlur(index)}
                            onKeyDown={(e) => handleEditKeyDown(e, index)}
                            autoFocus
                            className="bg-transparent outline-none"
                          />
                        ) : (
                          <span
                            className=""
                            onClick={() => setEditingIndex(index)}
                          >
                            {email}
                          </span>
                        )}
                        <button
                          onClick={() => removeEmail(index)}
                          className="ml-2"
                        >
                          <X className="text-red-500" size={15} />
                        </button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                <div className="flex justify-end mt-4">
                  <Button
                    variant={'destructive'}
                    onClick={clearAllEmails}
                    className="text-xs rounded-lg"
                  >
                    Clear All
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
        <Input
          onFocus={handleInputFocus}
          ref={inputRef}
          type="email"
          placeholder="Add emails"
          className={`flex-grow focus:ring-0 shadow-none 
            ${borderStyle ? `${borderStyle}` : 'border-none'}
          `}
          value={inputData}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          autoComplete="off"
          aria-autocomplete="none"
        />
        {open && (
          <div
            ref={popoverRef}
            className="absolute z-10 w-72 p-1 px-2 pr-1 dark:bg-black bg-white border rounded-md shadow-md"
            style={{ top: '100%', left: 0, ...getPopoverStyle() }}
          >
            <ScrollArea className={filteredMails.length > 5 ? 'h-full' : ''}>
              <div>
                {filteredMails.map(({ email, name }, index) => (
                  <div
                    key={index}
                    className="text-sm rounded-lg cursor-pointer py-1"
                    onClick={() => handleEmailSelection(email)}
                  >
                    <UserDataView
                      isSuggestable={true}
                      emailAddress={email}
                      avatarId={5}
                      userName={name}
                    />
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
      </div>
    </div>
  );
}
