import React, { useEffect, useState } from "react";
import { AlertDialogCancel, AlertDialogTitle } from "../ui/alert-dialog";
import { IoMdClose } from "react-icons/io";
import { useStore } from "../../store/store";
import LogoIconLight from "../../assets/icons/LogoIconLight.svg";
import LogoIconBlack from "../../assets/icons/LogoIconBlack.svg";
import { Image } from "../ui/Image";
import { Transfer, message } from "antd";
import type { TransferProps } from "antd";
import axios from "axios";
import { toast } from "sonner";
import { Toaster } from "../ui/sonner";

type InviteStudentModalProps = {
  group: any;
};

interface RecordType {
  description: any;
  key: string;
  name: string;
  surname: string;
  disabled?: boolean;
}

export const InviteStudentModal: React.FC<InviteStudentModalProps> = ({
  group,
}) => {
  const store = useStore();

  const [targetKeys, setTargetKeys] = useState<React.Key[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);
  const [students, setStudents] = useState<RecordType[]>([]);
  const [initialStudentIds, setInitialStudentIds] = useState<string[]>([]);

  const handleUsers = async () => {
    const where = encodeURIComponent(
      JSON.stringify({ roles: { has: "Student" } })
    );
    try {
      const response = await axios.get(
        `http://localhost:3000/user?where=${where}`
      );
      const loadedStudents = response.data.map((student: any) => ({
        ...student,
        key: student.id,
      }));
      setStudents(loadedStudents);
    } catch (e) {
      console.log(e);
    }
  };
  const handleChange: TransferProps<RecordType>["onChange"] = (
    newTargetKeys
  ) => {
    setTargetKeys(newTargetKeys);
  };

  const handleSelectChange: TransferProps<RecordType>["onSelectChange"] = (
    sourceSelectedKeys,
    targetSelectedKeys
  ) => {
    setSelectedKeys([...sourceSelectedKeys, ...targetSelectedKeys]);
  };

  const handleSave = async () => {
    const newlyAdded = targetKeys.filter(
      (id) => !initialStudentIds.includes(id as string)
    );
    const removed = initialStudentIds.filter(
      (id) => !targetKeys.includes(id as string)
    );

    try {
      await Promise.all([
        ...newlyAdded.map((studentId) =>
          axios.put(
            `http://localhost:3000/group/${group.id}/inviteStudent/${studentId}`
          )
        ),
        ...removed.map((studentId) =>
          axios.put(
            `http://localhost:3000/group/${group.id}/unInviteStudent/${studentId}`
          )
        ),
      ]);
      toast("Group updated successfully!");
      setInitialStudentIds(targetKeys as string[]);
    } catch (error) {
      console.error(error);
      message.error("Error updating group.");
    }
  };

  const filterOption = (inputValue: string, option: RecordType) =>
    option.description.indexOf(inputValue) > -1;

  useEffect(() => {
    const keys = group.students.map((s: any) => s.id);
    setTargetKeys(keys);
    setInitialStudentIds(keys);
  }, [group]);

  useEffect(() => {
    handleUsers();
  }, [students]);

  return (
    <>
      <AlertDialogTitle>
        <div className="w-full font-k2d text-4xl flex gap-2">
          {store.theme === "dark" ? (
            <Image src={LogoIconLight} className="animate-rotate size-10" />
          ) : (
            <Image src={LogoIconBlack} className="animate-rotate size-10" />
          )}
          Invite Student {group.name}
        </div>
      </AlertDialogTitle>

      <AlertDialogCancel className="absolute top-4 right-4">
        <IoMdClose />
      </AlertDialogCancel>

      <div className="flex flex-col w-full h-auto justify-center items-center">
        <Transfer
          dataSource={students}
          showSearch
          titles={["Available Users", "Group Members"]}
          targetKeys={targetKeys}
          selectedKeys={selectedKeys}
          onChange={handleChange}
          onSelectChange={handleSelectChange}
          render={(item) => `${item.name} ${item.surname}`}
          rowKey={(item) => item.key}
          style={{ marginBottom: 16 }}
          filterOption={filterOption}
        />
      </div>
      <div className="w-full flex justify-end">
        <button
          className="w-[120px] flex justify-center items-center text-sm text-center p-1.5 font-k2d bg-white rounded-lg border-2 border-neutral-200 hover:shadow-md cursor-pointer dark:bg-neutral-800 dark:border-neutral-400"
          onClick={handleSave}
        >
          Save changes
        </button>
      </div>
      <Toaster />
    </>
  );
};
