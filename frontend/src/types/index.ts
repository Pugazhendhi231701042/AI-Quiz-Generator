export interface User {
  id: number;
  name: string;
  email: string;
  created_at: string;
}

export interface Document {
  id: number;
  user_id: number;
  filename: string;
  file_type: string;
  file_size: number;
  status: 'processing' | 'completed' | 'failed';
  error_message?: string;
  chunk_count: number;
  detected_topics: string[];
  created_at: string;
}

export interface SourceReference {
  document_name: string;
  page_number?: number;
  section?: string;
  chunk_id: string;
  source_text?: string;
}

export interface Question {
  id: number;
  document_id: number;
  quiz_id?: number;
  type: 'mcq' | 'true_false' | 'fill_in_blank';
  question: string;
  options?: string[];
  correct_answer: string;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  topic: string;
  source_reference: SourceReference;
}

export interface Quiz {
  id: number;
  user_id: number;
  document_id: number;
  title: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'mixed';
  mode: 'practice' | 'exam' | 'timed';
  question_count: number;
  time_limit_minutes?: number;
  selected_topics: string[];
  created_at: string;
  questions?: Question[];
}

export interface UserAnswerItem {
  question_id: number;
  user_answer: string;
  time_taken_seconds: number;
}

export interface UserAnswerResult {
  question_id: number;
  question_text: string;
  user_answer: string;
  correct_answer: string;
  is_correct: boolean;
  explanation: string;
  source_reference: SourceReference;
}

export interface QuizAttemptResponse {
  attempt_id: number;
  quiz_id: number;
  score: number;
  correct_count: number;
  total_questions: number;
  time_taken_seconds: number;
  completed_at: string;
  topic_performance: Record<string, number>;
  results: UserAnswerResult[];
}

export interface Flashcard {
  id: number;
  user_id: number;
  document_id: number;
  front: string;
  back: string;
  category: string;
  topic: string;
  is_mastered: boolean;
  created_at: string;
}

export interface TopicPerformance {
  topic: string;
  accuracy_percentage: number;
  total_answered: number;
  correct_count: number;
  status: 'Strong' | 'Average' | 'Weak';
}

export interface RecommendationItem {
  topic: string;
  reason: string;
  suggested_difficulty: string;
  suggested_question_count: number;
  suggested_flashcard_count: number;
}

export interface AnalyticsSummary {
  total_quizzes_taken: number;
  average_score: number;
  total_questions_answered: number;
  strong_topics: string[];
  weak_topics: string[];
  topic_breakdown: TopicPerformance[];
  recommendations: RecommendationItem[];
}
