import { AiFillStar } from "react-icons/ai";
import { BsInfoCircleFill } from "react-icons/bs";
import { IoMdShareAlt } from "react-icons/io";
import { MdDelete } from "react-icons/md";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { Message } from "../../interfaces/Message";
import { User } from "../../interfaces/User";
import { setShowMessageInfo, SetShowMessageInfo } from "../../redux/actions";
import styles from "../../styles/chat.module.css";

interface Props {
  setSelectMessages: React.Dispatch<React.SetStateAction<boolean>>;
  selected: string[];
  setSelected: React.Dispatch<React.SetStateAction<string[]>>;
  messages: Message[] | [] | null;
  currentUser: User | null;

  setShowMessageInfo: (msg: Message | null) => SetShowMessageInfo;
}

const SelectedMessagesBox = (props: Props) => {
  return (
    <div className={`${styles.selected_msgs} `}>
      <p
        onClick={() => {
          props.setSelectMessages(false);
          props.setSelected([]);
          props.setShowMessageInfo(null);
        }}
      >
        <span>&nbsp;</span>
      </p>
      <p>{props.selected.length} selected</p>
      <p
        onClick={() =>
          props.messages &&
          props.selected.length === 1 &&
          props.setShowMessageInfo(
            props.messages.find(
              msg => msg._id?.toString() === props.selected[0]
            ) as Message
          )
        }
      >
        <BsInfoCircleFill
          size="25px"
          color={`${
            props.selected.length === 1 &&
            props.messages &&
            props.messages.find(msg => msg._id === props.selected[0])?.from
              ._id === props.currentUser?._id
              ? `rgba(80, 80, 80)`
              : `rgba(80, 80, 80,.5)`
          } `}
          style={{
            cursor: `${props.selected.length === 1 ? "pointer" : "default"}`
          }}
        />
      </p>
      <p>
        <AiFillStar
          size="25px"
          color={`${
            props.selected.length !== 0
              ? `rgba(80, 80, 80)`
              : `rgba(80, 80, 80,.5)`
          } `}
          style={{
            cursor: `${props.selected.length !== 0 ? "pointer" : "default"}`
          }}
        />
      </p>
      <p>
        <MdDelete
          size="25px"
          color={`${
            props.selected.length !== 0
              ? `rgba(80, 80, 80)`
              : `rgba(80, 80, 80,.5)`
          } `}
          style={{
            cursor: `${props.selected.length !== 0 ? "pointer" : "default"}`
          }}
        />
      </p>
      <p>
        <IoMdShareAlt
          size="25px"
          color={`${
            props.selected.length !== 0
              ? `rgba(80, 80, 80)`
              : `rgba(80, 80, 80,.5)`
          } `}
          style={{
            cursor: `${props.selected.length !== 0 ? "pointer" : "default"}`
          }}
        />
      </p>
    </div>
  );
};

export default connect(null, dispatch =>
  bindActionCreators({ setShowMessageInfo }, dispatch)
)(SelectedMessagesBox);
