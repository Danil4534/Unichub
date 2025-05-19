import React, { useEffect, useRef, useState } from "react";
import { Image } from "./ui/Image";
import LogoIconLight from "../assets/icons/LogoIconLight.svg";
import LogoIconBlack from "../assets/icons/LogoIconBlack.svg";
import { useStore } from "../store/store";
import { RiUnpinLine } from "react-icons/ri";
import { TiPinOutline } from "react-icons/ti";
import { cn } from "../lib/utils";
import { Link } from "react-router-dom";
import { LiaTrashAltSolid } from "react-icons/lia";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { HiOutlineDotsHorizontal } from "react-icons/hi";
import { io, Socket } from "socket.io-client";

type ChatItemProps = {
  index: number;
  chat: any;
  className?: string;
  onClick?: () => void;
  pinnedChats: any;
  lastMessage?: any;
  handlePinnedChat: (chat: any) => void;
};
export const ChatItem: React.FC<ChatItemProps> = ({
  chat,
  index,
  pinnedChats,
  className,
  lastMessage,
  onClick,
  handlePinnedChat,
}) => {
  const [visible, setVisible] = useState(false);
  const store = useStore();
  const socketRef = useRef<Socket | null>(null);
  const handleDeleteChat = (chatId: string) => {
    socketRef.current?.emit("deleteChat", chatId);
  };
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getUTCMinutes()).padStart(2, "0");
    return ` ${hours}:${minutes}`;
  };
  useEffect(() => {
    const socket = io("http://localhost:3000");
    socketRef.current = socket;
    const timeout = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(timeout);
  });
  return (
    <Link
      to={`/homepage/chats/${chat.id}`}
      onClick={onClick}
      className={cn(
        `relative  ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        } p-2 flex  w-full h-20 gap-2 shadow-sm border-t-2 bg-white border-emerald-300  dark:bg-neutral-800 cursor-pointer hover:bg-white animate-fadeIn `,

        className
      )}
      key={index}
      style={{ animationDelay: `${index * 200}ms` }}
    >
      {chat.user2.img ? (
        <Image
          src={chat.user2.img}
          className={
            chat.user2.activeStatus == "Online"
              ? " border-2 border-green-300 p-1 rounded-full w-16 h-16  dark:border-2 dark:border-emerald-400"
              : "border-2 border-neutral-400 p-1 rounded-full w-16 h-16 dark:border-neutral-200 dark:border-2"
          }
        />
      ) : (
        <div className="border border-neutral-300 rounded-full w-14 h-14 items-center flex justify-center">
          {store.theme === "dark" ? (
            <Image src={LogoIconLight} className=" size-5" />
          ) : (
            <Image src={LogoIconBlack} className=" size-5" />
          )}
        </div>
      )}
      <div className="flex flex-col gap-1">
        <div className="text-sm flex-col fr">
          {`${chat.user2.name} ${chat.user2.surname}`}
        </div>
        {lastMessage && (
          <div className="  text-xs text-neutral-300">
            Last : {lastMessage?.content} {formatDate(lastMessage?.created)}
          </div>
        )}
      </div>

      <div className="absolute top-2 right-2">
        <DropdownMenu>
          <DropdownMenuTrigger>
            <HiOutlineDotsHorizontal />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>
              <span>View profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handlePinnedChat(chat)}
              className="cursor-pointer"
            >
              {pinnedChats.some(
                (pinnedChat: { id: any }) => pinnedChat.id === chat.id
              ) ? (
                <>
                  <RiUnpinLine className="text-neutral-500" />{" "}
                  <span>Unpin</span>
                </>
              ) : (
                <>
                  <TiPinOutline className="text-neutral-400" /> <span>Pin</span>
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleDeleteChat(chat.id)}>
              <LiaTrashAltSolid />
              <span>Delete</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {/* <button
        onClick={() => handlePinnedChat(chat)}
        className="absolute top-2 right-2"
      >
        {pinnedChats.some(
          (pinnedChat: { id: any }) => pinnedChat.id === chat.id
        ) ? (
          <RiUnpinLine className="text-neutral-500" />
        ) : (
          <TiPinOutline className="text-neutral-400" />
        )}
      </button> */}
    </Link>
  );
};

export default ChatItem;
