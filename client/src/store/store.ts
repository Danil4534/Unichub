import { jwtDecode } from "jwt-decode";
import { create } from "zustand";
import { UserSex } from "../enum/UserSexEnum";

export type typeStore = {
  activeOtp: boolean;
  activeLogin: boolean;
  activeForgotPasswd: boolean;
  activeNewPassword: boolean;
  currentUser: any;
  theme: string | null;
  initialValuesLogin: {
    email: string;
    password: string;
  };
  initialValuesOtp: {
    otpCode: string;
  };
  initialValuesPassword: {
    password: string;
  };
  initialValuesEmail: {
    email: string;
  };
  initialValueRegister: {
    name: string;
    surname: string;
    email: string;
    phone: string;
    password: string;
    img: string;
    sex: UserSex;
    info: string;
  };
  data: any;
  setActiveOtpForm: () => void;
  setActiveLoginForm: () => void;
  setCurrentUser: () => any;
  setActiveForgotPasswd: () => void;
  setActiveNewPasswordForm: () => void;
  clearCookie: () => void;
  setTheme: () => void;
  setData: (values: any) => void;
};

export const useStore = create<typeStore>((set) => ({
  activeOtp: false,
  activeLogin: true,
  activeForgotPasswd: false,
  activeNewPassword: false,
  currentUser: null,
  data: null,
  theme: localStorage.getItem("theme"),
  setTheme: () =>
    set((state) => {
      const newTheme = state.theme === "light" ? "dark" : "light";
      localStorage.setItem("theme", newTheme);
      return { theme: newTheme };
    }),
  initialValuesEmail: {
    email: "",
  },
  initialValuesLogin: {
    email: "",
    password: "",
  },
  initialValuesPassword: {
    password: "",
  },
  initialValuesOtp: {
    otpCode: "",
  },
  initialValueRegister: {
    name: "",
    surname: "",
    email: "",
    phone: "",
    password: "",
    img: "",
    sex: UserSex.FEMALE,
    info: "",
  },
  setActiveOtpForm: () =>
    set({
      activeOtp: true,
      activeForgotPasswd: false,
      activeLogin: false,
      activeNewPassword: false,
    }),

  setActiveForgotPasswd: () =>
    set({
      activeForgotPasswd: true,
      activeLogin: false,
      activeOtp: false,
      activeNewPassword: false,
    }),
  setActiveLoginForm: () =>
    set({
      activeForgotPasswd: false,
      activeLogin: true,
      activeOtp: false,
      activeNewPassword: false,
    }),
  setActiveNewPasswordForm: () =>
    set({
      activeForgotPasswd: false,
      activeLogin: false,
      activeOtp: false,
      activeNewPassword: true,
    }),
  setCurrentUser: () => {
    try {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("accessToken="));

      if (!token) {
        set({ currentUser: null });
        return null;
      }
      const jwt = token.split("=")[1];
      const payload = jwtDecode<{ userId: string }>(jwt);

      set({ currentUser: payload.userId });
      return payload.userId;
    } catch (error) {
      console.log(error);

      return null;
    }
  },
  clearCookie: () => {
    document.cookie =
      "accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  },

  setData: (values: any) => {
    set({ data: values });
  },
}));
