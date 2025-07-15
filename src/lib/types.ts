export type Message = {
  id: string;
  role: 'user' | 'bot';
  content: string;
};

export type Chat = {
  id: string;
  title: string;
  messages: Message[];
};

export type Model = {
    id: string;
    name: string;
    description: string;
};
