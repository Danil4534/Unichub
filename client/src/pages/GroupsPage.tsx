import axios from "axios";
import { FaUser, FaUsers } from "react-icons/fa";
import { debounce } from "lodash";
import React, { useEffect, useState } from "react";
import Breadcrumbs from "../components/Breadcrumbs";
import { CiSearch } from "react-icons/ci";
import { CustomInput } from "../components/ui/CustomInput";
import LogoIconBlack from "../assets/icons/LogoIconBlack.svg";
import LogoIconLight from "../assets/icons/LogoIconLight.svg";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTrigger,
} from "../components/ui/alert-dialog";
import { GroupModal } from "../components/modalViews/GroupModal/GroupModal";
import { Image } from "../components/ui/Image";
import { useStore } from "../store/store";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";

import { ChevronDown } from "lucide-react";
import { Button } from "../components/ui/button";
import { Group } from "../shared/types/Group";

const GroupsPage: React.FC = () => {
  const store = useStore();
  const [selectedGroup, setSelectedGroup] = useState("All Groups");
  const [groups, setGroups] = useState<Group[]>([]);
  const [displayGroups, setDisplayGroups] = useState<Group[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchGroups = debounce(async () => {
    try {
      const response = await axios.get(`http://localhost:3000/group`);
      setGroups(response.data);
      setDisplayGroups(response.data);
    } catch (e) {
      console.log(e);
    }
  }, 300);

  const filterGroups = (filter: string) => {
    if (filter === "My Group") {
      const myGroups = groups.filter((group) =>
        group.students.some((student) => student.id === store.currentUser.id)
      );
      setDisplayGroups(myGroups);
    } else {
      setDisplayGroups(groups);
    }
  };
  const filteredResults = displayGroups.filter((group) =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    fetchGroups();
  }, []);

  useEffect(() => {
    filterGroups(selectedGroup);
  }, [groups, selectedGroup]);
  return (
    <div className="flex flex-col w-full ">
      <div className="w-full flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          {store.theme === "dark" ? (
            <Image src={LogoIconLight} className="animate-rotate size-10" />
          ) : (
            <Image src={LogoIconBlack} className="animate-rotate" />
          )}
          <h1 className="font-k2d text-4xl uppercase">Unichub</h1>
        </div>
        <h1 className="font-k2d text-6xl">All Groups</h1>
      </div>
      <div className="flex h-[calc(100vh-180px)] w-full flex-col gap-2  rounded-2xl border border-neutral-200 bg-white  md: dark:border-neutral-700 dark:bg-neutral-900 p-4 ">
        <div className="flex items-center justify-between p-2">
          <Breadcrumbs />
          <div className="flex gap-2 w-full justify-center items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="ml-auto">
                  {selectedGroup} <ChevronDown className="ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuCheckboxItem
                  checked={selectedGroup === "My Group"}
                  onCheckedChange={() => setSelectedGroup("My Group")}
                  className="cursor-pointer hover:underline flex justify-center gap-2 "
                >
                  <FaUser />
                  My Group
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={selectedGroup === "All Groups"}
                  onCheckedChange={() => setSelectedGroup("All Groups")}
                  className="cursor-pointer hover:underline flex justify-center gap-2 "
                >
                  <FaUsers />
                  All Groups
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <div className="relative w-1/6">
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
              <Image src={LogoIconLight} className="animate-rotate size-10" />
            ) : (
              <Image src={LogoIconBlack} className="animate-rotate" />
            )}
            <h1 className="font-k2d">Empty</h1>
          </div>
        ) : (
          <div className="grid grid-cols-4 justify-center items-start gap-4 overflow-y-auto h-auto w-full p-4">
            {filteredResults.length > 0 &&
              filteredResults.map((item: any, index: number) => (
                <AlertDialog key={index}>
                  <AlertDialogTrigger
                    key={index}
                    style={{ animationDelay: `${index * 200}ms` }}
                    className="h-40 opacity-0 animate-fadeInOpacity hover:animate-background cursor-pointer rounded-2xl border-t-2 shadow-md border-emerald-400 hover:bg-[length:400%_400%] hover:shadow-xl animate-fill-forwards"
                  >
                    <div className="w-auto h-full rounded-2xl bg-white p-4 relative dark:bg-neutral-800">
                      <div className="absolute left-3 bottom-3">
                        {store.theme === "dark" ? (
                          <Image
                            src={LogoIconLight}
                            className="animate-rotate size-10"
                          />
                        ) : (
                          <Image
                            src={LogoIconBlack}
                            className="animate-rotate"
                          />
                        )}
                      </div>
                      <div className="flex gap-2 flex-col">
                        <div className="flex items-start justify-between">
                          <h3 className=" text-lg font-k2d font-medium text-gray-900 flex gap-2 dark:text-neutral-400">
                            Group
                          </h3>
                          <h3 className=" text-lg font-k2d font-medium text-gray-500 flex gap-2">
                            {item.name}
                          </h3>
                        </div>
                        <div className="flex justify-end gap-4 ">
                          <div className="flex flex-col gap-2">
                            <div className="w-20 flex-col-reverse h-20 border border-neutral-200 flex justify-center items-center font-k2d font-medium rounded-xl">
                              <h3 className="font-sm">Students</h3>
                              <p className="font-k2d text-2xl ">
                                {item.students.length}
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-col gap-2">
                            <div className="w-20 flex-col-reverse h-20 border border-neutral-200 flex justify-center items-center font-k2d font-medium rounded-xl">
                              <h3 className="font-sm">Subjects</h3>
                              <p className="font-k2d text-2xl">
                                {item.subjects.length}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <GroupModal group={item} />
                  </AlertDialogContent>
                </AlertDialog>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupsPage;
