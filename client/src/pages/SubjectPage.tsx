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
import { CiSearch } from "react-icons/ci";
import { CustomInput } from "../components/ui/CustomInput";
import { Subject } from "../shared/types/Subject";
import { Task } from "../shared/types/Task";
import KanbanComponent from "../components/KanbanComponent";
import { Lesson } from "../shared/types/Lesson";
import { CreateTaskModal } from "../components/modalViews/CreateTaskModal";
import { toast } from "sonner";

const SubjectPage: React.FC = () => {
  const { id } = useParams();
  const subjectId = id;
  const [subject, setSubject] = useState<Subject>();
  const [defaultTasks, setDefaultTasks] = useState<Task[]>();
  const [testTasks, setTestTasks] = useState<Task[]>();
  const [lessons, setLessons] = useState<Lesson[]>();
  const store = useStore();
  const handleSubject = async () => {
    try {
      const response = await axios.get(
        `http://localhost:3000/subject/${subjectId}`
      );
      setSubject(response.data);
      setDefaultTasks(
        response.data.tasks.filter((item: Task) => item.type == "Default")
      );
      setTestTasks(
        response.data.tasks.filter((item: Task) => item.type == "Test")
      );
      setLessons(response.data.lessons);
      console.log("DefaultTasks", defaultTasks);
      console.log("Tests", testTasks);
    } catch (e) {
      console.log(e);
    }
  };

  const handleDeleteAllLessons = async (subjectId: string | undefined) => {
    const response = await axios.delete(
      `http://localhost:3000/lessons/deleteAllLessonsIntoSubject/${subjectId}`
    );
    if (response.status === 200) {
      toast.success("All lessons into this subject was successfully deleted");
    } else {
      toast.error("Error with deleting lessons");
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
      <div className="flex h-[calc(100vh-160px)]  w-full flex-col gap-2 p-4 rounded-2xl border border-neutral-200 bg-white  md: dark:border-neutral-700 dark:bg-neutral-900 ">
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
          <h1>{subject?.description}</h1>
        </div>

        <div>
          <Tabs defaultValue="Tasks">
            <TabsList>
              <TabsTrigger value="Tasks" className="flex gap-2">
                Tasks {defaultTasks?.length}
              </TabsTrigger>
              <TabsTrigger value="Test">Tests {testTasks?.length}</TabsTrigger>
              <TabsTrigger value="Lessons">
                Lessons {subject?.lessons.length}
              </TabsTrigger>

              <TabsTrigger value="Grades">Grades</TabsTrigger>
            </TabsList>
            <TabsContent value="Tasks">
              <>
                <div className="flex flex-row-reverse my-2">
                  <div className="flex w-full gap-2 justify-end">
                    <div className="relative w-1/5">
                      <CiSearch className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <CustomInput
                        type="text"
                        placeholder=" Search..."
                        className="caret-[#34d399] dark:bg-neutral-800 dark:placeholder:text-neutral-400 dark:text-white"
                      />
                    </div>
                  </div>
                  {store.currentUser?.roles.includes("Admin") ||
                  store.currentUser?.roles.includes("Teacher") ? (
                    <div className="flex gap-2">
                      <AlertDialog>
                        <AlertDialogTrigger className="w-[120px] flex justify-center items-center text-sm text-center p-1.5 font-k2d bg-white rounded-lg border-2 border-neutral-200 hover:shadow-md cursor-pointer dark:bg-neutral-800 dark:border-neutral-400">
                          Create Task
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <CreateTaskModal />
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  ) : (
                    <></>
                  )}
                </div>

                <div>
                  <KanbanComponent defaultTasks={defaultTasks} />
                </div>
              </>
            </TabsContent>
            <TabsContent value="Test">
              <>
                <div className="flex flex-row-reverse my-2">
                  <div className="flex w-full gap-2 justify-end">
                    <div className="relative w-1/5">
                      <CiSearch className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <CustomInput
                        type="text"
                        placeholder=" Search..."
                        className="caret-[#34d399] dark:bg-neutral-800 dark:placeholder:text-neutral-400 dark:text-white"
                      />
                    </div>
                  </div>
                  {store.currentUser?.roles.includes("Admin") ||
                  store.currentUser?.roles.includes("Teacher") ? (
                    <AlertDialog>
                      <AlertDialogTrigger className="w-[120px] flex justify-center items-center text-sm text-center p-1.5 font-k2d bg-white rounded-lg border-2 border-neutral-200 hover:shadow-md cursor-pointer dark:bg-neutral-800 dark:border-neutral-400">
                        Create Test
                      </AlertDialogTrigger>
                      <AlertDialogContent></AlertDialogContent>
                    </AlertDialog>
                  ) : (
                    <></>
                  )}
                </div>

                <div>
                  <KanbanComponent defaultTasks={testTasks} />
                </div>
              </>
            </TabsContent>
            <TabsContent value="Lessons">
              <>
                <div className="flex flex-row-reverse my-2">
                  <div className="flex w-full gap-2 justify-end">
                    <div className="relative w-1/5">
                      <CiSearch className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <CustomInput
                        type="text"
                        placeholder=" Search..."
                        className="caret-[#34d399] dark:bg-neutral-800 dark:placeholder:text-neutral-400 dark:text-white"
                      />
                    </div>
                  </div>
                  {store.currentUser?.roles.includes("Admin") ||
                  store.currentUser?.roles.includes("Teacher") ? (
                    <div className="flex gap-2">
                      <AlertDialog>
                        <AlertDialogTrigger className="w-[120px] flex justify-center items-center text-sm text-center p-1.5 font-k2d bg-white rounded-lg border-2 border-neutral-200 hover:shadow-md cursor-pointer dark:bg-neutral-800 dark:border-neutral-400">
                          Create Lesson
                        </AlertDialogTrigger>
                        <AlertDialogContent></AlertDialogContent>
                      </AlertDialog>
                      <button
                        onClick={() => handleDeleteAllLessons(subject?.id)}
                        className="w-[120px] flex justify-center items-center text-sm text-center p-1.5 font-k2d bg-white rounded-lg border-2 border-neutral-200 hover:shadow-md cursor-pointer dark:bg-neutral-800 dark:border-neutral-400"
                      >
                        Delete All Tasks
                      </button>
                    </div>
                  ) : (
                    <>
                      <h1>Lessons</h1>
                    </>
                  )}
                </div>

                <div>
                  <KanbanComponent lessons={lessons} />
                </div>
              </>
            </TabsContent>
            <TabsContent value="Grades"></TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default SubjectPage;
