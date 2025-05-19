import { Subject } from "./Subject";
import { User } from "./User";

export type Group = {
  id: string;
  name: string;
  status: string;
  students: User[];
  subjects: Subject[];
};
