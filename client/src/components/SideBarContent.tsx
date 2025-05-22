import { Image } from "./ui/Image";
import { SidebarLink } from "./ui/SideBar";
import TeacherIconLight from "../assets/icons/teacherIconLight_.svg";
import TeacherIconDark from "../assets/icons/icon _teacher_.svg";

import LogoIconBlack from "../assets/icons/LogoIconBlack.svg";
import MessageIcon from "../assets/icons/Message.svg";
import EventsIcon from "../assets/icons/Events.svg";
import { Logo, LogoIcon } from "./Logo";
import { GrHomeRounded } from "react-icons/gr";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useStore } from "../store/store";
import { CiLogout } from "react-icons/ci";
import { FaUsers } from "react-icons/fa";
import { ImBooks } from "react-icons/im";
import { AiOutlineMessage } from "react-icons/ai";
import { MdCalendarToday } from "react-icons/md";
type SideBarContentProps = {
  open: boolean;
};

export const SideBarContent: React.FC<SideBarContentProps> = ({ open }) => {
  const store = useStore();
  const links = [
    {
      label: "Home",
      href: "/homepage",
      icon:
        store.theme === "dark" ? (
          <GrHomeRounded className="w-4 text-white " />
        ) : (
          <GrHomeRounded className="w-4" />
        ),
    },
    {
      label: "Groups",
      href: "groups",
      icon: <Image src={LogoIconBlack} className="w-4 " />,
    },
    {
      label: "Teachers",
      href: "teachers",
      icon:
        store.theme === "dark" ? (
          <Image src={TeacherIconLight} className="w-4" />
        ) : (
          <Image src={TeacherIconDark} className="w-4" />
        ),
    },

    {
      label: "Students",
      href: "students",
      icon:
        store.theme === "dark" ? (
          <FaUsers className="w-4 text-neutral-400 " />
        ) : (
          <FaUsers className="w-4" />
        ),
    },
    {
      label: "Subjects",
      href: "subjects",
      icon:
        store.theme === "dark" ? (
          <ImBooks className="w-4 text-neutral-400 " />
        ) : (
          <ImBooks className="w-4" />
        ),
    },
    {
      label: "Events",
      href: "events",
      icon:
        store.theme === "dark" ? (
          <MdCalendarToday className="w-4 text-neutral-400 " />
        ) : (
          <MdCalendarToday className="w-4" />
        ),
    },
    {
      label: "Chats",
      href: "chats",
      icon:
        store.theme === "dark" ? (
          <AiOutlineMessage className="w-4 text-neutral-400 " />
        ) : (
          <AiOutlineMessage className="w-4" />
        ),
    },
    {
      label: "Logout",
      href: "#",
      icon: <CiLogout className="w-4 h-4" />,
      action: () => LogoutUser(),
    },
  ];

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
    } catch (e) {}
  };
  return (
    <>
      <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
        {open ? <Logo /> : <LogoIcon />}
        <div
          className={
            open
              ? "mt-4 flex flex-col gap-2 items-left"
              : "mt-4 flex flex-col gap-2 items-center"
          }
        >
          <p>MENU</p>
          {links.map((link, idx) => (
            <SidebarLink key={idx} link={link} onClickEvent={link.action} />
          ))}
        </div>

        {/* {open ? (
         
        ) : (
          <></>
        )} */}
      </div>
    </>
  );
};
