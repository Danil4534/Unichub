import Breadcrumbs from "../components/Breadcrumbs";
import { Image } from "../components/ui/Image";
import { useStore } from "../store/store";
import LogoIconBlack from "../assets/icons/LogoIconBlack.svg";
import LogoIconLight from "../assets/icons/LogoIconLight.svg";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { Tabs, TabsList, TabsTrigger } from "../components/ui/tabs";
import { TabsContent } from "@radix-ui/react-tabs";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTrigger,
} from "../components/ui/alert-dialog";

type Subject = {
  name: string;
  description: string;
  status: string;
  userId: string;
  tasks: Task[];
};

type Task = {
  id: string;
  title: string;
  description: string;
  type: string;
  startTime: string;
  endTime: string;
  grade: number;
  lessonId: string;
  subjectId: string;
};

const SubjectPage: React.FC = () => {
  const { id } = useParams();
  const subjectId = id;
  const [subject, setSubject] = useState<Subject>();
  const store = useStore();
  const handleSubject = async () => {
    try {
      const response = await axios.get(
        `http://localhost:3000/subject/${subjectId}`
      );
      setSubject(response.data);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    handleSubject();
  }, []);

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
      </div>
      <div className="flex h-full w-full flex-col gap-2 p-4 rounded-2xl border border-neutral-200 bg-white  md: dark:border-neutral-700 dark:bg-neutral-900 ">
        <div className="flex items-center justify-between ">
          <Breadcrumbs />
          <div className="flex gap-2 items-center">
            {store.theme === "dark" ? (
              <Image src={LogoIconLight} className="animate-rotate size-10" />
            ) : (
              <Image src={LogoIconBlack} className="animate-rotate" />
            )}
            <h1 className="font-k2d text-5xl text-end">{subject?.name}</h1>
          </div>
        </div>
        <div>
          <Tabs defaultValue="Tasks">
            <TabsList>
              <TabsTrigger value="Tasks">Tasks</TabsTrigger>
              <TabsTrigger value="Lessons">Lessons</TabsTrigger>
              <TabsTrigger value="Students">Students</TabsTrigger>
              <TabsTrigger value="Grades">Grades</TabsTrigger>
            </TabsList>
            <TabsContent value="Tasks">
              <>
                {store.currentUser.roles.includes("Admin") ||
                store.currentUser.roles.includes("Teacher") ? (
                  <AlertDialog>
                    <AlertDialogTrigger className="w-[120px] flex justify-center items-center text-sm text-center p-1.5 font-k2d bg-white rounded-lg border-2 border-neutral-200 hover:shadow-md cursor-pointer dark:bg-neutral-800 dark:border-neutral-400">
                      Create Task
                    </AlertDialogTrigger>
                    <AlertDialogContent></AlertDialogContent>
                  </AlertDialog>
                ) : (
                  <></>
                )}
              </>
              {subject?.tasks.map((item: Task) => (
                <div key={item.id}>{item.title}</div>
              ))}
            </TabsContent>
            <TabsContent value="Lessons"></TabsContent>
            <TabsContent value="Students"></TabsContent>
            <TabsContent value="Grades"></TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default SubjectPage;
