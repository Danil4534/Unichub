import "react-big-calendar/lib/css/react-big-calendar.css";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import { useEffect, useState } from "react";
import axios from "axios";
import { useStore } from "../../store/store";
import { cn } from "../../lib/utils";
import "./calendar-custom.css";

const localizer = momentLocalizer(moment);

type EventTypes = {
  title: string;
  description: string;
  start: Date;
  end: Date;
  status: string;
  created: Date;
  groupId: string;
};

function BigCalendar({ className }: { className: string }) {
  const store = useStore();
  console.log(store.currentUser);
  const [events, setEvents] = useState<EventTypes[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<EventTypes | null>(null);

  const userEvents = store.currentUser?.roles.includes("Admin")
    ? events
    : events.filter(
        (item: EventTypes) => item.groupId === store.currentUser?.groupId
      );

  useEffect(() => {
    const handleEvents = async () => {
      try {
        const response = await axios.get("http://localhost:3000/event");
        const formattedEvents = response.data.map((event: EventTypes) => ({
          ...event,
          start: new Date(event.start),
          end: new Date(event.end),
          created: new Date(event.created),
        }));
        setEvents(formattedEvents);
      } catch (e) {
        console.error(e);
      }
    };
    store.setCurrentUser();
    handleEvents();
  }, []);

  const eventStyleGetter = (event: EventTypes) => {
    const now = new Date();
    const isPast = event.end < now && event.start < now;

    const style = {
      backgroundColor: isPast ? "#fca5a5" : "#bbf7d0", // red-300 vs green-200
      color: isPast ? "#7f1d1d" : "#064e3b", // red-900 vs green-900
      borderRadius: "0.375rem", // rounded-md
      border: `1px solid ${isPast ? "#f87171" : "#34d399"}`, // red-400 vs green-400
      padding: "0.25rem 0.5rem", // px-2 py-1
    };

    return { style };
  };

  return (
    <div className={cn(className, "p-4 font-k2d")}>
      {userEvents && (
        <>
          <Calendar
            localizer={localizer}
            startAccessor="start"
            endAccessor="end"
            events={userEvents}
            views={["month", "day", "work_week", "agenda"]}
            defaultView="month"
            eventPropGetter={eventStyleGetter}
            onSelectEvent={(event) => setSelectedEvent(event)}
            style={{ height: "600px" }}
          />

          {selectedEvent && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-transparent rounded-xl">
              <div className="bg-white dark:bg-neutral-800 p-6 rounded-xl shadow-lg max-w-md w-full  border-r-0 border-l-0 border-b-0 border-2 border-emerald-400">
                <h2 className="text-2xl font-semibold mb-2">
                  {selectedEvent.title}
                </h2>
                <p className="mb-1">
                  <span className="font-medium">Description:</span>{" "}
                  {selectedEvent.description}
                </p>
                <p className="mb-1">
                  <span className="font-medium">Start:</span>{" "}
                  {selectedEvent.start.toLocaleString()}
                </p>
                <p className="mb-1">
                  <span className="font-medium">End:</span>{" "}
                  {selectedEvent.end.toLocaleString()}
                </p>
                <p className="mb-4">
                  <span className="font-medium">Status:</span>{" "}
                  {selectedEvent.status}
                </p>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="mt-2 px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-800"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default BigCalendar;
