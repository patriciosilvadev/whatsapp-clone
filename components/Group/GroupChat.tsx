import React, { SyntheticEvent, useEffect, useRef, useState } from "react";
import { AiFillStar } from "react-icons/ai";
import { IoIosArrowDown } from "react-icons/io";
import { BsCheck, BsCheckAll, BsInfoCircleFill } from "react-icons/bs";
import { IoMdShareAlt } from "react-icons/io";
import { MdDelete, MdSend } from "react-icons/md";
import { connect, useSelector } from "react-redux";
import { bindActionCreators } from "redux";
import { axios } from "../../Axios";
import { Group } from "../../interfaces/Group";
import { GroupMsg } from "../../interfaces/GroupMsg";
import { Redux } from "../../interfaces/Redux";
import { User } from "../../interfaces/User";
import {
  AddGroupMessage,
  addGroupMessage,
  fetchGroupMessages,
  setGroupDelivered,
  SetGroupDisplay,
  setGroupDisplay,
  SetGroupMsgInfo,
  setGroupMsgInfo,
  SetGroupSearch,
  setGroupSearch,
  SetSelectedInfoMsg,
  setSelectedInfoMsg,
  SetSelectGroupMessages,
  setSelectGroupMessages,
  updateGroupRead
} from "../../redux/actions";
import styles from "../../styles/groupChat.module.css";
import GroupBox from "./GroupBox";
import GroupChatHeader from "./GroupChatHeader";
import GroupMessages from "./GroupMessages";
let ScrollIntoViewIfNeeded: any;
if (typeof window !== "undefined") {
  ScrollIntoViewIfNeeded = React.lazy(
    () => import("react-scroll-into-view-if-needed")
  );
}

interface Props {
  setSelectGroupMessages: (set: boolean) => SetSelectGroupMessages;
  setGroupDisplay: (set: boolean) => SetGroupDisplay;
  addGroupMessage: (msg: GroupMsg) => AddGroupMessage;
  updateGroupRead: (data: { messageIds: string[]; readBy: string }) => void;
  setGroupSearch: (set: boolean) => SetGroupSearch;
  setGroupMsgInfo: (set: boolean) => SetGroupMsgInfo;
  setSelectedInfoMsg: (msg: string) => SetSelectedInfoMsg;
  setGroupDelivered: () => void;
  fetchGroupMessages: (grpId: string, count: number) => void;
}
const GroupChat: React.FC<Props> = props => {
  const [showBox, setShowBox] = useState<boolean>(false);
  const [visible, setVisible] = useState<boolean>(false);
  const [active, setActive] = useState<boolean>(false);
  const [scroll, setScroll] = useState<boolean>(false);
  const [showScroll, setShowScroll] = useState<boolean>(true);
  const [selectedMessages, setSelectedMessages] = useState<string[]>([]);
  const [input, setInput] = useState<string>("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const currentUser = useSelector((state: Redux) => state.user.currentUser);
  const groupInfo = useSelector((state: Redux) => state.group.groupInfo);
  const groupChat = useSelector((state: Redux) => state.group.groupChat);
  const currentGroup = useSelector((state: Redux) => state.group.currentGroup);
  const groupSearch = useSelector((state: Redux) => state.group.groupSearch);
  const grpScrollMsg = useSelector((state: Redux) => state.group.grpScrollMsg);
  const grpMsgCountLoading = useSelector(
    (state: Redux) => state.group.grpMsgCountLoading
  );
  const groupMessageInfo = useSelector(
    (state: Redux) => state.group.groupMessageInfo
  );
  const selectGroupMessages = useSelector(
    (state: Redux) => state.group.selectGroupMessages
  );
  const groupMessages = useSelector(
    (state: Redux) => state.group.groupMessages
  );
  const groupMessageLoading = useSelector(
    (state: Redux) => state.group.groupMessageLoading
  );
  const grpMsgCount = useSelector((state: Redux) => state.group.grpMsgCount);
  const usePrevious = (value: number) => {
    const ref = useRef<number>();
    useEffect(() => {
      ref.current = value;
    });
    return ref.current;
  };
  const prevMsgLength = usePrevious(groupMessages ? groupMessages.length : 0);

  useEffect(() => {
    selectGroupMessages && setShowBox(false);
  }, [selectGroupMessages]);
  useEffect(() => {
    if (!groupChat) {
      props.setSelectGroupMessages(false);
      setSelectedMessages([]);
    }
  }, [groupChat]);
  useEffect(() => {
    !groupMessages && setActive(false);
    if (groupMessages) {
      prevMsgLength !== groupMessages.length && setActive(ac => !ac);
      const unreadMsgs = groupMessages
        .filter(msg => {
          const read =
            msg.readBy &&
            msg.readBy.find(usr => usr.user._id === currentUser?._id);
          if (read || msg.from._id === currentUser?._id) {
            return false;
          }
          return true;
        })
        .map(msg => msg._id);
      if (unreadMsgs && unreadMsgs.length !== 0) {
        props.updateGroupRead({
          messageIds: unreadMsgs as string[],
          readBy: currentUser!._id
        });
        props.setGroupDelivered();
      }
    }
    if (!scroll) {
      setScroll(true);
    }
  }, [groupMessages ? groupMessages.length : groupMessages]);

  const sendGroupMessage = async (
    e: React.FormEvent<HTMLFormElement>,
    msg: string
  ): Promise<void> => {
    try {
      e.preventDefault();
      setInput("");
      const createdAt = new Date().toISOString();
      props.addGroupMessage({
        createdAt,
        from: currentUser as User,
        group: currentGroup as Group,
        message: msg
      });
      await axios.post("/api/new/group/message", {
        message: msg,
        group: currentGroup?._id,
        createdAt,
        count: currentGroup?.count
      });
    } catch (error) {
      console.log(error.response);
    }
  };
  const renderTick = (grpMsg: GroupMsg) => {
    if (
      grpMsg.read &&
      grpMsg.readBy?.length === currentGroup!.participants.length - 1
    ) {
      return (
        <BsCheckAll
          size="17px"
          style={{ transform: "rotate(-10deg)" }}
          color="#4fc3f7"
        />
      );
    }
    if (
      grpMsg.deliveredTo &&
      grpMsg.deliveredTo.length === currentGroup!.participants.length - 1
    ) {
      return (
        <BsCheckAll
          size="17px"
          style={{ transform: "rotate(-10deg)" }}
          color="rgba(0,0,0,.5)"
        />
      );
    }

    if (grpMsg._id) {
      return (
        <BsCheck
          size="17px"
          style={{ transform: "rotate(-10deg)" }}
          color="rgba(0,0,0,.5)"
        />
      );
    }
  };
  const handleScroll = (e: SyntheticEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const scrollPercentage = scrollTop + clientHeight + 500 >= scrollHeight;
    if (scrollPercentage) {
      setShowScroll(false);
    } else {
      if (!showScroll) {
        setShowScroll(true);
      }
    }
    if (e.currentTarget.scrollTop < 100 && !visible) {
      setVisible(true);
    }
    if (e.currentTarget.scrollTop > 500 && visible) {
      setVisible(false);
    }
  };
  useEffect(() => {
    if (groupMessages && visible && grpMsgCount > groupMessages!.length) {
      props.fetchGroupMessages(currentGroup!._id, grpMsgCount);
    }
  }, [visible, groupMessages ? groupMessages.length : groupMessages]);
  return (
    <div
      className={`${groupInfo && groupChat ? styles.groupInfo : ""} ${
        !groupChat ? styles.hide__container : ""
      } ${selectGroupMessages ? styles.selectGroupMessages : ""} ${
        groupSearch ? styles.groupSearch : ""
      } ${groupMessageInfo ? styles.groupMessageInfo : ""}`}
    >
      {groupMessageLoading && !groupMessages && (
        <div className={styles.spinner}>
          <div className={`ui active centered inline loader`}></div>
          <p>fetching messages</p>
        </div>
      )}
      {grpMsgCountLoading && (
        <div className={styles.spinner}>
          <div className={`ui active centered inline loader`}></div>
          <p>fetching messages</p>
        </div>
      )}
      <div className={`${styles.container} ${showBox ? styles.showBox : ""}`}>
        <GroupChatHeader currentGroup={currentGroup} setShowBox={setShowBox} />
        <GroupBox setShowBox={setShowBox} />
        <div className={`${styles.body}`} onScroll={handleScroll}>
          <GroupMessages
            active={active}
            setSelectedMessages={setSelectedMessages}
            currentUser={currentUser}
            groupMessages={groupMessages}
            grpScrollMsg={grpScrollMsg}
            renderTick={renderTick}
            selectGroupMessages={selectGroupMessages}
            selectedMessages={selectedMessages}
          />
          <div ref={scrollRef}></div>
        </div>
        <form
          onSubmit={e =>
            input.trim().length !== 0 && sendGroupMessage(e, input)
          }
        >
          <div
            className={`${styles.input} ${
              showScroll ? styles.setShowScroll : ""
            }`}
          >
            <div
              onClick={() =>
                scrollRef.current &&
                scrollRef.current.scrollIntoView({ behavior: "smooth" })
              }
              className={styles.scroll_bottom}
            >
              <IoIosArrowDown size="20px" color="rgb(80,80,80)" />
            </div>
            <input
              type="text"
              onChange={e => setInput(e.target.value)}
              value={input}
            />
            <button type="submit" className={styles.MdSend}>
              <MdSend size="20px" color="white" />
            </button>
          </div>
        </form>
        <div className={styles.select_box}>
          <div
            className={styles.cancel}
            onClick={() => {
              props.setSelectGroupMessages(false);
              setSelectedMessages([]);
            }}
          >
            <p>&nbsp;</p>
          </div>
          <div>
            <p>{selectedMessages.length} selected</p>
          </div>
          <div
            onClick={() => {
              if (
                selectedMessages.length === 1 &&
                groupMessages?.find(msg => msg._id === selectedMessages[0])
                  ?.from._id === currentUser?._id
              ) {
                props.setSelectedInfoMsg(selectedMessages[0]);
                props.setGroupMsgInfo(true);
              }
            }}
          >
            <BsInfoCircleFill
              size="25px"
              style={{
                cursor: selectedMessages.length === 1 ? "pointer" : "default"
              }}
              color={`${
                selectedMessages.length !== 1
                  ? "rgba(80,80,80,.5)"
                  : "rgba(80,80,80)"
              }`}
            />
          </div>
          <div>
            <AiFillStar
              size="25px"
              style={{
                cursor: selectedMessages.length !== 0 ? "pointer" : "default"
              }}
              color={`${
                selectedMessages.length === 0
                  ? "rgba(80,80,80,.5)"
                  : "rgba(80,80,80)"
              }`}
            />
          </div>
          <div>
            <MdDelete
              size="25px"
              style={{
                cursor: selectedMessages.length !== 0 ? "pointer" : "default"
              }}
              color={`${
                selectedMessages.length === 0
                  ? "rgba(80,80,80,.5)"
                  : "rgba(80,80,80)"
              }`}
            />
          </div>
          <div>
            <IoMdShareAlt
              size="25px"
              style={{
                cursor: selectedMessages.length !== 0 ? "pointer" : "default"
              }}
              color={`${
                selectedMessages.length === 0
                  ? "rgba(80,80,80,.5)"
                  : "rgba(80,80,80)"
              }`}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default connect<{}, Props>(null, dispatch =>
  bindActionCreators(
    {
      setSelectGroupMessages,
      setGroupDisplay,
      addGroupMessage,
      updateGroupRead,
      setGroupSearch,
      setGroupMsgInfo,
      setSelectedInfoMsg,
      setGroupDelivered,
      fetchGroupMessages
    },
    dispatch
  )
)(GroupChat);
