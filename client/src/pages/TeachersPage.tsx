import React, { useEffect, useState } from "react";
import Breadcrumbs from "../components/Breadcrumbs";
import axios from "axios";
import { debounce } from "lodash";
import { CiSearch } from "react-icons/ci";
import { CustomInput } from "../components/ui/CustomInput";
import { Image } from "../components/ui/Image";
import LogoIconBlack from "../assets/icons/LogoIconBlack.svg";

import { io } from "socket.io-client";
import { useStore } from "../store/store";
import LogoIconLight from "../assets/icons/LogoIconLight.svg";
import TeacherIcon from "../assets/icons/icon _teacher_Light.svg";
import { cn } from "../lib/utils";
import { toast } from "sonner";
import { BsTelegram } from "react-icons/bs";
const TeachersPage: React.FC = () => {
  const [teachers, setTeachers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [socket, setSocket] = useState<any>(null);
  const store = useStore();

  const fetchTeachers = debounce(async () => {
    const where = encodeURIComponent(
      JSON.stringify({ roles: { has: "Teacher" } })
    );
    try {
      const response = await axios.get(
        `http://localhost:3000/user?where=${where}`
      );
      setTeachers(response.data);
    } catch (e: any) {
      toast.error(e);
    }
  });
  const filteredResults = teachers.filter((item: any) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  function formatNameSurname(name: string, surname: string) {
    return `${name} ${surname}`;
  }
  const handleCreateNewChat = (currentUserId: string, userId: string) => {
    if (!socket) return;
    socket.emit("createChat", { userId1: currentUserId, userId2: userId });
  };
  useEffect(() => {
    const newSocket = io("http://localhost:3000");
    setSocket(newSocket);
    fetchTeachers();
  }, [searchTerm]);
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
        <h1 className="font-k2d text-6xl">All Teachers</h1>
      </div>
      <div className="flex h-[calc(100vh-180px)] w-full flex-col gap-2 p-4 rounded-2xl border border-neutral-200 bg-white  md: dark:border-neutral-700 dark:bg-neutral-900 ">
        <div className="flex items-center justify-between p-4 ">
          <Breadcrumbs />
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
        </div>
        {filteredResults.length == 0 ? (
          <div className="w-full h-full flex justify-center items-center flex-col gap-3">
            {store.theme === "dark" ? (
              <Image src={LogoIconLight} className="animate-rotate size-8" />
            ) : (
              <Image src={LogoIconBlack} className="animate-rotate" />
            )}
            <h1 className="font-k2d">Empty</h1>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-4 overflow-y-auto h-4/5 w-full p-4">
            {filteredResults.length > 0 &&
              filteredResults.map((item: any, index: number) => (
                <div
                  key={index}
                  style={{ animationDelay: `${index * 200}ms` }}
                  className={cn(
                    "relative group h-40 opacity-0 animate-fadeInOpacity hover:animate-background cursor-pointer rounded-2xl border-t-2 shadow-md border-emerald-400 hover:bg-[length:400%_400%] hover:shadow-xl animate-fill-forwards",
                    {
                      "border-red-400": item.banned,
                    }
                  )}
                >
                  <Image
                    src={TeacherIcon}
                    className="absolute top-4 right-4 w-5 z-10"
                  />
                  <div className="absolute z-20 top-0 left-1/2 -translate-x-1/2  -translate-y-3 lowercase bg-red-400 w-full text-center text-white text-sm px-2  rounded-t-2xl  opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    {item.banned ? "Banned" : <></>}
                  </div>
                  <div className="w-auto h-full rounded-2xl bg-white p-2 sm:p-2 dark:bg-neutral-800 relative">
                    <div className="flex flex-row gap-2 h-full">
                      <div className="flex  justify-start gap-2">
                        {item.img ? (
                          <Image
                            src={item.img}
                            className={
                              item.activeStatus == "Online"
                                ? " border-2 border-green-300 p-1 rounded-full w-16 h-16  dark:border-2 dark:border-emerald-400"
                                : "border-2 border-neutral-400 p-1 rounded-full w-16 h-16 dark:border-neutral-200 dark:border-2"
                            }
                          />
                        ) : (
                          <div className="border border-neutral-300 rounded-full w-16 h-16 items-center flex justify-center">
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
                      </div>
                      <div className="flex h-full w-auto flex-col justify-start items-start ">
                        <h3 className="mt-0.5 text-lg font-k2d font-medium text-gray-900 flex gap-2 dark:text-neutral-400">
                          {formatNameSurname(item.name, item.surname)}
                        </h3>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {item.roles.map((item: any, index: number) => (
                            <span
                              key={index}
                              className="whitespace-nowrap rounded-full bg-purple-100 px-2.5 py-0.5 text-xs text-purple-600"
                            >
                              {item}
                            </span>
                          ))}
                        </div>{" "}
                        <span className="flex items-center gap-2 mt-2">
                          <BsTelegram />
                          @Telegram
                        </span>
                        <button
                          onClick={() =>
                            handleCreateNewChat(store.currentUser.id, item.id)
                          }
                          className=" absolute right-2 bottom-2 mt-2 rounded-xl bg-slate-800 text-white px-4 py-2 text-sm hover:bg-emerald-600 transition"
                        >
                          Send Message
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeachersPage;
