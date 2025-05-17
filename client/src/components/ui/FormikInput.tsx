import { useField } from "formik";
import { Input } from "./Input";

interface FormikInputProps {
  name: string;
  type?: string;
  placeholder?: string;
  className?: string;
  children?: React.ReactNode;
}

export const FormikInput: React.FC<FormikInputProps> = ({
  name,
  children,
  ...props
}) => {
  const [field, meta] = useField(name);
  return (
    <div>
      <Input
        {...field}
        {...props}
        value={field.value ?? ""}
        className={meta.error && "border-red-600"}
      >
        {children}
      </Input>
      {meta.touched && meta.error && (
        <div className="text-red-500 text-sm ml-2">{meta.error}</div>
      )}
    </div>
  );
};
