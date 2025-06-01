import React, { useEffect, useState } from "react";
import { AlertDialogCancel, AlertDialogTitle } from "../ui/alert-dialog";
import { useStore } from "../../store/store";
import { Image } from "../ui/Image";
import LogoIconLight from "../../assets/icons/LogoIconLight.svg";
import LogoIconBlack from "../../assets/icons/LogoIconBlack.svg";
import { IoMdClose } from "react-icons/io";
import { Feature } from "../KanbanComponent";
import { Label } from "../ui/Label";
import { DatePickerWithRange } from "../ui/DatePicker";
import { Textarea } from "../ui/textarea";
import { Card } from "../ui/card";
import { CiFileOn, CiImageOn, CiVideoOn } from "react-icons/ci";
import { FaRegFilePdf, FaRegFileWord } from "react-icons/fa";
import { RiFileExcel2Line } from "react-icons/ri";
import { MdOutlineFolderZip } from "react-icons/md";
import { Button } from "../ui/button";
import axios from "axios";
import { toast } from "sonner";

type TaskModalProps = {
  feature?: Feature;
};

export const TaskModal: React.FC<TaskModalProps> = ({ feature }) => {
  const store = useStore();
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [teacherFiles, setTeacherFiles] = useState<File[]>([]);
  const [studentFiles, setStudentFiles] = useState<File[]>([]);
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles = Array.from(files);
      setUploadedFiles((prev) => [...prev, ...newFiles]);
      if (store.currentUser.roles.includes("Teacher")) {
        setTeacherFiles((prev) => [...prev, ...newFiles]);
      } else {
        setStudentFiles((prev) => [...prev, ...newFiles]);
      }
    }
  };
  console.log(uploadedFiles);
  const formatFileSize = (size: number) => {
    if (size >= 1048576) return (size / 1048576).toFixed(2) + " MB";
    if (size >= 1024) return (size / 1024).toFixed(1) + " KB";
    return size + " B";
  };

  const handleSave = async () => {
    const formData = new FormData();

    uploadedFiles.forEach((file) => {
      formData.append("files", file);
    });

    try {
      if (store.currentUser.roles.includes("Teacher")) {
        await axios.put(
          `http://localhost:3000/task/${feature?.id}/teacher`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        setTeacherFiles((prev: any) => [...prev]);
      } else {
        await axios.put(
          `http://localhost:3000/task/${feature?.id}/student`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        setStudentFiles((prev: any) => [...prev]);
      }
      toast.success("The file was successfully uploaded");
    } catch (err) {
      console.error("Upload failed", err);
    }
  };
  useEffect(() => {
    if (!feature?.id) return;
    const handleFiles = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3000/task/${feature.id}`
        );
        setTeacherFiles(response.data.teacherFiles);
        setStudentFiles(response.data.studentFiles);
      } catch (err) {
        console.error("Failed to fetch files", err);
      }
    };
    handleFiles();
  }, [feature?.id]);

  return (
    <>
      <div
        className="w-full"
        onDragStart={(e) => e.preventDefault()}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start">
          <AlertDialogTitle className=" flex items-center gap-4">
            {store.theme === "dark" ? (
              <Image src={LogoIconLight} className="animate-rotate size-10" />
            ) : (
              <Image src={LogoIconBlack} className="animate-rotate" />
            )}
            <h1 className="w-full flex gap-4 items-center">
              {feature?.name}{" "}
              <p className="bg-emerald-300 rounded-full px-2 h-4 text-xs flex items-center dark:text-black">
                {feature?.type}
              </p>
            </h1>
          </AlertDialogTitle>
        </div>

        <div className="flex flex-col gap-4 mt-4">
          <Label htmlFor="title" className="dark:text-white">
            id: {feature?.id}
          </Label>
          <Label htmlFor="title" className="dark:text-white">
            Title: {feature?.name}
          </Label>
          <Label htmlFor="desc" className="dark:text-white flex flex-col gap-2">
            Description:
            <Textarea disabled value={feature?.description} />
          </Label>
          <Label className="dark:text-white flex flex-col gap-2">
            <p>Deadlines:</p>
            <DatePickerWithRange from={feature?.startAt} to={feature?.endAt} />
          </Label>

          <div className="mt-2">
            <p className="dark:text-white "> Teacher's Files:</p>
            <div className="flex flex-col gap-2">
              {teacherFiles?.map((file, index) => {
                let icon = <CiFileOn />;
                const fileName = file.name;
                const fileType = file.type;
                if (fileType.startsWith("image/")) icon = <CiFileOn />;
                else if (fileType.startsWith("audio/")) icon = <CiImageOn />;
                else if (fileType.startsWith("video/")) icon = <CiVideoOn />;
                else if (
                  fileType === "application/pdf" ||
                  fileName.endsWith(".pdf")
                )
                  icon = <FaRegFilePdf />;
                else if (
                  fileType ===
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
                  fileType === "application/vnd.ms-excel" ||
                  fileName.endsWith(".xlsx") ||
                  fileName.endsWith(".xls")
                )
                  icon = <RiFileExcel2Line />;
                else if (
                  fileType === "application/msword" ||
                  fileType ===
                    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                )
                  icon = <FaRegFileWord />;
                else if (
                  fileType.includes("zip") ||
                  fileName.endsWith(".rar") ||
                  fileName.endsWith(".zip")
                )
                  icon = <MdOutlineFolderZip />;

                return (
                  <Card
                    key={index}
                    className="p-2 flex items-center gap-2 dark:text-white"
                  >
                    {" "}
                    <span className="text-xl">{icon}</span>
                    <span>{file.name}</span>
                    <span className="text-xs text-muted-foreground ">
                      {formatFileSize(file.size)}
                    </span>
                  </Card>
                );
              })}
            </div>
          </div>
          <div className="mt-2">
            <p className="dark:text-white font-bold"> My Files:</p>
            <div className="flex flex-col gap-2">
              {studentFiles?.map((file, index) => {
                const fileName = file.name;
                const fileType = file.type;

                let icon = <CiFileOn />;

                if (fileType.startsWith("image/")) icon = <CiFileOn />;
                else if (fileType.startsWith("audio/")) icon = <CiImageOn />;
                else if (fileType.startsWith("video/")) icon = <CiVideoOn />;
                else if (
                  fileType === "application/pdf" ||
                  fileName.endsWith(".pdf")
                )
                  icon = <FaRegFilePdf />;
                else if (
                  fileType ===
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
                  fileType === "application/vnd.ms-excel" ||
                  fileName.endsWith(".xlsx") ||
                  fileName.endsWith(".xls")
                )
                  icon = <RiFileExcel2Line />;
                else if (
                  fileType.includes("zip") ||
                  fileName.endsWith(".rar") ||
                  fileName.endsWith(".zip")
                )
                  icon = <MdOutlineFolderZip />;

                return (
                  <Card
                    key={index}
                    className="p-2 flex items-center gap-2 dark:text-white"
                  >
                    <span className="text-xl">{icon}</span>
                    <span>{file.name}</span>
                    <span className="text-xs text-muted-foreground ">
                      {formatFileSize(file.size)}
                    </span>
                  </Card>
                );
              })}
            </div>
          </div>
          {store.currentUser.roles.includes("Admin") ||
          store.currentUser.roles.includes("Teacher") ||
          store.currentUser.roles.includes("Student") ? (
            <Label className="dark:text-white flex flex-col gap-2">
              <p>Upload files:</p>
              <input
                id="inputFile"
                type="file"
                multiple
                onChange={handleFileChange}
                className="dark:text-white hidden"
              />
              <div className=" cursor-pointer  hover:border-emerald-300 w-full h-40 border-dashed border border-neutral-400 bg-neutral-100 rounded-lg flex items-center justify-center flex-col gap-4">
                <CiFileOn size={40} className="text-emerald-400" />
                <p>Click or drag file to this area to upload</p>
              </div>
            </Label>
          ) : (
            <></>
          )}
        </div>

        <div className="w-full flex justify-end">
          <Button className="mt-2 flex" onClick={() => handleSave()}>
            {" "}
            Save{" "}
          </Button>
        </div>
      </div>

      <AlertDialogCancel
        onClick={(e) => e.stopPropagation()}
        onDragStart={(e) => e.preventDefault()}
        onPointerDown={(e) => e.stopPropagation()}
        className="absolute top-4 right-4"
      >
        <IoMdClose />
      </AlertDialogCancel>
    </>
  );
};
