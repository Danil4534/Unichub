import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useStore } from "../store/store";
import { Image } from "../components/ui/Image";
import LogoIconBlack from "../assets/icons/LogoIconBlack.svg";
import LogoIconLight from "../assets/icons/LogoIconLight.svg";
import { Sidebar, SidebarBody } from "../components/ui/SideBar";
import { TiPinOutline } from "react-icons/ti";
import { RiUnpinLine } from "react-icons/ri";
import { CiSearch } from "react-icons/ci";
import { Input } from "../components/ui/Input";
import { ScrollArea } from "../components/ui/scroll-area";
import ChatItem from "../components/ChatItem";
import MessageList from "../components/MessageList";
import { Chat } from "../shared/types/Chat";
import { Message } from "../shared/types/Message";
import { OpenChat } from "../shared/types/OpenChat";

const ChatsPage: React.FC = () => {
  const open = true;
  const store = useStore();
  const [emojiOpen, setEmojiOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [userChats, setUserChats] = useState<Chat[]>([]);
  const [pinnedChats, setPinnedChats] = useState<Chat[]>([]);
  const [openChat, setOpenChat] = useState<OpenChat | undefined>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState<string>("");

  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = io("http://localhost:3000");
    socketRef.current = socket;
    const currentUser = store.currentUser;
    if (!currentUser?.id) return;

    socket.on("connect", () => {
      socket.emit("getAllChats");
      socket.emit("getUserChats", currentUser.id);
    });

    socket.on("userChats", (userChats: Chat[]) => {
      setUserChats(userChats);
    });

    socket.on("getMessages", (receivedMessages: Message[]) => {
      setMessages(receivedMessages);
    });

    socket.on("message", (message: Message) => {
      if (message.chatId === openChat?.chatId) {
        setMessages((prev) => [...prev, message]);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [store, openChat?.chatId]);

  useEffect(() => {
    if (openChat?.chatId) {
      socketRef.current?.emit("getMessages", openChat.chatId);
    }
  }, [openChat]);

  const handleSendMessage = (chatId: string) => {
    if (!messageInput.trim()) return;

    const newMessage: Message = {
      chatId,
      userId: store.currentUser.id,
      content: messageInput,
      created: new Date().toISOString(),
    };

    socketRef.current?.emit("sendMessage", newMessage);
    setMessageInput("");
    setEmojiOpen(false);
  };

  const filteredResults = userChats
    .filter((chat) =>
      [chat.user1.name, chat.user2.name].some((name) =>
        name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    )
    .filter((chat) => !pinnedChats.some((pinned) => pinned.id === chat.id));

  const handlePinnedChat = (chat: Chat) => {
    setPinnedChats((prev) => {
      const isPinned = prev.some((pinned) => pinned.id === chat.id);
      return isPinned
        ? prev.filter((pinned) => pinned.id !== chat.id)
        : [...prev, chat];
    });
  };

  const currentChat = userChats.find((chat) => chat.id === openChat?.chatId);

  return (
    <div className="flex flex-col w-full h-full">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          <Image
            src={store.theme === "dark" ? LogoIconLight : LogoIconBlack}
            className="animate-rotate size-10"
          />
          <h1 className="font-k2d text-4xl uppercase">Unichub</h1>
        </div>
        <h1 className="font-k2d text-6xl">All Chats</h1>
      </div>

      <div className="flex w-full h-[calc(100vh-180px)] gap-2 border border-neutral-200 dark:border-neutral-600 p-4 rounded-xl">
        <Sidebar open={open}>
          <SidebarBody className="rounded-lg h-full py-2">
            <div className="relative w-full">
              <CiSearch className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder=" Search..."
                onChange={(e) => setSearchTerm(e.target.value)}
                className="caret-[#34d399] w-full dark:bg-neutral-900 dark:placeholder:text-neutral-400"
              />
            </div>

            {pinnedChats.length > 0 && (
              <>
                <h1 className="my-1 w-full flex gap-1 font-k2d text-sm items-center text-start">
                  <TiPinOutline className="text-neutral-400" />
                  Pinned ({pinnedChats.length})
                </h1>
                <ScrollArea className="h-1/3 w-full overflow-y-auto px-2">
                  <div className="flex flex-col gap-2 dark:bg-transparent bg-neutral-100 rounded-lg">
                    {pinnedChats.map((chat: Chat, index: number) => (
                      <ChatItem
                        key={chat.id}
                        chat={chat}
                        index={index}
                        className="rounded-lg dark:bg-neutral-600"
                        pinnedChats={pinnedChats}
                        onClick={() =>
                          setOpenChat({ open: true, chatId: chat.id })
                        }
                        handlePinnedChat={handlePinnedChat}
                      />
                    ))}
                  </div>
                </ScrollArea>
              </>
            )}

            <div className="flex w-full justify-start">
              <h1 className="w-full my-4 flex gap-1 items-center text-start font-k2d text-sm">
                <RiUnpinLine className="text-neutral-500" />
                All ({userChats.length})
              </h1>
            </div>

            <ScrollArea className="flex flex-col gap-2 px-2 w-full overflow-y-auto">
              <div className="flex flex-col gap-2">
                {filteredResults.map((chat, index) => (
                  <ChatItem
                    key={chat.id}
                    chat={chat}
                    index={index}
                    pinnedChats={pinnedChats}
                    className="rounded-lg dark:bg-neutral-600"
                    onClick={() => setOpenChat({ open: true, chatId: chat.id })}
                    handlePinnedChat={handlePinnedChat}
                  />
                ))}
              </div>
            </ScrollArea>
          </SidebarBody>
        </Sidebar>

        <div className="w-full  relative">
          <MessageList
            openChat={openChat}
            emojiOpen={emojiOpen}
            setEmojiOpen={setEmojiOpen}
            currentChat={currentChat}
            messages={messages}
            messageInput={messageInput}
            setMessageInput={setMessageInput}
            handleSendMessage={handleSendMessage}
          />
        </div>
      </div>
    </div>
  );
};

export default ChatsPage;
