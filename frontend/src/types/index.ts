export interface User {
  id: string;
  email: string;
  display_name?: string;
  created_at: string;
}

export interface Category {
  id: string;
  user_id?: string;
  name: string;
  color_hex: string;
  icon?: string;
  is_default: boolean;
  idea_count?: number;
}

export interface Tag {
  id: string;
  name: string;
}

export interface Note {
  id: string;
  idea_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  idea_id: string;
  title: string;
  is_completed: boolean;
  position: number;
  created_at: string;
}

export interface Reference {
  id: string;
  idea_id: string;
  url: string;
  title?: string;
  description?: string;
  domain?: string;
  thumbnail_url?: string;
  created_at: string;
}

export interface Attachment {
  id: string;
  idea_id: string;
  file_name: string;
  file_path: string;
  mime_type: string;
  file_size: number;
  created_at: string;
}

export interface IdeaConnectionBrief {
  id: string;
  title: string;
  status: string;
  category_id?: string;
}

export interface IdeaConnection {
  id: string;
  source_idea_id: string;
  target_idea_id: string;
  relationship_type?: string;
  description?: string;
  created_at: string;
  source_idea?: IdeaConnectionBrief;
  target_idea?: IdeaConnectionBrief;
}

export type IdeaStatus = 'SPARK' | 'EXPLORING' | 'DEVELOPING' | 'ACTIVE_PROJECT' | 'ARCHIVED';

export interface Idea {
  id: string;
  title: string;
  raw_thought: string;
  ai_summary?: string;
  status: IdeaStatus;
  importance: number;
  category_id?: string;
  category?: Category;
  canvas_x?: number;
  canvas_y?: number;
  canvas_fixed?: boolean;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
  last_interacted_at: string;
  tags: Tag[];
  notes_count?: number;
  tasks_count?: number;
  completed_tasks_count?: number;
}

export interface IdeaDetail extends Idea {
  notes: Note[];
  tasks: Task[];
  references: Reference[];
  attachments: Attachment[];
  outgoing_connections: IdeaConnection[];
  incoming_connections: IdeaConnection[];
}

export interface RediscoverItem {
  idea: Idea;
  reason: string;
  days_dormant: number;
  suggested_action: string;
}

export interface AISummary {
  title: string;
  one_sentence_summary: string;
  detailed_explanation: string;
  key_themes: string[];
  unresolved_questions: string[];
  suggested_categories: string[];
}

export interface AIExpansion {
  possible_directions: string[];
  assumptions: string[];
  first_experiments: string[];
  potential_challenges: string[];
  realistic_next_step: string;
}

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: string;
}

export interface AIStatus {
  configured: boolean;
  provider: string;
  model: string;
}
