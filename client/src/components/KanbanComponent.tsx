import { useEffect, useState } from "react";
import {
  DragEndEvent,
  KanbanBoard,
  KanbanCard,
  KanbanCards,
  KanbanHeader,
  KanbanProvider,
} from "./ui/shadcn-io/kanban";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
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
import { RiUnpinLine } from "react-icons/ri";
import { LiaTrashAltSolid } from "react-icons/lia";
import { FaRegEdit } from "react-icons/fa";

interface Feature {
  id: string;
  type: "task" | "lesson" | "test";
  name: string;
  startAt: Date;
  endAt: Date;
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
          startAt: new Date(item.startTime),
          endAt: new Date(item.endTime),
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
          startAt: new Date(item.startTime),
          endAt: new Date(item.endTime),
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
  return (
    <KanbanProvider onDragEnd={handleDragEnd} className="p-4">
      {visibleStatuses.map((status) => (
        <KanbanBoard key={status.name} id={status.name}>
          <KanbanHeader name={status.name} color={status.color} />
          <KanbanCards>
            <div className="h-full">
              {features
                .filter((feature) => feature.status.name === status.name)
                .map((feature, index) => (
                  <KanbanCard
                    key={feature.id}
                    id={feature.id}
                    name={feature.name}
                    parent={status.name}
                    index={index}
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
                          <DropdownMenuItem>
                            <LiaTrashAltSolid />
                            <span>Delete</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex flex-col gap-1">
                        <p className="m-0 flex-1 font-medium text-sm">
                          {feature.name}
                        </p>
                        <p className="m-0 text-muted-foreground text-xs">
                          start {formatDate(feature.startAt.toDateString())}
                        </p>
                        <p className="m-0 text-muted-foreground text-xs">
                          end {formatDate(feature.endAt.toDateString())}
                        </p>
                      </div>
                    </div>
                  </KanbanCard>
                ))}
            </div>
          </KanbanCards>
        </KanbanBoard>
      ))}
    </KanbanProvider>
  );
};

export default KanbanComponent;
