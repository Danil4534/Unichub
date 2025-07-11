import * as React from "react";
import { addDays, format } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { DateRange } from "react-day-picker";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { cn } from "../../lib/utils";
import { Button } from "./button";
import { Calendar } from "./calendar";

type DatePickerProps = {
  from?: string | Date;
  to?: string | Date | undefined;
  className?: string;
};

export const DatePickerWithRange: React.FC<DatePickerProps> = ({
  from,
  to,
  className,
}) => {
  const fromDate =
    from instanceof Date ? from : from ? new Date(from) : undefined;
  const toDate = to instanceof Date ? to : to ? new Date(to) : undefined;

  const [date, setDate] = React.useState<DateRange | undefined>(() => {
    if (fromDate && toDate) {
      const rangeLength = Math.ceil(
        (toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      return { from: fromDate, to: addDays(fromDate, rangeLength) };
    }
    return undefined;
  });

  return (
    <div
      className={cn("grid gap-2", className)}
      onDragStart={(e) => e.preventDefault()}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-[260px] justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y")} -{" "}
                  {format(date.to, "LLL dd, y")}
                </>
              ) : (
                format(date.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={setDate}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};
