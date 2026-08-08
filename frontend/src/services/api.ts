import axios from 'axios';
import {
  User, Document, Quiz, Question, Flashcard,
  QuizAttemptResponse, AnalyticsSummary
} from '../types';

const API_BASE = '/api';

export const api = axios.create({
  baseURL: API_BASE,
});

// Request interceptor to attach JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authApi = {
  register: async (name: string, email: string, password: string): Promise<User> => {
    const res = await api.post<User>('/auth/register', { name, email, password });
    return res.data;
  },
  login: async (email: string, password: string): Promise<{ access_token: string }> => {
    const formData = new FormData();
    formData.append('username', email);
    formData.append('password', password);
    const res = await api.post<{ access_token: string }>('/auth/login', formData);
    return res.data;
  },
  getMe: async (): Promise<User> => {
    const res = await api.get<User>('/auth/me');
    return res.data;
  }
};

export const documentApi = {
  upload: async (file: File): Promise<Document> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post<Document>('/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 120000
    });
    return res.data;
  },
  list: async (): Promise<Document[]> => {
    const res = await api.get<Document[]>('/documents');
    return res.data;
  },
  get: async (id: number): Promise<Document> => {
    const res = await api.get<Document>(`/documents/${id}`);
    return res.data;
  },
  delete: async (id: number): Promise<void> => {
    await api.delete(`/documents/${id}`);
  }
};

export const quizApi = {
  generate: async (params: {
    document_id: number;
    question_count: number;
    difficulty: string;
    question_types: string[];
    selected_topics: string[];
    mode: string;
    time_limit_minutes?: number;
  }): Promise<Quiz> => {
    const res = await api.post<Quiz>('/quizzes/generate', params);
    return res.data;
  },
  list: async (): Promise<Quiz[]> => {
    const res = await api.get<Quiz[]>('/quizzes');
    return res.data;
  },
  get: async (id: number): Promise<Quiz> => {
    const res = await api.get<Quiz>(`/quizzes/${id}`);
    return res.data;
  },
  submit: async (quizId: number, answers: { question_id: number; user_answer: string; time_taken_seconds: number }[], totalTime: number): Promise<QuizAttemptResponse> => {
    const res = await api.post<QuizAttemptResponse>(`/quizzes/${quizId}/submit`, {
      quiz_id: quizId,
      answers,
      total_time_seconds: totalTime
    });
    return res.data;
  }
};

export const flashcardApi = {
  generate: async (documentId: number, topic?: string, count: number = 10): Promise<Flashcard[]> => {
    const res = await api.post<Flashcard[]>('/flashcards/generate', {
      document_id: documentId,
      topic,
      count
    });
    return res.data;
  },
  list: async (documentId?: number): Promise<Flashcard[]> => {
    const res = await api.get<Flashcard[]>('/flashcards', {
      params: { document_id: documentId }
    });
    return res.data;
  },
  updateStatus: async (id: number, isMastered: boolean): Promise<Flashcard> => {
    const res = await api.patch<Flashcard>(`/flashcards/${id}`, {
      is_mastered: isMastered
    });
    return res.data;
  }
};

export const analyticsApi = {
  getSummary: async (): Promise<AnalyticsSummary> => {
    const res = await api.get<AnalyticsSummary>('/analytics');
    return res.data;
  }
};
