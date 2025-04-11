import { UserInfo } from "@/services/user/user";
import { Effect, Reducer } from "@umijs/max";
import services from "@/services";
import { ConversationDTO, ConversationInfo } from "@/services/chat/chat";

const { findUserByName } = services.Users;
const { getConversationByParticipants } = services.Chat;

export interface ChatState {
  users: UserInfo[];
  conversations: ConversationInfo[];
  selectedUser: UserInfo | null;
  selectedConversation: ConversationInfo | null;
}

export interface ChatModelType {
  namespace: 'chat',
  state: ChatState,
  effects: {
    findUsers: Effect,
  },
  reducers: {
    queryUsers: Reducer<ChatState>,
    setSelectedUser: Reducer<ChatState>,
    setSelectedConversation: Reducer<ChatState>
  }
}

const ChatModel: ChatModelType = {
  namespace: 'chat',
  state: {
    users: [],
    conversations: [],
    selectedUser: null,
    selectedConversation: null
  },
  effects: {
    *findUsers({payload}, {call, put}) {
      try {
        const data: UserInfo[] = yield call(findUserByName, payload);
        yield put({ type: 'queryUsers', payload: data });
      } catch (error: any) {
        throw error;
      }
    }
  },
  reducers: {
    queryUsers(state, { payload }) {
      return { 
        ...state, 
        users: payload
      };
    },

    // queryConversations(state, { payload }) {
    //   return { 
    //     ...state, 
    //     conversations: payload
    //   };
    // },

    setSelectedUser(state, { payload }) {
      return {
        ...state,
        selectedUser: payload,
      };
    },

    setSelectedConversation(state, { payload }) {
      return {
        ...state,
        selectedConversation: payload,
      };
    },
  }
}

export default ChatModel;