import { Group } from "./Group";
import { Lesson } from "./Lesson";
import { Task } from "./Task";

export type Subject = {
  name: string;
  description: string;
  status: string;
  userId: string;
  lessons: Lesson[];
  tasks: Task[];
  groups: Group[];
};
