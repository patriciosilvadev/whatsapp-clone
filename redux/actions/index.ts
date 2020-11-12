import { Dispatch } from "redux";
import { actionTypes } from "redux-form";
import { axios } from "../../Axios";
import { Message } from "../../interfaces/Message";
import { Redux } from "../../interfaces/Redux";
import { User } from "../../interfaces/User";
import { ActionTypes } from "./types";

export interface FetchContactAction {
  type: ActionTypes.fetchContacts;
  payload: User[];
}

export interface AddContactAction {
  type: ActionTypes.addContact;
  payload: User;
}

export const addContact = (user: User): AddContactAction => {
  return {
    type: ActionTypes.addContact,
    payload: user
  };
};

export interface FilterContact {
  type: ActionTypes.filterContacts;
  payload: string;
}

export const filterContact = (text: string): FilterContact => {
  return {
    type: ActionTypes.filterContacts,
    payload: text
  };
};

export interface AddCurrentContact {
  type: ActionTypes.addCurrentContact;
  payload: User;
}

export const addCurrentContact = (user: User): AddCurrentContact => {
  return {
    type: ActionTypes.addCurrentContact,
    payload: user
  };
};

export interface FetchMessages {
  type:
    | ActionTypes.fetchMessages
    | ActionTypes.messagesLoadingStart
    | ActionTypes.messagesLoadingStop;
  payload?: Message[] | [];
}

export const fetchMessages = (contactId: string) => async (
  dispatch: Dispatch,
  getState: () => Redux
) => {
  dispatch<FetchMessages>({ type: ActionTypes.messagesLoadingStart });
  getState().message.messages = null;
  const res = await axios.get<FetchMessages["payload"]>(
    `/api/messages/${contactId}`
  );
  dispatch<FetchMessages>({
    type: ActionTypes.fetchMessages,
    payload: res.data
  });
  dispatch<FetchMessages>({ type: ActionTypes.messagesLoadingStop });
};

export interface AddNewMessage {
  type: ActionTypes.addNewMessage;
  payload:
    | Message
    | {
        message: string | null;
        to: User;
        from: User;
        createdAt: string;
      };
  currentContact: User | null;
  currentUser: User | null;
}

export const addNewMessage = (
  message:
    | Message
    | {
        message: string | null;
        to: User;
        from: User;
        createdAt: string;
      }
) => (dispatch: Dispatch, getState: () => Redux) => {
  dispatch<AddNewMessage>({
    type: ActionTypes.addNewMessage,
    payload: message,
    currentContact: getState().user.currentContact,
    currentUser: getState().user.currentUser
  });
};

export interface UpdateLastMsg {
  type: ActionTypes.updateLastMsg;
  payload: Message;
}

export const updateLastMsg = (message: Message): UpdateLastMsg => {
  return {
    type: ActionTypes.updateLastMsg,
    payload: message
  };
};

export interface UpdateUser {
  type: ActionTypes.updateUser;
  payload?: User;
}

export const updateUser = (userAttr?: { [key: string]: any }) => async (
  dispatch: Dispatch
) => {
  try {
    const res = await axios.post<User>("/api/update/user", userAttr);
    dispatch<UpdateUser>({ type: ActionTypes.updateUser, payload: res.data });
  } catch (error) {
    console.log(error);
  }
};

export interface UpdateOnline {
  type: ActionTypes.updateOnline;
  payload: User;
}

export const updateOnline = (user: User): UpdateOnline => {
  return {
    type: ActionTypes.updateOnline,
    payload: user
  };
};

export interface UpdateTyping {
  type: ActionTypes.updateTyping;
  payload: User;
}

export const updateTyping = (user: User): UpdateTyping => {
  return {
    type: ActionTypes.updateTyping,
    payload: user
  };
};

export interface FilterRecentChats {
  type: ActionTypes.filterRecentChats;
  payload: string;
}

export const filterRecentChats = (text: string): FilterRecentChats => {
  return {
    type: ActionTypes.filterRecentChats,
    payload: text
  };
};
