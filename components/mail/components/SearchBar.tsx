// Path: /components/SearchBar.tsx

import * as React from 'react';
import { useRef, useEffect, useState, useCallback } from 'react';
import {
  Search as MagnifyingGlassIcon,
  X as XIcon,
  SlidersHorizontal,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { IEmails } from './IMail';
import { CalendarIcon } from '@radix-ui/react-icons';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { addDays } from 'date-fns';
import { DateRange, SelectRangeEventHandler } from 'react-day-picker';
import AiLogo from '@/constants/AiLogo.png';
import HyperX from './HyperX';
import { IMailsWithFilter, IEmailsObject } from './IMail';
import { IAddress } from './IMail';
import { IEmail } from './IMail';
import { IHyperxMessage } from './IMail';

interface SearchBarProps {
  suggestableMails: IAddress[];
  mailListLabel: string;
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  mailsWithFilter: IMailsWithFilter;
  setMailsWithSearchFilter: React.Dispatch<
    React.SetStateAction<IMailsWithFilter>
  >;
  mailsWithSearchFilter: { [key: string]: IEmailsObject };
  isSearchActive: boolean;
  setIsSearchActive: React.Dispatch<React.SetStateAction<boolean>>;
  hyperxMessage: IHyperxMessage[];
  setHyperxMessage: React.Dispatch<React.SetStateAction<IHyperxMessage[]>>;
  mailsBigData: IMailsWithFilter;
  setMailsBigData: (mailsBigData: IMailsWithFilter) => void;
}
export function SearchBar({
  hyperxMessage,
  setHyperxMessage,
  mailsBigData,
  setMailsBigData,
  suggestableMails,
  mailListLabel,
  isSearchActive,
  isOpen,
  setIsSearchActive,
  mailsWithFilter,
  setMailsWithSearchFilter,
  setIsOpen,
  mailsWithSearchFilter,
}: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [searchText, setSearchText] = useState('');
  const [date, setDate] = useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  });
  const [isHyperXOpen, setIsHyperXOpen] = useState<boolean>(false);
  const [dateSelected, setDateSelected] = useState<boolean>(false);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [filters, setFilters] = useState({
    sender: '',
    recipient: '',
    subject: '',
    ccBcc: '',
    readStatus: false,
    hasAttachment: false,
  });
  const [previousSelectedLabel, setPreviousSelectedLabel] =
    useState<string>(mailListLabel);
  const handleSearch = async () => {
    try {
      const token = localStorage.getItem('refreshToken')!;
      const searchParams = new URLSearchParams({ token });

      if (searchText) searchParams.append('q', searchText);
      Object.keys(filters).forEach((key) => {
        if (filters[key as keyof typeof filters]) {
          searchParams.append(
            key,
            filters[key as keyof typeof filters].toString()
          );
        }
      });

      if (date?.from)
        searchParams.append('dateFrom', date.from.getTime().toString());
      if (date?.to) searchParams.append('dateTo', date.to.getTime().toString());

      const response = await fetch(
        `/api/fetchmail/search?${searchParams.toString()}`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        }
      );

      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();

      if (data.success) {
        const searchResults: IEmailsObject = {};
        data.data.forEach((email: IEmail) => {
          searchResults[email.id] = email; // Use email.id as the key
        });
        setMailsWithSearchFilter({ SEARCH_RESULTS: searchResults });
        setIsSearchActive(true);
      } else {
        console.error('Search failed:', data.error);
      }
    } catch (error) {
      console.error('Error during search:', error);
    }
  };

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const clearFilters = () => {
    setMailsWithSearchFilter({});
    setSearchText('');
    setFilters({
      sender: '',
      recipient: '',
      subject: '',
      ccBcc: '',
      readStatus: false,
      hasAttachment: false,
    });
    // setDate({ from: new Date(), to: addDays(new Date(), 7) });
    setDate(undefined);
    setDateSelected(false);
    // setIsOpen(false);
    // setIsSearchActive(false);
  };

  const handleClose = () => {
    clearFilters();
    setIsSearchActive(false);
    setIsOpen(false);
    setPopoverOpen(false);
  };

  const handleDateSelect: SelectRangeEventHandler = (range) => {
    setDate(range || { from: undefined, to: undefined });
    setDateSelected(!!range);
  };

  const simpleSearch = (searchText: string) => {
    const searchResult: IEmailsObject = {}; // Change type to IEmailsObject

    Object.keys(mailsWithFilter).forEach((key) => {
      Object.values(mailsWithFilter[key]).forEach((email) => {
        if (
          email.name.includes(searchText) ||
          email.email.includes(searchText) ||
          email.reply.includes(searchText) ||
          email.snippet.includes(searchText) ||
          email.subject.includes(searchText) ||
          email.htmlBody.includes(searchText) ||
          email.textBody.includes(searchText) ||
          email.labels.some((label) => label.includes(searchText)) ||
          (email.attachments &&
            email.attachments.some((attachment) =>
              attachment.filename?.includes(searchText)
            ))
        ) {
          searchResult[email.id] = email; // Use email.id as the key
        }
      });
    });

    setMailsWithSearchFilter({ SEARCH_RESULTS: searchResult });
    setIsSearchActive(true);
  };

  const applyFilters = () => {
    setPopoverOpen(false);
    handleSearch();
  };

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        handleClose();
        setIsOpen((open) => !open);
      }
    },
    [setIsOpen]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
    if (!popoverOpen) simpleSearch(e.target.value);
  };

  const filterPanelWidthRef = useRef<HTMLDivElement>(null);

  return (
    <>
      {isOpen && (
        <>
          <HyperX
            mailsBigData={mailsBigData}
            setMailsBigData={setMailsBigData}
            isOpen={isHyperXOpen}
            setIsOpen={setIsHyperXOpen}
            messages={hyperxMessage}
            setMessages={setHyperxMessage}
          />
          <div className="relative">
            <div
              ref={filterPanelWidthRef}
              className="flex items-center shadow-inner-all rounded-lg px-3 pr-0 h-8"
            >
              <MagnifyingGlassIcon className="mr-2 h-4 w-4 shrink-0 opacity-50" />
              <Input
                ref={inputRef}
                value={searchText}
                onChange={handleSearchInputChange}
                className="flex h-10 w-full border-0 shadow-none rounded-lg bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                placeholder="Search emails..."
              />
              <div className="ml-auto space-x-1 flex items-center justify-center">
                <div
                  onClick={() => setIsHyperXOpen(!isHyperXOpen)}
                  className="flex items-center justify-center cursor-pointer h-7 w-7"
                >
                  <img src={AiLogo.src} alt="AI Logo" height={18} width={18} />
                </div>
                <div
                  onClick={() => setPopoverOpen(!popoverOpen)}
                  className="flex items-center justify-center cursor-pointer h-7 w-7"
                >
                  <SlidersHorizontal className="h-[0.85rem] w-[0.85rem]" />
                </div>
                <div
                  onClick={handleClose}
                  className="flex items-center justify-center cursor-pointer h-7 w-7"
                >
                  <XIcon className="h-4 w-4" />
                </div>
              </div>
            </div>
          </div>

          <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
            <PopoverTrigger asChild>
              <div className="w-full opacity-0"></div>
            </PopoverTrigger>
            <PopoverContent
              align="center"
              style={{ width: filterPanelWidthRef.current?.clientWidth }}
              sideOffset={5}
            >
              <div className="flex flex-col space-y-4">
                <FilterInput
                  label="Sender"
                  value={filters.sender}
                  onChange={(value) =>
                    setFilters({ ...filters, sender: value })
                  }
                />
                <FilterInput
                  label="Recipient"
                  value={filters.recipient}
                  onChange={(value) =>
                    setFilters({ ...filters, recipient: value })
                  }
                />
                <FilterInput
                  label="Subject"
                  value={filters.subject}
                  onChange={(value) =>
                    setFilters({ ...filters, subject: value })
                  }
                />
                {/* <FilterInput
                  label="Cc / Bcc"
                  value={filters.ccBcc}
                  onChange={(value) => setFilters({ ...filters, ccBcc: value })}
                /> */}
                <Popover>
                  <DateRangePicker
                    date={date}
                    onDateSelect={handleDateSelect}
                  />
                </Popover>
                <StatusFilter
                  readStatus={filters.readStatus}
                  hasAttachment={filters.hasAttachment}
                  setReadStatus={(status) =>
                    setFilters({ ...filters, readStatus: status })
                  }
                  setHasAttachment={(status) =>
                    setFilters({ ...filters, hasAttachment: status })
                  }
                />
              </div>
              <div className="flex justify-between mt-6">
                <Button
                  variant={'outline'}
                  className="border-none hover:bg-border"
                  onClick={clearFilters}
                >
                  Clear Filters
                </Button>
                <Button
                  variant={'outline'}
                  className="border-none hover:bg-border"
                  onClick={applyFilters}
                >
                  Apply Filters
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </>
      )}
    </>
  );
}

interface FilterInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}
import Suggester from './search/suggester';

const FilterInput: React.FC<FilterInputProps> = ({
  label,
  value,
  onChange,
}) => (
  <div className="flex items-center space-x-2">
    <Label className="text-xs w-[4.66rem]">{label}</Label>
    <Separator orientation="vertical" className="h-5" />
    <Input
      type="text"
      placeholder={`Enter ${label.toLowerCase()}`}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="border-none shadow-none w-full px-2 py-1 caret-black"
    />
  </div>
);

interface DateRangePickerProps {
  date: DateRange | undefined;
  onDateSelect: SelectRangeEventHandler;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({
  date,
  onDateSelect,
}) => (
  <div className="flex items-center space-x-2">
    <Label className="text-xs w-16">Date Range</Label>
    <Separator orientation="vertical" className="h-5" />
    <PopoverTrigger asChild>
      <Button
        id="date"
        variant="outline"
        className={cn(
          'w-auto justify-start h-7 rounded-lg text-xs border-none text-left font-normal',
          date && !date.from && 'text-muted-foreground',
          !!date && 'bg-muted'
        )}
      >
        <CalendarIcon className="mr-2 h-4 w-4" />
        {date?.from ? (
          date.to ? (
            `${format(date.from, 'LLL d, yyyy')} - ${format(date.to, 'LLL d, yyyy')}`
          ) : (
            format(date.from, 'LLL d, yyyy')
          )
        ) : (
          <span>Pick a date</span>
        )}
      </Button>
    </PopoverTrigger>
    <PopoverContent className="w-auto p-0" align="start">
      <Calendar
        mode="range"
        initialFocus
        defaultMonth={date?.from}
        selected={date}
        onSelect={onDateSelect}
        numberOfMonths={2}
      />
    </PopoverContent>
  </div>
);

interface StatusFilterProps {
  readStatus: boolean;
  hasAttachment: boolean;
  setReadStatus: (status: boolean) => void;
  setHasAttachment: (status: boolean) => void;
}

const StatusFilter: React.FC<StatusFilterProps> = ({
  readStatus,
  hasAttachment,
  setReadStatus,
  setHasAttachment,
}) => (
  <div className=" flex space-x-5">
    <div className="space-y-2">
      <Label>Status</Label>
      <div className="flex items-center gap-2">
        <Checkbox
          id="readStatus"
          checked={readStatus}
          onCheckedChange={(checked) => setReadStatus(checked as boolean)}
        />
        <Label htmlFor="readStatus" className="font-normal">
          {readStatus ? 'Read' : 'Unread'}
        </Label>
      </div>
    </div>
    <div className="space-y-2">
      <Label>Attachments</Label>
      <div className="flex items-center gap-2">
        <Checkbox
          id="hasAttachment"
          checked={hasAttachment}
          onCheckedChange={(checked) => setHasAttachment(checked as boolean)}
        />
        <Label htmlFor="hasAttachment" className="font-normal">
          {hasAttachment ? 'Has Attachments' : 'No Attachments'}
        </Label>
      </div>
    </div>
  </div>
);
