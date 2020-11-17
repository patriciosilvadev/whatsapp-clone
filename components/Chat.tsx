import React, { useEffect, useRef, useState } from "react";
import styles from "../styles/chat.module.css";
import { ImAttachment } from "react-icons/im";
import { MdSend } from "react-icons/md";
import { connect, useSelector } from "react-redux";
import { Redux } from "../interfaces/Redux";
import { axios } from "../Axios";
import { Message } from "../interfaces/Message";
import {
  addNewMessage,
  AddNewMessage,
  updateUser,
  updateRead,
  updateSecondTick
} from "../redux/actions";
import { io } from "../pages";
import { User } from "../interfaces/User";
import formatDistance from "date-fns/formatDistance";
import ChatHeader from "./Chat/ChatHeader";
import ChatMessages from "./Chat/ChatMessages";

interface Props {
  updateUser: (userAttrs: { [key: string]: boolean }) => void;
  addNewMessage: (msg: {
    message: string | null;
    to: User;
    from: User;
    createdAt: string;
  }) => void;
  updateRead: (msgIds: string[]) => void;
  updateSecondTick: (msgIds: string[]) => void;
}

const Chat: React.FC<Props> = props => {
  const [input, setInput] = useState<string>("");
  const [height, setHeight] = useState<string>("100vh");
  const [active, setActive] = useState<boolean>(false);
  const [selectMessages, setSelectMessages] = useState<boolean>(false);
  const currentContact = useSelector<Redux>(
    state => state.user.currentContact
  ) as Redux["user"]["currentContact"];
  const currentUser = useSelector<Redux>(
    state => state.user.currentUser
  ) as Redux["user"]["currentUser"];
  const showContactInfo = useSelector<Redux>(
    state => state.user.showContactInfo
  ) as Redux["user"]["showContactInfo"];
  const messages = useSelector<Redux>(
    state => state.message.messages
  ) as Redux["message"]["messages"];
  const messagesLoading = useSelector<Redux>(
    state => state.message.messagesLoading
  ) as Redux["message"]["messagesLoading"];
  const display = useSelector<Redux>(
    state => state.message.display
  ) as Redux["message"]["display"];
  const containerRef = useRef<HTMLDivElement>(null);
  const usePrevious = (value: number) => {
    const ref = useRef<number>();
    useEffect(() => {
      ref.current = value;
    });
    return ref.current;
  };

  const msgLength = usePrevious(messages?.length || 0);
  useEffect(() => {
    if (messages && messages.length > 7) {
      setHeight("100%");
    } else {
      setHeight("100vh");
    }
    !messages && setActive(false);

    if (messages) {
      msgLength !== messages!.length && setActive(ac => !ac);
      const unreadIdMessagIds = (messages as Message[])
        .filter(
          (msg: Message) =>
            !msg.read && currentUser?._id.toString() !== msg.from._id.toString()
        )
        .map(msg => msg._id);
      if (unreadIdMessagIds.length !== 0) {
        props.updateRead(unreadIdMessagIds as string[]);
      }
      const singleTick = (messages as Message[])
        .filter(
          msg =>
            msg._id &&
            !msg.read &&
            msg.to._id.toString() !== currentUser?._id.toString()
        )
        .map(m => m._id) as string[] | [];
      if (
        singleTick.length !== 0 &&
        currentContact?.online &&
        currentContact?._id.toString() ===
          messages[messages.length - 1].to._id.toString()
      ) {
        props.updateSecondTick(singleTick);
      }
    }
  }, [
    messages
      ? messages.length
        ? (messages[messages.length - 1] as Message)._id
        : messages
      : messages,
    currentContact
  ]);
  const sendMessage = async (
    messageInfo: {
      message: string | null;
      to: User;
      from: User;
      createdAt: string;
    },
    e: React.FormEvent<HTMLFormElement> | any
  ) => {
    try {
      e.preventDefault();
      if (
        !messageInfo.message ||
        (messageInfo.message && messageInfo.message.trim() == "")
      ) {
        return;
      }
      props.addNewMessage(messageInfo);
      setInput("");
      await axios.post("/api/new/message", {
        ...messageInfo,
        to: messageInfo.to._id
      });
    } catch (error) {
      console.log(error.response);
    }
  };

  return (
    <div className={showContactInfo ? styles.contact_info : ""}>
      <div
        className={` ${messagesLoading ? styles.spinner : styles.container} ${
          display ? styles.display_hiden : ""
        }`}
        style={{ height: height }}
        key={height}
        ref={containerRef}
      >
        <ChatHeader
          currentContact={currentContact}
          showContactInfo={showContactInfo}
          setSelectMessages={setSelectMessages}
          selectMessages={selectMessages}
        />
        <div className={styles.message_start}></div>
        <ChatMessages
          currentContact={currentContact}
          active={active}
          currentUser={currentUser}
          input={input}
          messages={messages as Message[]}
          sendMessage={sendMessage}
          setInput={setInput}
          showContactInfo={showContactInfo}
          setSelectMessages={setSelectMessages}
          selectMessages={selectMessages}
        />

        <div className={styles.message_start}></div>
      </div>
    </div>
  );
};

export default connect<{}, Props>(null, {
  updateUser,
  addNewMessage,
  updateRead,
  updateSecondTick
})(Chat);
