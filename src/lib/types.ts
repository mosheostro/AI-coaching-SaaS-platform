export type UserRole = "coach" | "client" | "admin";
export type SessionStatus = "scheduled" | "completed" | "cancelled" | "no_show";
export type TaskStatus =
  | "assigned"
  | "in_progress"
  | "submitted"
  | "approved"
  | "returned";

export type AccountStatus = "active" | "suspended";

export interface Profile {
  id: string;
  email: string;
  role: UserRole;
  full_name: string;
  avatar_url: string | null;
  locale: "en" | "ru" | "he";
  created_at: string;
  status: AccountStatus;
  must_change_password: boolean;
  last_seen_at: string | null;
  suspended_at: string | null;
  suspended_reason: string | null;
}

export interface CoachingSession {
  id: string;
  coach_id: string;
  client_id: string;
  title: string;
  scheduled_at: string;
  duration_min: number;
  status: SessionStatus;
  meeting_url: string | null;
  created_at: string;
}

export interface Task {
  id: string;
  coach_id: string;
  client_id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  status: TaskStatus;
  created_at: string;
}

export interface TaskSubmission {
  id: string;
  task_id: string;
  client_id: string;
  content: string | null;
  attachment_path: string | null;
  submitted_at: string;
  feedback: string | null;
  reviewed_at: string | null;
}

export interface Conversation {
  id: string;
  coach_id: string;
  client_id: string;
  created_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  read_at: string | null;
}

export interface ProgressMetric {
  id: string;
  client_id: string;
  coach_id: string;
  metric_key: string;
  value: number;
  note: string | null;
  recorded_at: string;
}
