import axios from "axios";
import React, { useEffect, useState } from "react";
import { useStore } from "../store/store";
import { NavLink, useLocation } from "react-router-dom";
import { Image } from "./ui/Image";
import LogoIconBlack from "../assets/icons/LogoIconBlack.svg";
import LogoIconLight from "../assets/icons/LogoIconLight.svg";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import { cn } from "../lib/utils";
import { DatePickerWithRange } from "./ui/DatePicker";
export type EventTypes = {
  id: string;
  title: string;
  description: String;
  start: string;
  end: string;
  status: String;
  created: Date;
  groupId: string;
};
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const dayOfWeek = daysOfWeek[date.getUTCDay()];
  const dayOfMonth = String(date.getUTCDate()).padStart(2, "0");
  const hours = String(date.getUTCHours()).padStart(2, "0");
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");

  return `${dayOfWeek} ${dayOfMonth}, ${hours}:${minutes}`;
};

const Events: React.FC = () => {
  const [events, setEvents] = useState<EventTypes[]>([]);
  const store = useStore();
  const { pathname } = useLocation();
  const usersEvents = !store.currentUser?.roles.includes("Admin")
    ? events.filter(
        (item: EventTypes) => item.groupId == store.currentUser?.groupId
      )
    : events;

  useEffect(() => {
    const handleEvents = async () => {
      const orderBy = encodeURIComponent(JSON.stringify({ start: "desc" }));
      const response = await axios.get(
        `http://localhost:3000/event?orderBy=${orderBy}`
      );
      setEvents(response.data);
    };
    handleEvents();
  }, []);

  return (
    <>
      {pathname !== "/homepage/events" ? (
        <div className="h-full">
          <div className="flex items-center justify-between">
            <h1 className="font-k2d text-md">Events</h1>
            <NavLink
              to="events"
              className="font-k2d text-neutral-500 text-sm hover:underline cursor-pointer"
            >
              View All
            </NavLink>
          </div>
          <Accordion type="single" collapsible>
            {usersEvents.length > 0 ? (
              usersEvents.slice(0, 3).map((item: EventTypes, index: number) => (
                <AccordionItem
                  value={item.id}
                  key={index}
                  className={cn(
                    "border border-t-2  animate-fadeInOpacity border-b-0 border-l-0 border-r-0 border-emerald-400 rounded-md  px-2 mt-2  shadow-sm hover:shadow-md cursor-pointer transition-colors duration-200 animation-fill-forwards",
                    item.status == "Old"
                      ? "border-red-500"
                      : "border-emerald-400 "
                  )}
                  style={{ animationDelay: `${index * 200}ms` }}
                >
                  <AccordionTrigger className="font-k2d">
                    {item.title}{" "}
                    <p
                      className={`text-xs  px-2 py-0.5 rounded-full  lowercase font-k2d ${
                        item.status == "Old"
                          ? "bg-red-200 text-red-500"
                          : "bg-emerald-200 text-emerald-500"
                      }`}
                    >
                      {item.status}
                    </p>
                  </AccordionTrigger>
                  <AccordionContent>
                    <span className="text-xs underline lowercase">Start</span>{" "}
                    {formatDate(item.start)} -{" "}
                    <span className="text-xs underline lowercase"> End</span>{" "}
                    {formatDate(item.end)}
                    <DatePickerWithRange from={item.start} to={item.end} />
                  </AccordionContent>
                </AccordionItem>
              ))
            ) : (
              <div className="flex justify-center items-center h-auto">
                <div className="w-full h-full flex justify-center items-center flex-col gap-3">
                  {store.theme === "dark" ? (
                    <Image
                      src={LogoIconLight}
                      className="animate-rotate size-8"
                    />
                  ) : (
                    <Image
                      src={LogoIconBlack}
                      className="animate-rotate size-8"
                    />
                  )}
                  <h1 className="font-k2d">Empty</h1>
                </div>
              </div>
            )}
          </Accordion>
        </div>
      ) : (
        <></>
      )}
    </>
  );
};

export default Events;
