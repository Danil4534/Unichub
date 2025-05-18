import React, { useEffect, useState } from "react";
import { cn } from "../lib/utils";
import { Sidebar, SidebarBody } from "./ui/SideBar";
import { Outlet, useLocation } from "react-router-dom";
import Header from "./Header";
import EventCalendar from "./EventCalendar";
import { RadialChart } from "./ui/RadialChart";
import BigCalendar from "./BigCalendar/BigCalendar";
import { SideBarContent } from "./SideBarContent";
import Events from "./Events";
import axios from "axios";
import { useStore } from "../store/store";
import LogoIconBlack from "../assets/icons/LogoIconBlack.svg";
import LogoIconLight from "../assets/icons/LogoIconLight.svg";
import { Image } from "./ui/Image";

type RadialChartProps = {
  label: string;
  count: number;
};

export const SideBarNav: React.FC = () => {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const [, setGroups] = useState<RadialChartProps[]>([]);
  const [, setTeachers] = useState<RadialChartProps[]>([]);
  const [, setUsers] = useState<RadialChartProps[]>();
  const [data, setData] = useState<RadialChartProps[]>([]);

  const handleGroups = async () => {
    const response = await axios.get(`http://localhost:3000/group`);
    setGroups(response.data);
    return { label: "Group", count: response.data.length };
  };
  const handleUsers = async () => {
    const response = await axios.get(`http://localhost:3000/user`);
    setUsers(response.data);
    return { label: "Users", count: response.data.length };
  };
  const handleTeachers = async () => {
    const where = encodeURIComponent(
      JSON.stringify({ roles: { has: "Teacher" } })
    );
    const response = await axios.get(
      `http://localhost:3000/user?where=${where}`
    );
    setTeachers(response.data);
    return { label: "Teachers", count: response.data.length };
  };
  const handleStudents = async () => {
    const where = encodeURIComponent(
      JSON.stringify({
        roles: { has: "Student" },
      })
    );
    const response = await axios.get(
      `http://localhost:3000/user?where=${where}`
    );
    return { label: "Students", count: response.data.length };
  };
  useEffect(() => {
    const fetchData = async () => {
      try {
        const results = await Promise.all([
          handleGroups(),
          handleUsers(),
          handleTeachers(),
          handleStudents(),
        ]);
        setData(results);
      } catch (e) {
        console.log(e);
      }
    };
    fetchData();
  }, []);

  const store = useStore();
  return (
    <div
      className={cn(
        "flex w-full flex-row overflow-hidden  border border-neutral-200 bg-gray-100 md:flex-row dark:border-neutral-700 dark:bg-neutral-800"
      )}
    >
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-10">
          <SideBarContent open={open} />
        </SidebarBody>
      </Sidebar>
      <div className="flex h-full w-full">
        <div className="flex h-screen w-full flex-col gap-2 rounded-tl-2xl rounded-bl-2xl border border-neutral-200 bg-white p-2 md: dark:border-neutral-700 dark:bg-neutral-900 ">
          <Header />
          <div className="w-full h-auto flex flex-row gap-2 animate-fadeIn">
            {pathname == "/homepage" ? (
              <div className="w-full h-auto border border-neutral-200 dark:border-neutral-600 rounded-2xl justify-center items-center p-4 animate-fadeInOpacity">
                <div className="flex justify-between">
                  <h1 className="font-k2d text-2xl mb-2">Schedule</h1>
                  <div className="flex justify-end items-center gap-2">
                    {store.theme === "dark" ? (
                      <Image
                        src={LogoIconLight}
                        className="animate-rotate size-10"
                      />
                    ) : (
                      <Image src={LogoIconBlack} className="animate-rotate" />
                    )}
                    <h1 className="font-k2d text-4xl uppercase">Unichub</h1>
                  </div>
                </div>
                <div className="flex h-auto">
                  <BigCalendar className="w-2/3 h-1/3 animate-rightIn " />
                  <div className="grid grid-cols-2 gap-0 h-1/6 ">
                    {data.map((item: any, index: number) => (
                      <div key={index}>
                        <RadialChart
                          count={item.count}
                          label={item.label}
                          className="p-0 m-0"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              ""
            )}
            <Outlet />
            <div className="flex flex-col gap-2">
              <div className="h-auto w-[380px] rounded-2xl border border-neutral-200 dark:border-neutral-600 p-4">
                <EventCalendar />
                <Events />
              </div>
              {/* <div className=" w-[380px] rounded-2xl border border-neutral-200 dark:border-neutral-600 p-4 animate-rightIn">
                <UserStatistics users={users} />
              </div> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
