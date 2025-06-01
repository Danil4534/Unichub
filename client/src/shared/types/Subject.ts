import { Group } from "./Group";
import { Lesson } from "./Lesson";
import { Task } from "./Task";

export type Subject = {
  id: string | undefined;
  name: string;
  description: string;
  status: string;
  userId: string;
  lessons: Lesson[];
  tasks: Task[];
  groups: Group[];
};
