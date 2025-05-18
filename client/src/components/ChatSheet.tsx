import { AiOutlineMessage } from "react-icons/ai";
import { Sheet, SheetContent, SheetHeader, SheetTrigger } from "./ui/sheet";
import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useStore } from "../store/store";
import { CiSearch } from "react-icons/ci";
import { Input } from "./ui/Input";
import { RiUnpinLine } from "react-icons/ri";
import { TiPinOutline } from "react-icons/ti";
import ChatItem from "./ChatItem";
import { ScrollArea } from "./ui/scroll-area";
import { Chat } from "../shared/types/Chat";

export type ChatSheetProps = {
  trigger?: React.ReactNode;
};

export const ChatSheet: React.FC<ChatSheetProps> = ({ trigger }) => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [pinnedChats, setPinnedChats] = useState<Chat[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const socketRef = useRef<Socket>(null);
  const store = useStore();
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    const storedPinned = localStorage.getItem("pinnedChats");
    if (storedPinned) {
      try {
        setPinnedChats(JSON.parse(storedPinned));
      } catch (e) {
        console.error("Failed to parse pinnedChats:", e);
      }
    }

    const socket = io("http://localhost:3000");
    socketRef.current = socket;

    const currentUser = store.setCurrentUser();

    socket.on("connect", () => {
      socket.emit("getAllChats");
      socket.emit("getUserChats", currentUser.id);
    });

    socket.on("userChats", (chats: Chat[]) => {
      setChats(chats);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    localStorage.setItem("pinnedChats", JSON.stringify(pinnedChats));
  }, [pinnedChats]);

  const filteredResults = chats
    .filter((chat) =>
      chat.user2.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(
      (chat) => !pinnedChats.some((pinnedChat) => pinnedChat.id === chat.id)
    );

  const handlePinnedChat = (chat: Chat) => {
    setPinnedChats((prevPinnedChats) => {
      const isPinned = prevPinnedChats.some(
        (pinnedChat) => pinnedChat.id === chat.id
      );
      if (isPinned) {
        return prevPinnedChats.filter(
          (pinnedChat) => pinnedChat.id !== chat.id
        );
      } else {
        return [...prevPinnedChats, chat];
      }
    });
  };
  const handleChatClick = () => {
    setIsOpen(!isOpen);
  };
  return (
    <Sheet>
      <SheetTrigger>
        {trigger ?? <AiOutlineMessage size={20} color="A6A6A6" />}
      </SheetTrigger>
      <SheetContent side={"right"} className="p-0">
        <SheetHeader>
          <div className="p-2 py-4">
            <h2 className="text-lg font-k2d mb-2">Chats</h2>

            <div className="py-4 h-screen">
              <div className="flex flex-col gap-2">
                {pinnedChats.length > 0 && (
                  <>
                    <h1 className="my-1 flex gap-1 font-k2d text-sm items-center">
                      <TiPinOutline className="text-neutral-400" />
                      Pinned
                    </h1>
                    <ScrollArea className="flex flex-col gap-2 overflow-y-auto w-full max-h-1/3 p-2 bg-neutral-100 rounded-lg">
                      {pinnedChats
                        .filter((pinned) =>
                          chats.some((chat) => chat.id === pinned.id)
                        )
                        .map((chat, index) => (
                          <div key={chat.id} onClick={handleChatClick}>
                            <ChatItem
                              chat={chat}
                              index={index}
                              pinnedChats={pinnedChats}
                              handlePinnedChat={handlePinnedChat}
                            />
                          </div>
                        ))}
                    </ScrollArea>
                  </>
                )}
              </div>

              <div className="flex justify-between items-center">
                <h1 className="my-4 flex gap-1 items-center font-k2d text-sm">
                  <RiUnpinLine className="text-neutral-500" />
                  All {chats.length}
                </h1>
                <div className="relative w-3/6">
                  <CiSearch className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    type="text"
                    placeholder=" Search..."
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="caret-[#34d399] dark:bg-neutral-800 dark:placeholder:text-neutral-400"
                  />
                </div>
              </div>

              <ScrollArea className="flex flex-col gap-2 overflow-y-auto w-full h-auto p-2 bg-neutral-100 dark:bg-transparent rounded-lg">
                {filteredResults.map((chat, index) => (
                  <div key={chat.id} onClick={handleChatClick}>
                    <ChatItem
                      chat={chat}
                      index={index}
                      pinnedChats={pinnedChats}
                      handlePinnedChat={handlePinnedChat}
                    />
                  </div>
                ))}
              </ScrollArea>
            </div>
          </div>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  );
};
