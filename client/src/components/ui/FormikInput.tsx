import { useField } from "formik";
import { CustomInput } from "./CustomInput";

interface FormikInputProps {
  name: string;
  type?: string;
  placeholder?: string;
  className?: string;
  children?: React.ReactNode;
  id?: string;
}

export const FormikInput: React.FC<FormikInputProps> = ({
  name,
  children,
  ...props
}) => {
  const [field, meta] = useField(name);
  return (
    <div>
      <CustomInput
        {...field}
        {...props}
        value={field.value ?? ""}
        className={meta.error && "border-red-600"}
      >
        {children}
      </CustomInput>
      {meta.touched && meta.error && (
        <div className="text-red-500 text-sm ml-2">{meta.error}</div>
      )}
    </div>
  );
};
