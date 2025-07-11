import React, { useEffect, useState } from "react";
import Breadcrumbs from "../components/Breadcrumbs";
import axios from "axios";
import { debounce } from "lodash";
import { CiSearch } from "react-icons/ci";
import { CustomInput } from "../components/ui/CustomInput";
import { Image } from "../components/ui/Image";
import LogoIconBlack from "../assets/icons/LogoIconBlack.svg";

import { useStore } from "../store/store";
import LogoIconLight from "../assets/icons/LogoIconLight.svg";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../components/ui/accordion";
import { cn } from "../lib/utils";
import { DatePickerWithRange } from "../components/ui/DatePicker";
import { CreateEventModal } from "../components/modalViews/CreateEventModal";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { Button } from "../components/ui/button";
import { ChevronDown } from "lucide-react";
import { FaUser, FaUsers } from "react-icons/fa";

const EventsPage: React.FC = () => {
  const [events, setEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [displayEvents, setDisplayEvents] = useState([]);
  const [selectedEvents, setSelectedEvents] = useState("All Events");
  const store = useStore();

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const dayOfWeek = daysOfWeek[date.getUTCDay()];
    const dayOfMonth = String(date.getUTCDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getUTCMinutes()).padStart(2, "0");
    return `${dayOfWeek} ${dayOfMonth}, ${hours}:${minutes}`;
  };

  const fetchEvents = debounce(async () => {
    const orderBy = encodeURIComponent(JSON.stringify({ start: "desc" }));
    try {
      const response = await axios.get(
        `http://localhost:3000/event?orderBy=${orderBy}`
      );
      setEvents(response.data);
    } catch (e) {
      console.error(e);
    }
  });

  const filterEvents = (filter: string) => {
    if (filter === "My Events") {
      const myEvents = events.filter(
        (event: any) => event.groupId === store.currentUser.groupId
      );
      setDisplayEvents(myEvents);
    } else {
      setDisplayEvents(events);
    }
  };

  const filteredResults = displayEvents.filter((item: any) =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase())
  );
  console.log(filteredResults);
  useEffect(() => {
    fetchEvents();
  }, [searchTerm]);
  useEffect(() => {
    filterEvents(selectedEvents);
  }, [events, selectedEvents]);
  return (
    <div className="flex flex-col w-full">
      <div className="w-full flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          {store.theme === "dark" ? (
            <Image src={LogoIconLight} className="animate-rotate size-10" />
          ) : (
            <Image src={LogoIconBlack} className="animate-rotate" />
          )}
          <h1 className="font-k2d text-4xl uppercase">Unichub</h1>
        </div>
        <h1 className="font-k2d text-6xl">All Events</h1>
      </div>
      <div className="flex h-[calc(100vh-180px)] w-full flex-col gap-2 p-4 rounded-2xl border border-neutral-200 bg-white  md: dark:border-neutral-700 dark:bg-neutral-900 ">
        <div className="flex items-center justify-between p-4 ">
          <Breadcrumbs />
          <div className="flex w-full gap-4 items-center ">
            <div className="flex w-full gap-2 justify-end">
              <div className="relative w-1/5">
                <CiSearch className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <CustomInput
                  type="text"
                  placeholder=" Search..."
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="caret-[#34d399] dark:bg-neutral-800 dark:placeholder:text-neutral-400 dark:text-white"
                />
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="ml-auto">
                  {selectedEvents} <ChevronDown className="ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuCheckboxItem
                  checked={selectedEvents === "My Events"}
                  onCheckedChange={() => setSelectedEvents("My Events")}
                  className="cursor-pointer hover:underline flex justify-center gap-2 "
                >
                  <FaUser />
                  My Events
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={selectedEvents === "All Events"}
                  onCheckedChange={() => setSelectedEvents("All Events")}
                  className="cursor-pointer hover:underline flex justify-center gap-2 "
                >
                  <FaUsers />
                  All Events
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {store.currentUser.roles.includes("Admin") ||
            store.currentUser.roles.includes("Teacher") ? (
              <CreateEventModal
                trigger={
                  <div className="w-[120px] flex justify-center items-center text-sm text-center p-1.5 font-k2d bg-white rounded-lg border-2 border-neutral-200 hover:shadow-md cursor-pointer dark:bg-neutral-800 dark:border-neutral-400">
                    Create Event
                  </div>
                }
              />
            ) : (
              <></>
            )}
          </div>
        </div>
        {filteredResults.length == 0 ? (
          <div className="w-full h-full flex justify-center items-center flex-col gap-3">
            {store.theme === "dark" ? (
              <Image src={LogoIconLight} className="animate-rotate size-10" />
            ) : (
              <Image src={LogoIconBlack} className="animate-rotate" />
            )}
            <h1 className="font-k2d">Empty</h1>
          </div>
        ) : (
          <div className="flex-start overflow-y-auto h-5/6 w-full p-4">
            {filteredResults.length > 0 &&
              filteredResults.map((item: any, index: number) => (
                <Accordion
                  type="single"
                  collapsible
                  key={index}
                  className="w-full mb-2"
                >
                  <AccordionItem
                    value={item.id}
                    key={index}
                    className=" px-2"
                    style={{ animationDelay: `${index * 200}ms` }}
                  >
                    <div
                      className={cn(
                        "border border-t-2 border-b-0 border-l-0 border-r-0 border-emerald-400 rounded-md shadow-sm hover:shadow-md cursor-pointer transition-colors duration-200 dark:bg-neutral-800 p-2",
                        item.status == "Old" && "opacity-45 border-red-400 "
                      )}
                    >
                      <AccordionTrigger className="font-k2d">
                        {`${item.title}`}
                        {item.status == "New" ? (
                          <div className="text-xs bg-emerald-200 px-2 py-0.5 rounded-full lowercase text-emerald-500 font-k2d">
                            {item.status}
                          </div>
                        ) : (
                          <div className="text-xs bg-red-200 px-2 py-0.5 rounded-full lowercase text-red-500 font-k2d">
                            {item.status}
                          </div>
                        )}
                        <div className="w-auto">{item.group.name}</div>
                        {formatDate(item.created)}
                      </AccordionTrigger>
                      <AccordionContent className="flex flex-col">
                        <div className="flex flex-col gap-2">
                          <div className="flex gap-2">
                            <span className="text-xs underline lowercase">
                              Start
                            </span>{" "}
                            {formatDate(item.start)}
                            <span className="text-xs underline lowercase">
                              End
                            </span>{" "}
                            {formatDate(item.end)}
                          </div>
                          <p>{item.description}</p>
                        </div>
                        <DatePickerWithRange from={item.start} to={item.end} />
                      </AccordionContent>
                    </div>
                  </AccordionItem>
                </Accordion>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EventsPage;
