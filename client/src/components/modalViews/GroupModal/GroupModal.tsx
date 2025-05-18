import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogTrigger,
} from "../../ui/alert-dialog";
import { IoMdClose } from "react-icons/io";
import { RadialChart } from "../../ui/RadialChart";
import { AlertDialogTitle } from "@radix-ui/react-alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import { useEffect, useState } from "react";
import { Image } from "../../ui/Image";
import { LiaTrashAltSolid } from "react-icons/lia";
import { useStore } from "../../../store/store";
import { Input } from "../../ui/Input";
import { CiSearch } from "react-icons/ci";
import axios from "axios";
import { toast, Toaster } from "sonner";
import { EventTypes } from "../../Events";
import LogoIconLight from "../../../assets/icons/LogoIconLight.svg";
import LogoIconBlack from "../../../assets/icons/LogoIconBlack.svg";
import { InviteStudentModal } from "../InviteStudentModal";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../ui/accordion";

import RatingsTable from "./components/Table";
import { cn } from "../../../lib/utils";
import { Link } from "react-router-dom";
import { DatePickerWithRange } from "../../ui/DatePicker";
import { CreateEventModal } from "../CreateEventModal";

type GroupModalProps = {
  group: any;
};

type Rating = {
  headers: string[];
  rows: string[][];
};
export const GroupModal: React.FC<GroupModalProps> = ({ group }) => {
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [bannedUsers, setBanned] = useState([]);
  const [events, setEvents] = useState([]);
  const [ratings, setRatings] = useState<Rating>();

  const store = useStore();
  const handleGetRating = async () => {
    try {
      const response = await axios.get(
        `http://localhost:3000/grade-book/groupRatings/${group.id}`
      );
      setRatings(response.data);
      console.log(response.data);
    } catch (error) {
      console.error("Error fetching ratings", error);
      toast.error("Failed to load rating data");
    }
  };
  const handleEvents = async () => {
    try {
      const response = await axios.get(
        `http://localhost:3000/event/getEventsForGroup/${group.id}`
      );
      setEvents(response.data);
    } catch (e) {
      console.log(e);
    }
  };

  const handleUnInviteUser = async (userId: string) => {
    try {
      await axios.put(
        `http://localhost:3000/group/${group.id}/unInviteStudent/${userId}`
      );
      setStudents((prev) => prev.filter((item: any) => item.id != userId));
      toast.success("Student was successfully deleted from group");
    } catch (e) {
      console.error(e);
      toast.error("Error with deleting student");
    }
  };

  const handleBanUser = async (userId: string) => {
    try {
      const response = await axios.put(
        `http://localhost:3000/user/ban/${userId}`
      );
      setStudents((prev: any) =>
        prev.map((student: { id: string }) =>
          student.id === userId ? { ...student, banned: true } : student
        )
      );
      console.log(response);
    } catch (e) {
      console.log(e);
    }
  };
  const handleUnBanUser = async (userId: string) => {
    try {
      const response = await axios.put(
        `http://localhost:3000/user/unBan/${userId}`
      );
      setStudents((prev: any) =>
        prev.map((student: { id: string }) =>
          student.id === userId ? { ...student, banned: false } : student
        )
      );
      console.log(response);
    } catch (e) {
      console.log(e);
    }
  };
  const handleDeleteSubjectFromGroup = async (subjectId: string) => {
    try {
      const response = await axios.put(
        `http://localhost:3000/group/${group.id}/unInviteSubjectForGroup/${subjectId}`
      );
      console.log(response);
      setSubjects((prev: any) =>
        prev.filter((subject: { id: string }) => subject.id !== subjectId)
      );
    } catch (e) {
      console.log(e);
    }
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
  useEffect(() => {
    handleEvents();
    setSubjects(group.subjects);
    setStudents(group.students);
    handleGetRating();
  }, [group]);

  useEffect(() => {
    setBanned(students?.filter((item: any) => item.banned === true));
  }, [students]);
  return (
    <>
      <div className="w-full outline-none">
        <div className="flex justify-between items-start">
          <AlertDialogTitle>
            <div className=" w-full font-k2d text-4xl flex gap-2">
              {store.theme === "dark" ? (
                <Image src={LogoIconLight} className="animate-rotate size-10" />
              ) : (
                <Image src={LogoIconBlack} className="animate-rotate" />
              )}
              <h1 className="w-full">{group.name}</h1>
            </div>
          </AlertDialogTitle>
          <div className="flex w-auto justify-end">
            <RadialChart
              count={group.subjects?.length}
              label={"Subjects"}
              className={`scale-75 p-0`}
            />
            <RadialChart
              count={bannedUsers?.length}
              label={"Banned"}
              className={`scale-75 p-0`}
            />
            <RadialChart
              count={students?.length}
              label={"Students"}
              className={`scale-75 p-0`}
            />
          </div>
        </div>

        <Tabs defaultValue="Subjects">
          <TabsList>
            <TabsTrigger value="Subjects">
              Subjects {subjects?.length}
            </TabsTrigger>
            <TabsTrigger value="Students">
              Students {students?.length}
            </TabsTrigger>
            <TabsTrigger value="Events">Events {events.length}</TabsTrigger>
            <TabsTrigger value="Rating">Rating </TabsTrigger>
          </TabsList>

          <TabsContent value="Subjects">
            <div className="outline-none flex justify-between items-center p-0 my-2">
              {store.currentUser.roles.includes("Admin") ||
              store.currentUser.roles.includes("Teacher") ? (
                <div>
                  <p className="w-[120px] flex justify-center items-center text-sm text-center p-1.5 font-k2d bg-white rounded-lg border-2 border-neutral-200 hover:shadow-md cursor-pointer dark:bg-neutral-800 dark:border-neutral-400">
                    Add Subject
                  </p>
                </div>
              ) : (
                <div></div>
              )}
              <div className="relative">
                <CiSearch className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  placeholder=" Search..."
                  className="caret-[#34d399] dark:bg-neutral-800 dark:placeholder:text-white"
                />
              </div>
            </div>
            <div className="w-full overflow-y-auto h-1/3 flex flex-col gap-2 ">
              {subjects?.length > 0 &&
                subjects.map((item: any, index: number) => (
                  <Link
                    to={`/homepage/subjects/${item.id}`}
                    key={index}
                    className="h-10 flex w-auto justify-between items-center border border-t-2  animate-fadeInOpacity border-b-0 border-l-0 border-r-0 border-emerald-400 rounded-md py-2 px-2  shadow-sm hover:shadow-md cursor-pointer transition-colors duration-200 animation-fill-forwards dark:bg-neutral-800"
                  >
                    <div className="flex gap-4 font-k2d">
                      {store.theme === "dark" ? (
                        <Image
                          src={LogoIconLight}
                          className="animate-rotate size-5"
                        />
                      ) : (
                        <Image
                          src={LogoIconBlack}
                          className="animate-rotate size-5"
                        />
                      )}
                      {item.name}
                      <p className="text-xs px-1  bg-emerald-300 lowercase text-center rounded-full items-center flex">
                        {item.status}
                      </p>
                    </div>
                    {store.currentUser.roles.includes("Admin") && (
                      <div className="flex gap-1">
                        <button
                          name="button"
                          onClick={() => handleDeleteSubjectFromGroup(item.id)}
                          className="w-12 flex justify-center items-center dark:bg-transparent h-7 text-sm text-center p-1.5 font-k2d bg-white rounded-lg border-2 border-neutral-200 hover:shadow-md cursor-pointer hover:border-red-400 transition-colors duration-75"
                        >
                          <LiaTrashAltSolid size={20} />
                        </button>
                      </div>
                    )}
                  </Link>
                ))}
            </div>
          </TabsContent>
          <TabsContent value="Students">
            <div className="outline-none flex justify-between items-center p-0 my-2">
              {store.currentUser.roles.includes("Admin") ||
              store.currentUser.roles.includes("Teacher") ? (
                <div>
                  <AlertDialog>
                    <AlertDialogTrigger className="w-[120px] flex justify-center items-center text-sm text-center p-1.5 font-k2d bg-white rounded-lg border-2 border-neutral-200 hover:shadow-md cursor-pointer dark:bg-neutral-800 dark:border-neutral-400">
                      Invite Student
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <InviteStudentModal group={group} />
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              ) : (
                <div></div>
              )}
              <div className="relative">
                <CiSearch className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  placeholder=" Search..."
                  className="caret-[#34d399] dark:bg-neutral-800 dark:placeholder:text-neutral-400"
                />
              </div>
            </div>
            {students?.length ? (
              <div className="overflow-y-scroll h-96 w-full rounded-md grid grid-cols-2 gap-4 pr-4">
                {students?.length > 0 ? (
                  students.map((item: any, index: number) => (
                    <div
                      key={index}
                      className="flex w-full  justify-between border border-t-2 dark:bg-neutral-800 animate-fadeInOpacity border-b-0 border-l-0 border-r-0 border-emerald-400 rounded-lg p-4  shadow-sm hover:shadow-md cursor-pointer transition-colors duration-200 animation-fill-forwards"
                    >
                      <div className="flex justify-around w-full gap-4 font-k2d">
                        {item.img ? (
                          <Image
                            src={item.img}
                            className={
                              item.activeStatus == "Online"
                                ? "border-2 border-green-300 p-1 rounded-full w-16 h-16"
                                : "border-2 border-neutral-400 p-1 rounded-full w-16 h-16"
                            }
                          />
                        ) : (
                          <div className="w-16 h-16 border dark:border-neutral-600 rounded-full flex items-center justify-center">
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
                          </div>
                        )}
                        <div className="">
                          <p>{item.name}</p>
                          <p>{item.surname}</p>
                          <p>{item.email}</p>
                        </div>
                        <div className="flex flex-col gap-2 ">
                          {item.roles.map((item: any, index: number) => (
                            <span
                              key={index}
                              className="whitespace-nowrap flex items-center rounded-full bg-purple-100 px-2.5 py-0.2 text-xs text-purple-600"
                            >
                              {item}
                            </span>
                          ))}
                        </div>
                        {store.currentUser.roles.includes("Admin") ||
                        store.currentUser.roles.includes("Teacher") ? (
                          <div className="flex flex-col gap-2">
                            <div>
                              <button
                                onClick={() => handleUnInviteUser(item.id)}
                                className="w-auto flex justify-center items-center dark:bg-neutral-800  h-7 text-sm text-center p-1.5 font-k2d bg-white rounded-lg border-2 border-neutral-200 hover:shadow-md cursor-pointer hover:border-red-400 transition-colors duration-75 hover:text-red-400"
                              >
                                Disconnect
                              </button>
                            </div>
                            <div>
                              {!item.banned ? (
                                <button
                                  onClick={() => handleBanUser(item.id)}
                                  className="w-auto flex justify-center items-center  h-7 dark:bg-neutral-800 text-sm text-center p-1.5 font-k2d bg-white rounded-lg border-2 border-neutral-200 hover:shadow-md cursor-pointer hover:border-orange-400 transition-colors duration-75 hover:text-red-400"
                                >
                                  Ban
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleUnBanUser(item.id)}
                                  className="w-full border border-red-600 rounded-lg text-center px-4 justify-center items-center hover:shadow-md hover:bg-red-500 dark:text-white hover:text-white"
                                >
                                  unban
                                </button>
                              )}
                            </div>
                          </div>
                        ) : (
                          <></>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <></>
                )}
              </div>
            ) : (
              <div className="w-full h-auto flex justify-center items-center flex-col gap-3 h-">
                {store.theme === "dark" ? (
                  <Image
                    src={LogoIconLight}
                    className="animate-rotate size-8"
                  />
                ) : (
                  <Image src={LogoIconBlack} className="animate-rotate" />
                )}
                <h1 className="font-k2d">Empty</h1>
              </div>
            )}
          </TabsContent>
          <TabsContent value="Events">
            <div className="outline-none flex flex-col justify-between p-0 my-2 h-full">
              {store.currentUser.roles.includes("Admin") ||
              store.currentUser.roles.includes("Teacher") ? (
                <AlertDialog>
                  <AlertDialogTrigger className="w-[120px] flex justify-center items-center text-sm text-center p-1.5 font-k2d bg-white rounded-lg border-2 border-neutral-200 hover:shadow-md cursor-pointer dark:bg-neutral-800 dark:border-neutral-400">
                    Create Event
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <CreateEventModal />
                  </AlertDialogContent>
                </AlertDialog>
              ) : (
                <></>
              )}
              <div className="mt-4 overflow-y-scroll h-96 w-full">
                <Accordion
                  type="single"
                  collapsible
                  className="pr-4  flex flex-col gap-2 overflow-y-auto"
                >
                  {events?.length > 0 ? (
                    events
                      .sort((item1: any, item2: any) => {
                        if (item1.end < item2.end) {
                          return 1;
                        } else if (item1.end > item2.end) {
                          return -1;
                        } else {
                          return 0;
                        }
                      })
                      .map((item: EventTypes, index: number) => (
                        <AccordionItem
                          value={item.id}
                          key={index}
                          className={cn(
                            "border border-t-2 animate-fadeInOpacity border-b-0 border-l-0 border-r-0 border-emerald-400 rounded-md px-2  shadow-sm hover:shadow-md cursor-pointer transition-colors duration-200 animation-fill-forwards dark:bg-neutral-800",
                            item.status == "Old" && "border-red-500"
                          )}
                          style={{ animationDelay: `${index * 200}ms` }}
                        >
                          <AccordionTrigger className="font-k2d">
                            {item.title}{" "}
                            {item.status == "New" ? (
                              <p className="text-xs bg-emerald-200 px-2 py-0.5 rounded-full  lowercase text-emerald-500 font-k2d">
                                {item.status}
                              </p>
                            ) : (
                              <p className="text-xs bg-transparent border border-red-500 px-2 py-0.5 rounded-lg  lowercase text-red-500 font-k2d">
                                {item.status}
                              </p>
                            )}
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="text-xs underline lowercase">
                                  Start
                                </span>{" "}
                                {formatDate(item.start)} -{" "}
                                <span className="text-xs underline lowercase">
                                  {" "}
                                  End
                                </span>{" "}
                                {formatDate(item.end)}
                              </div>
                              <DatePickerWithRange
                                from={item.start}
                                to={item.end}
                              />
                              {store.currentUser.roles.includes("Admin") && (
                                <div>
                                  <button className="w-12 flex justify-center items-center  h-7 text-sm text-center p-1.5 font-k2d bg-white dark:bg-transparent rounded-lg border-2 border-neutral-200 hover:shadow-md cursor-pointer hover:border-red-400 transition-colors duration-75">
                                    <LiaTrashAltSolid size={20} />
                                  </button>
                                </div>
                              )}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))
                  ) : (
                    <div className="flex justify-center items-center">
                      <h1 className="font-k2d text-sm text-neutral-400">
                        Empty
                      </h1>
                    </div>
                  )}
                </Accordion>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="Rating">
            {ratings ? (
              <RatingsTable ratings={ratings} group={group} />
            ) : (
              <div className="text-center">Loading ratings...</div>
            )}
          </TabsContent>
        </Tabs>
        <AlertDialogCancel className="absolute top-4 right-4">
          <IoMdClose />
        </AlertDialogCancel>
      </div>
      <Toaster />
    </>
  );
};
