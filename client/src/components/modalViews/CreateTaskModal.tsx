import { AlertDialogCancel } from "@radix-ui/react-alert-dialog";
import { IoMdClose } from "react-icons/io";
import { AlertDialogTitle } from "../ui/alert-dialog";
import { useStore } from "../../store/store";
import { Image } from "../../components/ui/Image";
import LogoIconLight from "../../assets/icons/LogoIconLight.svg";
import LogoIconBlack from "../../assets/icons/LogoIconBlack.svg";
import { useEndPoint } from "../../hooks/useEndPoint";
import { useEffect, useState } from "react";
import { Group } from "../../shared/types/Group";
import * as Yup from "yup";
import axios from "axios";
import { Field, Form, Formik } from "formik";
import { Label } from "../ui/Label";
import { Input } from "../ui/input";
import { LabelInputContainer } from "../ui/LabelInputContainer";
import { Textarea } from "../ui/textarea";

import { debounce } from "lodash";
import { Button } from "../ui/button";
import { DateTimePickerForm } from "../ui/eventDatePicker";

interface CreateTaskFormValues {
  title: string;
  description: string;
  start: string;
  end: string;
  groupId: string;
}

export const CreateTaskModal: React.FC = () => {
  const subjectId = useEndPoint();
  const [groups, setGroups] = useState<Group[]>([]);

  const validationSchemaTask = Yup.object({
    title: Yup.string().required("Title is required"),
    description: Yup.string().required("Description is required"),
    start: Yup.date().required("Start date is required"),
    end: Yup.date().required("End date is required"),
    groupId: Yup.string().required("Group ID is required"),
  });

  const initialValuesCreateTask: CreateTaskFormValues = {
    title: "",
    description: "",
    start: "",
    end: "",
    groupId: "",
  };

  const handleSubmitCreateTask = async (values: CreateTaskFormValues) => {
    try {
      const payload = {
        ...values,
        subjectId,
      };

      const response = await axios.post("http://localhost:3000/task/", payload);
      console.log("Task created:", response.data);
    } catch (error) {
      console.error("Error creating task:", error);
    }
  };

  const fetchGroups = debounce(async () => {
    try {
      const response = await axios.get("http://localhost:3000/group");
      setGroups(response.data);
    } catch (e) {
      console.log(e);
    }
  }, 300);

  useEffect(() => {
    fetchGroups();
  }, []);

  const store = useStore();

  return (
    <div className="w-5/4">
      <AlertDialogTitle>
        <div className="w-full font-k2d text-4xl flex gap-2">
          {store.theme === "dark" ? (
            <Image src={LogoIconLight} className="animate-rotate size-10" />
          ) : (
            <Image src={LogoIconBlack} className="animate-rotate size-10" />
          )}
          <h1 className="w-full">Create New Task</h1>
        </div>
      </AlertDialogTitle>
      <AlertDialogCancel className="absolute top-4 right-4">
        <IoMdClose />
      </AlertDialogCancel>

      <Formik
        initialValues={initialValuesCreateTask}
        validationSchema={validationSchemaTask}
        onSubmit={handleSubmitCreateTask}
      >
        {({}) => (
          <Form className="mt-20 flex flex-col gap-4">
            <Label htmlFor="title" className="text-black dark:text-white">
              Title
            </Label>
            <Field
              name="title"
              as={Input}
              type="text"
              placeholder="Homework"
              className="dark:bg-neutral-800"
            />

            <LabelInputContainer>
              <Label
                htmlFor="description"
                className="text-black dark:text-white"
              >
                Description
              </Label>
              <Field
                name="description"
                as={Textarea}
                className="h-20 caret-[#34d399] dark:bg-neutral-800 dark:placeholder:text-neutral-400 text-black dark:text-white"
              />
            </LabelInputContainer>

            <div>
              <Label htmlFor="start" className="text-black dark:text-white">
                Start date
              </Label>
              <DateTimePickerForm />
            </div>

            <div>
              <Label htmlFor="end" className="text-black dark:text-white">
                End date
              </Label>
              <DateTimePickerForm />
            </div>

            <LabelInputContainer className="mb-2">
              <Label htmlFor="groupId" className="text-black dark:text-white">
                Group
              </Label>
              <Field name="groupId" as="select" className="dark:bg-neutral-800">
                <option value="">Select group</option>
                {groups.map((item: Group) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </Field>
            </LabelInputContainer>

            <Button type="submit">Save</Button>
          </Form>
        )}
      </Formik>
    </div>
  );
};
