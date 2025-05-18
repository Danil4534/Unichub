import Button from "./ui/ButtonLogout";
import { Label } from "./ui/Label";
import { Image } from "./ui/Image";
import LogoIconBlack from "../assets/icons/LogoIconBlack.svg";
import { LabelInputContainer } from "./ui/LabelInputContainer";
import { Link, useNavigate } from "react-router-dom";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { useStore } from "../store/store";
import { FormikInput } from "./ui/FormikInput";
import axios from "axios";
import { toast, Toaster } from "sonner";
import { useState } from "react";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "./ui/input-otp";

const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const [emailForReset, setEmailForReset] = useState<string | undefined>();

  const [vision, setVision] = useState<boolean>(false);
  const store = useStore();

  const validationSchemaLogin = Yup.object({
    email: Yup.string().email("Invalid email").required("Required"),
    password: Yup.string().min(6, "At least 6 characters").required("Required"),
  });

  const validationSchemaEmail = Yup.object({
    email: Yup.string().email("Invalid email").required("Required"),
  });

  const validationSchemaOtp = Yup.object({
    otpCode: Yup.number().min(6),
  });

  const handleSubmitLoginForm = async (values: any) => {
    try {
      const response = await axios.post("http://localhost:3000/auth/login", {
        email: values.email,
        password: values.password,
      });
      if (response.status === 201) {
        const { accessToken } = response.data;
        document.cookie = `accessToken=${accessToken}; path=/`;
        toast("📩 Check your email");
        axios.defaults.headers.common["Authorization"] =
          "Bearer " + accessToken;
        if (store.setCurrentUser().banned) {
          toast("❌ Your account was banned");
        } else {
          store.setActiveOtpForm();
        }
      }
    } catch (e: any) {
      if (e.status == 400) {
        toast("❌ Wrong Credentials");
      } else if (e.status == 404) {
        toast("❌ This Account is not registered in the system");
      }
    }
  };

  const handleSubmitResetForm = async (values: string) => {
    try {
      console.log(emailForReset);
      const response = await axios.put(
        `http://localhost:3000/auth/resetPassword/${emailForReset}/${values}`
      );
      if (response.status == 200) {
        toast("✅ Password changed successfully!");
        handleBackForm("login");
      }
    } catch (e: any) {
      if (e) {
        console.log(e);
        toast("❌ Something went wrong. Please try again.");
      }
    }
  };

  const handleSubmitOtpForm = async (values: any) => {
    try {
      const userId = store.currentUser.id;
      if (userId) {
        const response = await axios.post(
          `http://localhost:3000/auth/verify-otp/${userId}/${values.otpCode}`
        );

        if (response.data == "Success") {
          toast("✅ OTP verified successfully!");
          setTimeout(() => {
            navigate("/homepage");
          }, 2000);
        }
      }
    } catch (error: any) {
      const status = error.response?.status;
      if (status == 401) {
        toast("❌ You entered a wrong OTP code. Please check your email!");
      } else if (status == 404) {
        toast("❌ OTP not found. Please request a new one.");
      } else {
        console.log(error);
        toast("Something went wrong. Please try again.");
      }
    }
  };
  const handleBackForm = (valueForm: string) => {
    switch (valueForm) {
      case (valueForm = "otp"):
        store.setActiveOtpForm();
        break;
      case (valueForm = "login"):
        store.setActiveLoginForm();
        break;
      case (valueForm = "enterPassword"):
        store.setActiveNewPasswordForm();
        break;
      case (valueForm = "reset"):
        store.setActiveForgotPasswd();
    }
  };

  return (
    <div className="animate-fadeIn border border-solid border-emerald-400 shadow-input mx-auto w-[450px] max-w-md rounded-none bg-white p-4 md:rounded-2xl md:p-8  ">
      <h2 className="text-xl font-bold font-k2d text-neutral-800 ">
        Welcome to UNICHUB
      </h2>
      <p className=" max-w-sm text-sm text-neutral-400 dark:text-neutral-400">
        university platform
      </p>
      <h1 className="font-k2d text-3xl mt-6 flex items-end dark:text-black">
        <Image src={LogoIconBlack} className={"mr-2 animate-rotate "} />
        {store.activeLogin
          ? "Sign in"
          : store.activeForgotPasswd
          ? "Reset Password"
          : store.activeOtp
          ? "Send OTP"
          : ""}
      </h1>
      {store.activeLogin ? (
        <Formik
          initialValues={store.initialValuesLogin}
          validationSchema={validationSchemaLogin}
          onSubmit={(values) => handleSubmitLoginForm(values)}
        >
          <Form className="mt-8 justify-items-center items-center animate-fadeIn">
            <div className="mb-4 flex-col w-full  md:flex-row md:space-y-0 ">
              <LabelInputContainer className="mb-4">
                <Label htmlFor="email">Email Address</Label>
                <FormikInput
                  name="email"
                  placeholder="testmail@gmail.com"
                  type="email"
                />
              </LabelInputContainer>
              <LabelInputContainer className="mb-2 ">
                <Label htmlFor="password">Password</Label>
                <div className="relative w-full h-full">
                  <FormikInput
                    name="password"
                    placeholder="Password"
                    type={vision ? "text" : "password"}
                    className="relative"
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

                <p
                  onClick={() => store.setActiveForgotPasswd()}
                  className="text-right font-k2d font-medium hover:underline cursor-pointer "
                >
                  Forgot password
                </p>
              </LabelInputContainer>
            </div>
            <div className="w-[150px] h-0.5 mt-[26px] bg-slate-500"></div>
            <div className="justify-items-center">
              <Button
                content={"Sign in"}
                type="submit"
                className=" w-[382px] mt-4 font-k2d text-xl"
                // action={() => toast("📩 Check your Email")}
              />
              <p className="font-medium">
                Don`t have an account?
                <span className="font-normal mx-1">
                  <Link to="/register">Sign up</Link>
                </span>
              </p>
            </div>
          </Form>
        </Formik>
      ) : null}
      {store.activeOtp ? (
        <Formik
          initialValues={store.initialValuesOtp}
          validationSchema={validationSchemaOtp}
          onSubmit={(values) => handleSubmitOtpForm(values)}
        >
          {({ setFieldValue }) => (
            <Form className="mt-8 justify-items-center items-center ">
              <div className="flex-col w-full md:flex-row md:space-y-0 justify-items-center animate-fadeIn ">
                <LabelInputContainer className="mb-2 ">
                  <Label htmlFor="otpCode" className="text-center">
                    Your Verification Code
                  </Label>

                  <div className="w-full flex justify-center items-center my-2">
                    <InputOTP
                      maxLength={6}
                      onChange={(value: string) =>
                        setFieldValue("otpCode", value)
                      }
                    >
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                </LabelInputContainer>

                <Button
                  content={"Sign in securely"}
                  type="submit"
                  className="w-[382px] mt-4 font-k2d text-xl"
                />
                <p
                  className="font-k2d pt-4 cursor-pointer hover:underline"
                  onClick={() => handleBackForm("login")}
                >
                  Cancel
                </p>
              </div>
            </Form>
          )}
        </Formik>
      ) : null}
      {store.activeForgotPasswd ? (
        <Formik
          initialValues={store.initialValuesEmail}
          validationSchema={validationSchemaEmail}
          onSubmit={(values) => {
            setEmailForReset(values.email);
            handleBackForm("enterPassword");
          }}
        >
          <Form className="mt-8 justify-items-center items-center ">
            <div className="flex-col w-full  md:flex-row md:space-y-0 justify-items-center animate-fadeIn ">
              <LabelInputContainer className="mb-2">
                <Label htmlFor="password" className="text-left">
                  Email
                </Label>
                <FormikInput
                  name="email"
                  placeholder="testmail@gmail.com"
                  type="email"
                  className="text-center text-xl"
                />
              </LabelInputContainer>
              <Button
                content={"Check Email"}
                type="submit"
                className=" w-[382px] mt-4 font-k2d text-xl"
              />
              <p
                className="font-k2d pt-4 cursor-pointer hover:underline"
                onClick={() => handleBackForm("login")}
              >
                Cancel
              </p>
            </div>
          </Form>
        </Formik>
      ) : null}
      {store.activeNewPassword ? (
        <Formik
          initialValues={store.initialValuesPassword}
          onSubmit={(values) => handleSubmitResetForm(values.password)}
        >
          <Form className="mt-8 justify-items-center items-center ">
            <div className="flex-col w-full  md:flex-row md:space-y-0 justify-items-center animate-fadeIn ">
              <LabelInputContainer className="mb-2">
                <Label htmlFor="password" className="text-left">
                  New Password
                </Label>
                <FormikInput
                  name="password"
                  placeholder="New password"
                  type="password"
                  className="text-center text-xl"
                />
                <Label htmlFor="password" className="text-left">
                  Re-enter Password
                </Label>
                <FormikInput
                  name="reEnterPassword"
                  placeholder="New password"
                  type="password"
                  className="text-center text-xl"
                />
              </LabelInputContainer>
              <Button
                content={"Change Password"}
                type="submit"
                className=" w-[382px] mt-4 font-k2d text-xl"
              />
              <p
                className="font-k2d pt-4 cursor-pointer hover:underline"
                onClick={() => handleBackForm("enter")}
              >
                Cancel
              </p>
            </div>
          </Form>
        </Formik>
      ) : null}
      <Toaster />
    </div>
  );
};

export default LoginForm;
