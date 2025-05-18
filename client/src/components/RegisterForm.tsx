import Button from "./ui/ButtonLogout";
import { Select } from "./ui/Select";
import { Label } from "./ui/Label";
import { Image } from "./ui/Image";
import LogoIconBlack from "../assets/icons/LogoIconBlack.svg";
import { LabelInputContainer } from "./ui/LabelInputContainer";
import { UploadFile } from "./ui/UploadFile";
import { Link, useNavigate } from "react-router-dom";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { useStore } from "../store/store";
import { FormikInput } from "./ui/FormikInput";
import axios from "axios";
import { useState } from "react";
import { UserSex } from "../enum/UserSexEnum";
import { toast, Toaster } from "sonner";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";

const RegisterForm: React.FC = () => {
  const store = useStore();
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [vision, setVision] = useState<boolean>(false);
  const validationSchemaRegister = Yup.object({
    name: Yup.string().required(),
    surname: Yup.string().required(),
    email: Yup.string().required().email("Invalid email"),
    phone: Yup.string().required(),
    password: Yup.string().required(),
    img: Yup.string(),

    info: Yup.string(),
  });
  const handleSubmitRegisterForm = async (values: any) => {
    try {
      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("surname", values.surname);
      formData.append("email", values.email);
      formData.append("phone", values.phone);
      formData.append("password", values.password);
      formData.append("sex", values.sex);
      formData.append("info", values.info);
      if (selectedFile) {
        formData.append("file", selectedFile);
      }

      const response = await axios.post(
        "http://localhost:3000/auth/register",
        formData
      );
      console.log(response.status);
      if (response.status === 201) {
        navigate("/");
      }
    } catch (error: any) {
      const status = error.response?.status;
      if (status == 500) {
        toast("❌ This user is exist ");
      }
    }
  };
  return (
    <div className="animate-fadeIn border border-solid border-emerald-400 shadow-input mx-auto w-full max-w-md rounded-none bg-white p-4 md:rounded-2xl md:p-8 dark:bg-white light:bg-white">
      <h2 className="text-xl font-bold font-k2d text-neutral-800 dark:text-black">
        Welcome to UNICHUB
      </h2>
      <p className=" max-w-sm text-sm text-neutral-400 dark:text-neutral-400">
        university platform
      </p>
      <div className="flex justify-around items-center">
        <h1 className="font-k2d text-3xl mt-6 flex items-end ">
          <Image src={LogoIconBlack} className={"mr-2 animate-rotate"} />
          Sign up
        </h1>
        <div className="w-1/2 z-10 h-auto">
          <UploadFile onChange={(file) => setSelectedFile(file)} />
        </div>
      </div>
      <Formik
        initialValues={store.initialValueRegister}
        validationSchema={validationSchemaRegister}
        onSubmit={(values) => handleSubmitRegisterForm(values)}
      >
        <Form className="mt-8 justify-items-center items-center">
          <div className="mb-2 flex gap-2 ">
            <LabelInputContainer className="mb-4">
              <Label htmlFor="name">First Name</Label>
              <FormikInput name="name" placeholder="John" type="text" />
            </LabelInputContainer>
            <LabelInputContainer className="mb-2">
              <Label htmlFor="surname">Surname</Label>
              <FormikInput name="surname" placeholder="Doe" type="text" />
            </LabelInputContainer>
          </div>
          <LabelInputContainer className="mb-2">
            <Label htmlFor="email">Email</Label>
            <FormikInput
              name="email"
              placeholder="example@example.com"
              type="email"
            />
          </LabelInputContainer>
          <LabelInputContainer className="mb-2">
            <Label htmlFor="phone">Phone</Label>
            <FormikInput name="phone" placeholder="+380....." type="text" />
          </LabelInputContainer>
          <LabelInputContainer className="mb-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative w-full h-full">
              <FormikInput
                name="password"
                placeholder="Password"
                type={vision ? "text" : "password"}
              />
              {!vision ? (
                <AiOutlineEye
                  className="absolute right-4 top-4 text-neutral-500 cursor-pointer"
                  onClick={() => setVision(!vision)}
                />
              ) : (
                <AiOutlineEyeInvisible
                  onClick={() => setVision(!vision)}
                  className="absolute right-4 top-4 text-neutral-500 cursor-pointer"
                />
              )}
            </div>
          </LabelInputContainer>
          <LabelInputContainer className="mb-2">
            <Label htmlFor="sex">Sex</Label>
            <Field name="sex" as={Select}>
              <option value={UserSex.MALE}>👦 Male</option>
              <option value={UserSex.FEMALE}>👩‍🦰 Female</option>
            </Field>
          </LabelInputContainer>
          <LabelInputContainer className="mb-2">
            <Label htmlFor="info">Info</Label>
            <FormikInput
              name="info"
              placeholder="Senior Lecturer"
              type="text"
            />
          </LabelInputContainer>
          <div className="w-[150px] h-0.5 mt-[20px] bg-slate-500"></div>
          <div className="justify-items-center">
            <Button
              content={"Sign up"}
              type="submit"
              className=" w-[382px] mt-4 font-k2d text-xl"
            />
            <p className="font-medium">
              Already have an account?
              <span className="font-normal mx-1">
                <Link to="/" className="hover:underline duration-75">
                  Sign in
                </Link>
              </span>
            </p>
          </div>
        </Form>
      </Formik>
      <Toaster className="text-xl" />
    </div>
  );
};

export default RegisterForm;
