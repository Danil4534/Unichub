import { AiOutlineMessage, AiOutlineSun } from "react-icons/ai";
import { IoCloudyNightOutline, IoNotificationsOutline } from "react-icons/io5";
import { useStore } from "../store/store";
import { Image } from "./ui/Image";

import axios from "axios";
import { NavLink, useNavigate } from "react-router-dom";
import SearchInput from "./SearchInput";
import { useEffect } from "react";
import { Switch } from "./ui/switch";
import { ChatSheet } from "./ChatSheet";
import ButtonLogout from "./ui/ButtonLogout";

const Header: React.FC = () => {
  const store = useStore();
  const navigate = useNavigate();
  const LogoutUser = async () => {
    try {
      await axios.post(
        `http://localhost:3000/auth/logout/${store.currentUser.id}`
      );
      store.setActiveLoginForm();
      localStorage.removeItem("theme");
      navigate("/");
      store.clearCookie();
    } catch (e) {
      console.log(e);
    }
  };
  useEffect(() => {
    store.setCurrentUser();
  }, []);
  return (
    <header className="w-full h-24 bg-white px-10 py-1 flex justify-between items-center animate-topIn  border-none dark:bg-neutral-900 border-b-2 border-neutral-500">
      <div className="flex items-center gap-20">
        <div>
          <h1 className="text-black  text-2xl dark:text-white">
            Welcome back,{store.currentUser?.name}
          </h1>
          <p className="text-neutral-400 font-k2d">Welcome back to Unichub</p>
        </div>
        <div>
          <SearchInput className=" dark:text-white dark:placeholder:text-white" />
        </div>
      </div>
      <div className="flex flex-row gap-5 items-center">
        <div className="flex justify-center items-center gap-2">
          <AiOutlineSun className="dark:text-white" />
          <Switch
            checked={localStorage.getItem("theme") === "dark"}
            onCheckedChange={() => store.setTheme()}
          />
          <IoCloudyNightOutline className="dark:text-white" />
        </div>
        <NavLink to={"profile"}>
          <h1 className="text-black font-k2d text-base dark:text-white">
            {store.currentUser?.name} {store.currentUser?.surname}
          </h1>
          <div className="flex w-full gap-2">
            {store.currentUser?.roles.map((item: string, index: number) => (
              <div key={index}>
                <p className="font-k2d text-sm bg-slate-300 rounded-2xl py-0.5  px-1 text-white  dark:bg-neutral-800 dark:text-emerald-500">
                  {item.toLowerCase()}
                </p>
              </div>
            ))}
          </div>
        </NavLink>
        <div>
          <Image
            src={store.currentUser?.img}
            className="w-[45px] h-[45px] bg-red-400 rounded-full"
          />
        </div>
        <div className="relative">
          <div className="absolute -top-1 -right-1 bg-emerald-400 w-3 h-3 rounded-full">
            <p>{}</p>
          </div>
          <IoNotificationsOutline size={20} color="A6A6A6" />
        </div>
        <ChatSheet trigger={<AiOutlineMessage size={20} color="A6A6A6" />} />
        <ButtonLogout
          type="button"
          content={"Logout"}
          action={() => LogoutUser()}
        />
      </div>
    </header>
  );
};

export default Header;
