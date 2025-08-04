export type Message = {
  id: string;
  role: 'user' | 'bot';
  content: string;
  reasoning?: string;
  isReasoningComplete?: boolean;
};

export type Chat = {
  id: string;
  title: string;
  messages: Message[];
};

export type Model = {
  id:string;
  name: string;
  description: string;
};

export type SuggestedQuestion = {
  id: string;
  question: string;
  reasoning: string;
  answer: string;
};

export type PatientData = {
  name: string;
  age?: number;
  gender?: 'Masculino' | 'Femenino' | 'Otro';
  height?: number;
  weight?: number;
  medicalHistory?: string;
  medications?: string;
  allergies?: string;
};
