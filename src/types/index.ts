export type IContextType = {
  user: IUser;
  isLoading: boolean;
  setUser: React.Dispatch<React.SetStateAction<IUser>>;
  isAuthenticated: boolean;
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
  checkAuthUser: () => Promise<boolean>;
};

export type INavLink = {
  imgURL: string;
  route: string;
  label: string;
};

export type IUpdateUser = {
  userId: string;
  name: string;
  username: string;
  email: string;
  bio: string;
  imageUrl?: string;
  image_url?: string;
  file: File[];
  privacy_setting?: 'public' | 'private' | 'followers_only';
};

export type INewPost = {
  userId: string;
  caption: string;
  file: File[];
  location?: string;
  tags?: string;
  category: 'general' | 'announcement' | 'question';
};

export type IUpdatePost = {
  postId: string;
  caption: string;
  imageUrl?: string;
  image_url?: string;
  file: File[];
  location?: string;
  tags?: string;
  category?: 'general' | 'announcement' | 'question';
};

export type IUser = {
  id: string;
  _id?: string;
  name: string;
  username: string;
  email: string;
  imageUrl: string;
  image_url?: string;
  bio: string;
  role?: string;
  isDeactivated?: boolean;
  followers?: string[];
  following?: string[];
  savedPosts?: string[];
  privacy_setting?: 'public' | 'private' | 'followers_only';
};

export type IPost = {
  id: string;
  _id?: string;
  caption: string;
  imageUrl: string;
  image_url?: string;
  location?: string;
  tags?: string[];
  creator: IUser;
  likes: string[];
  saves?: string[];
  comments: string[];
  category: 'general' | 'announcement' | 'question';
  createdAt: string;
  updatedAt: string;
  _count?: {
    likes?: number;
    comments?: number;
  };
};

export type INewUser = {
  name: string;
  email: string;
  username: string;
  password: string;
};

export type INewComment = {
  content: string;
  postId: string;
  parentId?: string;
};

export type IComment = {
  id: string;
  _id?: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  user: IUser;
  post: string;
  parentComment: string | null;
  likes: string[];
  replies?: IComment[];
  is_edited?: boolean;
  _count?: {
    likes?: number;
    replies?: number;
  };
};

export type DocumentList = {
  documents: {
    $id: string; // Cursor or identifier
    [key: string]: unknown; // Additional fields for each document
  }[];
  total?: number; // Optional: total number of documents
};

export type IMessage = {
  _id: string;
  sender: IUser;
  receiver: string | IUser;
  conversation: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
};

export type IConversation = {
  _id: string;
  participants: IUser[];
  lastMessage?: string | IMessage;
  lastMessageText?: string;
  createdAt: string;
  updatedAt: string;
};