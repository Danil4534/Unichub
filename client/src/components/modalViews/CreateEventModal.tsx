import { Field, Form, Formik } from "formik";
import { Label } from "../ui/Label";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import { LabelInputContainer } from "../ui/LabelInputContainer";

import { DialogTitle } from "@radix-ui/react-dialog";
import * as Yup from "yup";
import axios from "axios";
import { Button } from "../ui/button";
import { useEffect, useState } from "react";
import { debounce } from "lodash";
import { Group } from "../../shared/types/Group";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";

export type CreateEventModalProps = {
  trigger?: React.ReactNode;
};

export const CreateEventModal: React.FC<CreateEventModalProps> = ({
  trigger,
}) => {
  const [groups, setGroups] = useState<Group[]>([]);

  const validationSchemaEvent = Yup.object({
    title: Yup.string().required("Title is required"),
    description: Yup.string().required("Description is required"),
    start: Yup.date().required("Start date is required"),
    end: Yup.date().required("End date is required"),
    groupId: Yup.string().required("Group ID is required"),
  });

  const initialValuesCreateEvent = {
    title: "",
    description: "",
    start: "",
    end: "",
    groupId: "",
  };

  const handleSubmitCreateEvent = async (
    values: typeof initialValuesCreateEvent
  ) => {
    try {
      const response = await axios.post("http://localhost:3000/events", values);
      console.log("Event created:", response.data);
    } catch (error) {
      console.error("Error creating event:", error);
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

  return (
    <Sheet>
      <SheetTrigger>
        {trigger ?? (
          <div className="w-[120px] flex justify-center items-center text-sm text-center p-1.5 font-k2d bg-white rounded-lg border-2 border-neutral-200 hover:shadow-md cursor-pointer dark:bg-neutral-800 dark:border-neutral-400">
            Create Event
          </div>
        )}
      </SheetTrigger>
      <SheetContent side="right" className="p-4">
        <DialogTitle>Add Event</DialogTitle>
        <Formik
          initialValues={initialValuesCreateEvent}
          validationSchema={validationSchemaEvent}
          onSubmit={handleSubmitCreateEvent}
        >
          <Form className="mt-20 flex flex-col gap-4">
            <Label htmlFor="title" className="dark:text-white">
              Title
            </Label>
            <Field
              name="title"
              as={Input}
              type="text"
              className="dark:bg-neutral-800"
            />

            <LabelInputContainer>
              <Label htmlFor="description" className="dark:text-white">
                Description
              </Label>
              <Field
                name="description"
                as={Textarea}
                className="h-20 caret-[#34d399] dark:bg-neutral-800 dark:placeholder:text-neutral-400 text-black dark:text-white"
              />
            </LabelInputContainer>

            <div>
              <Label htmlFor="start" className="dark:text-white">
                Start date
              </Label>
            </div>

            <div>
              <Label htmlFor="end" className="dark:text-white">
                End date
              </Label>
            </div>

            <LabelInputContainer className="mb-2">
              <Label htmlFor="groupId">Group</Label>
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
        </Formik>
      </SheetContent>
    </Sheet>
  );
};
