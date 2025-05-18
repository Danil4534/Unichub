import { Subject } from "./Subject";
import { User } from "./User";

export type Group = {
  name: string;
  status: string;
  students: User[];
  subjects: Subject[];
};
