import * as React from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  ColumnDef,
  SortingState,
  ColumnFilter,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../ui/table";
import { Input } from "../../../ui/Input";

import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "../../../ui/dropdown-menu";
import { Checkbox } from "../../../ui/checkbox";
import { FaRegFilePdf } from "react-icons/fa";
import { RiFileExcel2Line } from "react-icons/ri";
import { toast } from "sonner";
import axios from "axios";
import { CiSearch } from "react-icons/ci";
import Button from "../../../ui/button";

type RatingsData = {
  headers: string[];
  rows: string[][];
};

export default function RatingsTable({
  ratings,
  group,
}: {
  ratings: RatingsData;
  group: any;
}) {
  const [columnFilters, setColumnFilters] = React.useState<ColumnFilter[]>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState({});
  const [rowSelection, setRowSelection] = React.useState({});

  const filteredHeaders =
    ratings?.headers.filter((header) => header !== "Student ID") || [];

  const columns: ColumnDef<any>[] = filteredHeaders.map((header) => {
    const originalIndex = ratings.headers.findIndex((h) => h === header);
    return {
      accessorKey: `${originalIndex}`,
      header: header,
      cell: ({ row }) => {
        const item = row.original[originalIndex];
        const numeric = Number(item);

        let className = "";
        if (item === "N/A" || (!isNaN(numeric) && numeric < 60)) {
          className = "bg-red-200 text-red-500 text-center w-full";
        } else if (!isNaN(numeric) && numeric >= 60) {
          className = "text-green-500 text-center w-full";
        }
        return <div className={className}>{item}</div>;
      },
    };
  });

  const table = useReactTable({
    data: ratings?.rows || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onColumnFiltersChange: setColumnFilters,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  const selectedRowCount = Object.keys(rowSelection).length;

  const handleSelectAll = () => {
    const allSelected =
      Object.keys(rowSelection).length !== table.getRowModel().rows.length;
    setRowSelection(
      allSelected
        ? {}
        : table.getRowModel().rows.reduce((acc: any, row) => {
            acc[row.id] = true;
            return acc;
          }, {})
    );
  };

  const handleExportPdf = async () => {
    try {
      const response = await axios.get(
        `http://localhost:3000/grade-book/groupRatingsPDF/${group.id}`,
        {
          responseType: "blob",
        }
      );

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `${group.name}-ratings.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(url);
      toast.success("PDF downloaded successfully");
    } catch (error: any) {
      console.error(error);
      toast.error("Error with downloading PDF");
    }
  };
  const handleExportExcel = async () => {
    try {
      const response = await axios.get(
        `http://localhost:3000/grade-book/group-export/${group.id}`,
        {
          responseType: "blob",
        }
      );

      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `${group.name}-ratings.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(url);
      toast.success("Excel downloaded successfully");
    } catch (error: any) {
      console.error(error);
      toast.error("Error with downloading Excel");
    }
  };

  return (
    <div className="w-full font-k2d ">
      <div className="flex justify-between  items-center py-4">
        <div className="relative w-1/6">
          <CiSearch className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search..."
            onChange={(e) =>
              table.getColumn("2")?.setFilterValue(e.target.value)
            }
            className="caret-[#34d399] dark:bg-neutral-800 dark:placeholder:text-neutral-400 dark:text-neutral-200"
          />
        </div>
        <div className="flex flex-row gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto">
                Export <ChevronDown />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuCheckboxItem
                className="cursor-pointer hover:underline flex justify-center gap-2 pl-0"
                onClick={handleExportExcel}
              >
                <RiFileExcel2Line />
                Export Excel
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                className="cursor-pointer hover:underline flex justify-center gap-2 pl-0"
                onClick={handleExportPdf}
              >
                <FaRegFilePdf />
                Export PDF
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto">
                Columns <ChevronDown />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.columnDef.header !== "Student ID")
                .filter((column) => column.getCanHide())
                .map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {ratings.headers[column.id as any] || column.id}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table
              .getHeaderGroups()

              .map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  <TableHead>
                    <Checkbox
                      checked={
                        selectedRowCount === table.getRowModel().rows.length
                      }
                      onChange={handleSelectAll}
                    />
                  </TableHead>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>
                    <Checkbox
                      checked={row.getIsSelected()}
                      onChange={() => row.toggleSelected()}
                    />
                  </TableCell>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="w-auto">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-end space-x-2 py-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>

      <div className="">
        <span>{selectedRowCount} row(s) selected</span>
      </div>
    </div>
  );
}
