import React, { useEffect, useState } from "react";
import { debounce } from "lodash";
import axios from "axios";
import Breadcrumbs from "../components/Breadcrumbs";
import { CiSearch } from "react-icons/ci";
import { CustomInput } from "../components/ui/CustomInput";
import { Image } from "../components/ui/Image";
import LogoIconBlack from "../assets/icons/LogoIconBlack.svg";
import LogoIconLight from "../assets/icons/LogoIconLight.svg";
import { useStore } from "../store/store";
import { Link } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { FaUser, FaUsers } from "react-icons/fa";

import { Subject } from "../shared/types/Subject";
import { Button } from "../components/ui/button";
import { toast } from "sonner";
const SubjectsPage: React.FC = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [displaySubjects, setDisplaySubject] = useState<Subject[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubject, setSelectedSubject] =
    useState<string>("All Subjects");
  const store = useStore();

  const fetchGroups = debounce(async () => {
    try {
      const responseSubjects = await axios.get(`http://localhost:3000/subject`);
      setSubjects(responseSubjects.data);
      setDisplaySubject(responseSubjects.data);
    } catch (e: any) {
      toast.error(e);
    }
  });

  const filterSubjects = (filter: string) => {
    if (filter === "My Subjects") {
      const mySubjects = subjects.filter((subject: Subject) =>
        subject.groups.some(
          (group: any) => group.id == store.currentUser.groupId
        )
      );
      setDisplaySubject(mySubjects);
    } else {
      setDisplaySubject(subjects);
    }
  };

  const filteredResults = displaySubjects.filter((item: any) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    filterSubjects(selectedSubject);
  }, [selectedSubject, subjects]);

  useEffect(() => {
    fetchGroups();
    setSelectedSubject("All subjects");
  }, [searchTerm]);
  return (
    <div className="flex flex-col w-full ">
      <div className="w-full flex justify-between mb-2">
        <div className="flex items-center gap-2">
          {store.theme === "dark" ? (
            <Image src={LogoIconLight} className="animate-rotate size-10" />
          ) : (
            <Image src={LogoIconBlack} className="animate-rotate" />
          )}
          <h1 className="font-k2d text-4xl uppercase">Unichub</h1>
        </div>
        <h1 className="font-k2d text-6xl">All Subjects</h1>
      </div>
      <div className="w-full h-[calc(100vh-180px)] gap-4  border shadow-sm border-neutral-200 dark:border-neutral-600 rounded-2xl p-2">
        <div className="flex items-center justify-between p-4">
          <Breadcrumbs />
          <div className="flex gap-2 w-full justify-center items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="ml-auto">
                  {selectedSubject} <ChevronDown className="ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuCheckboxItem
                  checked={selectedSubject === "My Subjects"}
                  onCheckedChange={() => setSelectedSubject("My Subjects")}
                  className="cursor-pointer hover:underline flex justify-center gap-2 "
                >
                  <FaUser />
                  My Subjects
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={selectedSubject === "All Subjects"}
                  onCheckedChange={() => setSelectedSubject("All Subjects")}
                  className="cursor-pointer hover:underline flex justify-center gap-2 "
                >
                  <FaUsers />
                  All Subjects
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <div className="relative w-1/6">
              <CiSearch className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <CustomInput
                type="text"
                placeholder=" Search..."
                onChange={(e) => setSearchTerm(e.target.value)}
                className="caret-[#34d399] dark:bg-neutral-800 dark:placeholder:text-neutral-400"
              />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-4 overflow-y-auto w-full p-4">
          {filteredResults.length > 0 ? (
            filteredResults.map((item: any, index: number) => (
              <Link to={`/homepage/subjects/${item.id}`}>
                <div
                  key={index}
                  style={{ animationDelay: `${index * 200}ms` }}
                  className="h-40 opacity-0 animate-fadeInOpacity hover:animate-background cursor-pointer rounded-2xl border-t-2 shadow-md border-emerald-400 hover:bg-[length:400%_400%] hover:shadow-xl animate-fill-forwards"
                >
                  <div className="w-auto h-full rounded-2xl bg-white p-2.5 relative dark:bg-neutral-800">
                    <div className="absolute left-3 bottom-3">
                      {store.theme === "dark" ? (
                        <Image
                          src={LogoIconLight}
                          className="animate-rotate size-10"
                        />
                      ) : (
                        <Image src={LogoIconBlack} className="animate-rotate" />
                      )}
                    </div>
                    <div className="flex gap-1 flex-col w-full">
                      <div className="flex items-start justify-between">
                        <div className="">
                          <h3 className=" text-lg font-k2d font-medium text-neutral-400 flex gap-2">
                            Subject
                          </h3>
                          <p className="text-xs p-0.5 bg-emerald-300 lowercase text-center rounded-full">
                            {item.status}
                          </p>
                        </div>
                        <h3 className=" text-lg font-k2d font-medium text-gray-500 flex gap-2">
                          {item.name}
                        </h3>
                      </div>
                      <div className="flex w-full items-center justify-end gap-2 ">
                        <div className="flex flex-col gap-2">
                          <div className="w-20 flex-col-reverse h-20 border border-neutral-200 flex justify-center items-center font-k2d font-medium rounded-xl">
                            <h3 className="font-sm">Tasks</h3>
                            <p className="font-k2d text-2xl ">
                              {item.tasks.length}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2">
                          <div className="w-20 flex-col-reverse h-20 border border-neutral-200 flex justify-center items-center font-k2d font-medium rounded-xl">
                            <h3 className="font-sm">Lessons</h3>
                            <p className="font-k2d text-2xl">
                              {item.lessons.length}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <>Empty</>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubjectsPage;
