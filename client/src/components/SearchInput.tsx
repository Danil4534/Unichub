// import { useState, useEffect } from "react";
// import axios from "axios";
// import { debounce } from "lodash";
import { CustomInput } from "./ui/CustomInput";
import { CiSearch } from "react-icons/ci";
import { cn } from "../lib/utils";

export default function SearchInput({ className }: { className: string }) {
  // const [searchTerm, setSearchTerm] = useState("");
  // const [results, setResults] = useState<any>([]);
  // const fetchResults = debounce(async (query: string) => {
  //   if (query.length === 0) {
  //     setResults([]);
  //     return;
  //   }
  //   try {
  //     const response = await axios.get(
  //       `http://localhost:3000/user?where=%7B%7D&orderBy=%7B%7D&skip=0&take=10`
  //     );
  //     setResults(response.data);
  //   } catch (error) {
  //     console.error("Ошибка запроса:", error);
  //   }
  // }, 500);

  // // useEffect(() => {
  // //   fetchResults(searchTerm);
  // // }, [searchTerm]);

  return (
    <div className="p-4">
      <div className={cn(className, "relative")}>
        <CiSearch className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <CustomInput
          type="text"
          placeholder=" Search..."
          className={cn(className, "caret-[#34d399] dark:bg-neutral-800")}
        />
      </div>
    </div>
  );
}
