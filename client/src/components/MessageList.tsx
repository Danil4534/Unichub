import React, { useEffect, useRef } from "react";
import { Image } from "./ui/Image";
import { useStore } from "../store/store";
import LogoIconBlack from "../assets/icons/LogoIconBlack.svg";

import { TextAreaCustom } from "./ui/TextAreaCustom";
import EmojiPicker, { EmojiClickData, Theme } from "emoji-picker-react";
import { TbSend } from "react-icons/tb";
import { LuSmilePlus } from "react-icons/lu";
import { ScrollArea } from "./ui/scroll-area";
import { OpenChat } from "../shared/types/OpenChat";
import { Chat } from "../shared/types/Chat";
import { Avatar, AvatarImage } from "./ui/avatar";

type MessageListProps = {
  openChat?: OpenChat | undefined;
  emojiOpen?: any;
  setEmojiOpen?: any;
  currentChat?: any;
  messages?: any;
  messageInput?: any;
  setMessageInput?: any;
  handleSendMessage?: any;
};
const MessageList: React.FC<MessageListProps> = ({
  openChat,
  emojiOpen,
  setEmojiOpen,
  currentChat,
  messages,
  messageInput,
  setMessageInput,
  handleSendMessage,
}) => {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getUTCMinutes()).padStart(2, "0");
    return ` ${hours}:${minutes}`;
  };
  const getChatPartner = (chat: Chat, currentUserId: string) => {
    return chat.user1.id === currentUserId ? chat.user2 : chat.user1;
  };
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  const onEmojiClick = (emojiData: EmojiClickData) => {
    setMessageInput((prev: any) => prev + emojiData.emoji);
  };
  const store = useStore();
  return (
    <div>
      {openChat && currentChat && (
        <>
          <div className="w-full p-2 light:bg-white">
            <div className="flex w-full">
              <div className="flex items-center gap-2 ">
                {getChatPartner(currentChat, store.currentUser.id).img ? (
                  <>
                    <Image
                      src={
                        getChatPartner(currentChat, store.currentUser.id).img
                      }
                      className="w-10 h-10 border p-1 rounded-full"
                    />
                  </>
                ) : (
                  <>
                    <div className="w-10 h-auto  p-2 rounded-full border border-neutral-400">
                      <Image
                        src={LogoIconBlack}
                        className="w-full h-full animate-rotate"
                      />
                    </div>
                  </>
                )}
                <div>
                  <div>
                    {getChatPartner(currentChat, store.currentUser.id).name}{" "}
                    {getChatPartner(currentChat, store.currentUser.id).surname}
                  </div>
                  {getChatPartner(currentChat, store.currentUser.id).info}{" "}
                </div>
              </div>
            </div>
          </div>
          <div className="w-full light:border-neutral-500 border rounded-xl py-2 px-2">
            <ScrollArea className="flex h-[calc(90vh-255px)] overflow-auto p-2 dark:bg-neutral-800 bg-neutral-100 rounded-lg">
              <div className="flex flex-col p-2 gap-2 w-full h-full">
                {messages.length == 0 ? (
                  <div className="w-full h-full flex justify-center items-center">
                    <div className="w-52 shadow-xl h-60 bg-gradient-to-br from-emerald-400 to-white dark:bg-gradient-to-br dark:from-emerald-400 dark:to-neutral-900  rounded-2xl flex flex-col items-center justify-between p-4">
                      {getChatPartner(currentChat, store.currentUser.id).img ? (
                        <Image
                          src={
                            getChatPartner(currentChat, store.currentUser.id)
                              .img
                          }
                          className="w-28 h-30 border-4 s p-1 rounded-full border-white shadow-xl"
                        />
                      ) : (
                        <div className="w-28 h-auto border-4 p-4 rounded-full border-white">
                          <Image
                            src={LogoIconBlack}
                            className="w-full h-full animate-rotate"
                          />
                        </div>
                      )}
                      <div>
                        {" "}
                        {getChatPartner(currentChat, store.currentUser.id).name}
                      </div>

                      <div className="bg-neutral-900 w-full text-center py-2 rounded-xl text-white font-k2d">
                        Send Message
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    {messages.map((message: any, index: number) => (
                      <div
                        key={index}
                        className={`p-2 max-w-[200px] h-full ${
                          message.userId === store.currentUser.id
                            ? " flex gap-2 flex-row-reverse items-center self-end"
                            : "flex gap-2 flex-row-reverse items-center self-start "
                        }`}
                      >
                        <div
                          className={`${
                            message.userId === store.currentUser.id
                              ? "p-2 bg-white border rounded-l-xl rounded-tr-xl dark:bg-neutral-900"
                              : "p-2 bg-white border rounded-r-xl rounded-tl-xl self-end dark:bg-neutral-700"
                          }`}
                        >
                          <p className="text-wrap break-all h-auto">
                            {message.content}
                          </p>
                          <div className="text-xs text-end text-neutral-400">
                            {formatDate(message.created)}
                          </div>
                          <div ref={bottomRef} />
                        </div>
                        <Avatar>
                          <AvatarImage
                            src={
                              message.userId === store.currentUser.id
                                ? store.currentUser.img
                                : getChatPartner(
                                    currentChat,
                                    store.currentUser.id
                                  ).img
                            }
                          />
                        </Avatar>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </ScrollArea>
            <div className="flex w-full h-auto justify-between gap-2 mt-4 ">
              <div className="w-full relative flex items-center justify-center">
                <TextAreaCustom
                  placeholder="Type a message..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  className="w-full dark:bg-neutral-800 dark:placeholder:text-neutral-400 dark:text-white resize-none "
                />
              </div>
              <button
                disabled={messageInput.trim() === ""}
                onClick={() => handleSendMessage(openChat.chatId)}
                className="w-[40px] h-[40px] flex justify-center items-center text-neutral-400 cursor-pointer rounded-full hover:text-emerald-300 hover:bg-transparent hover:border-emerald-400 border "
              >
                <TbSend />
              </button>
              <button
                className="w-[40px] h-[40px]  flex justify-center items-center hover:border-emerald-400 border rounded-full p-2 hover:cursor-pointer"
                onClick={() => setEmojiOpen(!emojiOpen)}
              >
                <LuSmilePlus className="text-neutral-400" />
              </button>
            </div>
          </div>
          {emojiOpen && (
            <div className="absolute bottom-20 right-4  z-10">
              {store.theme == "dark" ? (
                <EmojiPicker
                  onEmojiClick={onEmojiClick}
                  style={{ width: "250px" }}
                  theme={Theme.DARK}
                />
              ) : (
                <EmojiPicker
                  onEmojiClick={onEmojiClick}
                  style={{ width: "250px" }}
                  reactionsDefaultOpen={false}
                />
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MessageList;
