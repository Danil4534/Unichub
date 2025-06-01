import { useEffect, useState } from "react";
import {
  DragEndEvent,
  KanbanBoard,
  KanbanCard,
  KanbanCards,
  KanbanHeader,
  KanbanProvider,
} from "./ui/shadcn-io/kanban";

import { toast } from "sonner";
import { Task } from "../shared/types/Task";
import { Lesson } from "../shared/types/Lesson";
import axios from "axios";
import { useStore } from "../store/store";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { HiOutlineDotsHorizontal } from "react-icons/hi";
import { LiaTrashAltSolid } from "react-icons/lia";
import { FaRegEdit } from "react-icons/fa";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTrigger,
} from "./ui/alert-dialog";
import { TaskModal } from "./modalViews/TaskModal";
import { Toaster } from "./ui/sonner";

export interface Feature {
  id: string;
  type: "task" | "lesson" | "test";
  name: string;
  description: string;
  startAt: string;
  endAt: string;
  status: { id: string; name: string; color: string };
  group: { id: string; name: string };
  product: { id: string; name: string };
  owner: { id: string; image: string; name: string };
  initiative: { id: string; name: string };
  release: { id: string; name: string };
}

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const dayOfWeek = daysOfWeek[date.getUTCDay()];
  const dayOfMonth = String(date.getUTCDate()).padStart(2, "0");
  const hours = String(date.getUTCHours()).padStart(2, "0");
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");
  return `${dayOfWeek} ${dayOfMonth}, ${hours}:${minutes}`;
};

const exampleStatuses = [
  { id: "1", name: "Planned", color: "#6B7280" },
  { id: "2", name: "New", color: "#00ff00" },
  { id: "3", name: "Past", color: "#ff0000" },
  { id: "4", name: "Done", color: "#10B981" },
];

const KanbanComponent = ({
  defaultTasks = [],
  lessons = [],
}: {
  defaultTasks?: Task[];
  lessons?: Lesson[];
}) => {
  const store = useStore();
  const [features, setFeatures] = useState<Feature[]>([]);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const status = exampleStatuses.find((s) => s.name === over.id);
    if (!status) return;

    const feature = features.find((f) => f.id === active.id);
    if (!feature) return;

    const newStatusIndex = exampleStatuses.findIndex(
      (s) => s.name === status.name
    );
    if (newStatusIndex === -1) return;

    try {
      if (feature.type === "task") {
        await axios.put(
          `http://localhost:3000/task/updateStatusForTask/${feature.id}/${newStatusIndex}`
        );
      } else if (feature.type === "lesson") {
        await axios.put(
          `http://localhost:3000/lesson/updateStatusForLesson/${feature.id}/${newStatusIndex}`
        );
      }

      setFeatures((prev) =>
        prev.map((f) => (f.id === feature.id ? { ...f, status } : f))
      );
      toast.success("Status was changed");
    } catch (err) {
      console.error("Error with update", err);
      toast.error("Error with update");
    }
  };

  useEffect(() => {
    let isMounted = true;

    const loadFeatures = async () => {
      try {
        const tasks = defaultTasks.map((item, index) => ({
          id: item.id,
          type: "task" as const,
          name: item.title,
          description: item.description,
          startAt: item.startTime,
          endAt: item.endTime,
          status: exampleStatuses[item.status],
          group: { id: "1", name: "Default Group" },
          product: { id: "1", name: "Default Product" },
          owner: {
            id: String(index),
            image: `https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=${index}`,
            name: `User ${index + 1}`,
          },
          initiative: { id: "1", name: item.title },
          release: { id: "1", name: "v1.0" },
        }));

        const lessonsData = lessons.map((item, index) => ({
          id: item.id,
          type: "lesson" as const,
          name: item.title,
          startAt: item.startTime,
          description: item.description,
          endAt: item.endTime,
          status: exampleStatuses[item.status],
          group: { id: "1", name: "Default Group" },
          product: { id: "1", name: "Default Product" },
          owner: {
            id: String(index + tasks.length),
            image: `https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=${
              index + tasks.length
            }`,
            name: `User ${index + tasks.length + 1}`,
          },
          initiative: { id: "1", name: item.title },
          release: { id: "1", name: "v1.0" },
        }));

        if (isMounted) {
          setFeatures([...tasks, ...lessonsData]);
        }
      } catch (e: any) {
        console.error(e);
        toast.error(e.message || "Ошибка загрузки");
      }
    };

    loadFeatures();

    return () => {
      isMounted = false;
    };
  }, [JSON.stringify(defaultTasks), JSON.stringify(lessons)]);
  const visibleStatuses = exampleStatuses.filter((status) => {
    if (status.name === "Planned") {
      return (
        store.currentUser.roles.includes("Teacher") ||
        store.currentUser.roles.includes("Admin")
      );
    }
    return true;
  });
  const isTeacher = store.currentUser.roles.includes("Teacher");
  const handleDeleteTask = async (taskId: string) => {
    try {
      const featureToDelete = features.find((f) => f.id === taskId);
      console.log("featureToDelete", featureToDelete);
      if (!featureToDelete) return;

      let url = "";

      if (featureToDelete.type === "task") {
        url = `http://localhost:3000/task/${taskId}`;
        console.log("Delete task");
      } else if (featureToDelete.type === "lesson") {
        url = `http://localhost:3000/lesson/${taskId}`;
        console.log("Delete lesson");
      } else {
        toast.error("Unsupported feature type");
        return;
      }

      const response = await axios.delete(url);
      if (response.status === 200) {
        toast.success("Successfully deleted");
        setFeatures((prev) => prev.filter((feature) => feature.id !== taskId));
      }
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || "Ошибка при удалении");
    }
  };

  return (
    <>
      <KanbanProvider onDragEnd={handleDragEnd} className="p-4">
        {visibleStatuses.map((status) => (
          <KanbanBoard key={status.name} id={status.name}>
            <KanbanHeader name={status.name} color={status.color} />
            <KanbanCards className="z-10">
              <div className="h-full">
                {features
                  .filter((feature) => feature.status.name === status.name)
                  .map((feature: Feature, index) => (
                    <KanbanCard
                      key={feature.id}
                      id={feature.id}
                      name={feature.name}
                      parent={status.name}
                      index={index}
                      canDrag={isTeacher}
                      className="relative"
                    >
                      <div className="absolute top-2 right-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger>
                            <HiOutlineDotsHorizontal />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem className="cursor-pointer">
                              <FaRegEdit className="text-neutral-500" />{" "}
                              <span>Edit</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                handleDeleteTask(feature.id);
                              }}
                              onDragStart={(e) => e.preventDefault()}
                              onPointerDown={(e) => e.stopPropagation()}
                              className="cursor-pointer text-destructive"
                            >
                              <LiaTrashAltSolid className="text-destructive" />{" "}
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <div>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <button
                              className="hover:underline text-left"
                              onClick={(e) => e.stopPropagation()}
                              onDragStart={(e) => e.preventDefault()}
                              onPointerDown={(e) => e.stopPropagation()}
                            >
                              {feature.name}
                            </button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <TaskModal feature={feature} />
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                      <p className="m-0 text-muted-foreground text-xs">
                        start {formatDate(feature.startAt)}
                      </p>
                      <p className="m-0 text-muted-foreground text-xs">
                        end {formatDate(feature.endAt)}
                      </p>
                    </KanbanCard>
                  ))}
              </div>
            </KanbanCards>
          </KanbanBoard>
        ))}
      </KanbanProvider>
      <Toaster />
    </>
  );
};

export default KanbanComponent;
