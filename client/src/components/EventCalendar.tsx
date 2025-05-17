import { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

function EventCalendar() {
  type ValuePiece = Date | null;
  type Value = ValuePiece | [ValuePiece, ValuePiece];

  const [value, onChange] = useState<Value>(new Date());

  return (
    <>
      <div className="w-full bg-white p-2 flex justify-center items-end dark:bg-neutral-900 ">
        <Calendar
          onChange={onChange}
          value={value}
          locale="EN-en"
          className={"dark:bg-neutral-900"}
        />
      </div>
    </>
  );
}

export default EventCalendar;
