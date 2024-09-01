// @ts-nocheck
'use client';

import * as React from 'react';
import { add, format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { TimePickerDemo } from '@/components/ui/dateTimePickerDemo';

export default function DateTimePicker({ date, setDate }) {
  // const [date, setDate] = React.useState<Date>();

  /**
   * carry over the current time when a user clicks a new day
   * instead of resetting to 00:00
   */
  const handleSelect = (newDay: Date | undefined) => {
    if (!newDay) return;
    if (!date) {
      setDate(newDay);
      return;
    }
    const diff = newDay.getTime() - date.getTime();
    const diffInDays = diff / (1000 * 60 * 60 * 24);
    const newDateFull = add(date, { days: Math.ceil(diffInDays) });
    setDate(newDateFull);
  };

  return (
    <div className="  ">
      <Calendar
        mode="single"
        selected={date}
        onSelect={(d) => handleSelect(d)}
        initialFocus
        className=""
      />
      <div className="p-3 border-t border-border">
        <TimePickerDemo setDate={setDate} date={date} />
      </div>
      <Button
        variant={'outline'}
        className={cn(
          'w-full justify-start text-center text-xs font-normal',
          !date && 'text-muted-foreground'
        )}
      >
        {date ? format(date, 'PPP HH:mm:ss') : <span>Pick a date</span>}
      </Button>
    </div>
  );
}
