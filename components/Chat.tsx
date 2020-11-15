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
  updateSecondTick,
  setDisplay,
  SetDisplay,
  toggleContactInfo,
  ToggleContactInfo
} from "../redux/actions";
import { io } from "../pages";
import { User } from "../interfaces/User";
import formatDistance from "date-fns/formatDistance";
import { HiOutlineArrowLeft } from "react-icons/hi";

let ScrollIntoViewIfNeeded: any;
if (typeof window !== "undefined") {
  ScrollIntoViewIfNeeded = React.lazy(
    () => import("react-scroll-into-view-if-needed")
  );
}

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
  setDisplay: (display: boolean) => SetDisplay;
}

const Chat: React.FC<Props> = props => {
  const [input, setInput] = useState<string>("");
  const [height, setHeight] = useState<string>("100vh");
  const [active, setActive] = useState<boolean>(false);
  const currentContact = useSelector<Redux>(
    state => state.user.currentContact
  ) as Redux["user"]["currentContact"];
  const currentUser = useSelector<Redux>(
    state => state.user.currentUser
  ) as Redux["user"]["currentUser"];
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

  const renderTick = (msg: Message): JSX.Element => {
    if (!msg._id) {
      return <span></span>;
    }
    if (
      msg._id &&
      !msg.read &&
      msg.secondTick &&
      msg.to._id.toString() !== currentUser?._id.toString() &&
      currentContact?._id.toString() === msg.to._id.toString()
    ) {
      // DOUBLE TICK
      return (
        <img
          src="check-mark-grey.svg.med.png"
          alt="tick"
          className={styles.tick}
        />
      );
    }
    if (
      msg._id &&
      !msg.read &&
      msg.to._id.toString() !== currentUser?._id.toString()
    ) {
      // SINGLE TICK
      return (
        <img src="clipart1064340.png" alt="tick" className={styles.tick} />
      );
    }

    if (
      msg.read &&
      currentContact &&
      currentContact._id.toString() === msg.to._id.toString()
    ) {
      // BLUE TICK
      return (
        <img
          src="128px-Blue_double_ticks.svg.png"
          alt="tick"
          className={styles.tick}
        />
      );
    }
    return <span></span>;
  };

  return (
    <div
      className={` ${messagesLoading ? styles.spinner : styles.container} ${
        display ? styles.display_hiden : ""
      }`}
      style={{ height: height }}
      key={height}
      ref={containerRef}
    >
      <div className={styles.message_start}></div>
      {currentContact && !messages && (
        <div>
          <div className={`ui active centered inline loader`}></div>
          <p>fetching messages</p>
        </div>
      )}
      {currentContact && messages && (
        <React.Fragment>
          <div>
            <form
              onSubmit={e =>
                sendMessage(
                  {
                    message: input,
                    to: currentContact,
                    from: currentUser!,
                    createdAt: new Date().toISOString()
                  },
                  e
                )
              }
              className={styles.input_container}
            >
              <input
                type="text"
                className={styles.input}
                onChange={e => setInput(e.target.value)}
                value={input}
                onFocus={() => {
                  const user = {
                    ...currentUser,
                    typing: true,
                    online: true,
                    updatedAt: new Date().toISOString()
                  } as User;
                  io.emit("typing", { action: "change", user });
                  io.emit("active", { action: "change", user });
                }}
                onBlur={() => {
                  const user = {
                    ...currentUser,
                    typing: false,
                    online: true,
                    updatedAt: new Date().toISOString()
                  } as User;
                  io.emit("typing", { action: "change", user });
                  io.emit("active", { action: "change", user });
                }}
              />
              <button className={styles.MdSend} type="submit">
                <MdSend size="20px" />
              </button>
            </form>
          </div>
          <div>
            {messages.length !== 0 &&
              (messages as Message[]).map(msg => {
                return (
                  <div
                    className={`${
                      msg.from._id === currentUser!._id
                        ? styles.right_text
                        : styles.left_text
                    }`}
                    key={msg.createdAt}
                  >
                    <p>{msg.message}</p>
                    <div className={styles.metadata}>
                      <p>
                        {formatDistance(new Date(msg.createdAt), Date.now())}
                      </p>
                      {renderTick(msg)}
                    </div>
                  </div>
                );
              })}
          </div>
          <React.Suspense fallback={<div></div>}>
            <ScrollIntoViewIfNeeded active={active}>
              <div></div>
            </ScrollIntoViewIfNeeded>
          </React.Suspense>
        </React.Fragment>
      )}

      <div className={styles.message_start}></div>
    </div>
  );
};

export default connect<{}, Props>(null, {
  updateUser,
  addNewMessage,
  updateRead,
  updateSecondTick,
  setDisplay
})(Chat);
