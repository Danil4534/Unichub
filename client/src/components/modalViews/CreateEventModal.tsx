import { DatePickerWithRange } from "../ui/DatePicker";

export const CreateEventModal: React.FC = () => {
  const from = new Date();
  const to = new Date();
  to.setDate(to.getDate() + 20);

  return (
    <>
      <DatePickerWithRange from={from} to={to} />
    </>
  );
};
