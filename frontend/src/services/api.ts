import {
  User,
  Category,
  Idea,
  IdeaDetail,
  Note,
  Task,
  Reference,
  Attachment,
  IdeaConnection,
  RediscoverItem,
  AISummary,
  AIExpansion,
  AIMessage,
  AIStatus
} from '../types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

class ApiService {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('idea_bubbles_token');
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('idea_bubbles_token', token);
    } else {
      localStorage.removeItem('idea_bubbles_token');
    }
  }

  getToken(): string | null {
    return this.token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 204) {
      return {} as T;
    }

    if (!response.ok) {
      let errorDetail = 'Network request failed';
      try {
        const errorData = await response.json();
        errorDetail = errorData.detail || errorDetail;
      } catch {
        // fallback
      }
      throw new Error(errorDetail);
    }

    return response.json();
  }

  // --- Auth ---
  async register(data: { email: string; password: string; display_name?: string }) {
    const res = await this.request<{ access_token: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    this.setToken(res.access_token);
    return res;
  }

  async login(data: { email: string; password: string }) {
    const res = await this.request<{ access_token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    this.setToken(res.access_token);
    return res;
  }

  async getMe(): Promise<User> {
    return this.request<User>('/auth/me');
  }

  logout() {
    this.setToken(null);
  }

  // --- Categories ---
  async getCategories(): Promise<Category[]> {
    return this.request<Category[]>('/categories');
  }

  async createCategory(data: { name: string; color_hex: string; icon?: string }): Promise<Category> {
    return this.request<Category>('/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCategory(id: string, data: Partial<Category>): Promise<Category> {
    return this.request<Category>(`/categories/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteCategory(id: string): Promise<void> {
    return this.request<void>(`/categories/${id}`, { method: 'DELETE' });
  }

  // --- Ideas ---
  async getIdeas(params?: {
    search?: string;
    category_id?: string;
    status?: string;
    include_archived?: boolean;
    sort_by?: string;
    sort_order?: string;
  }): Promise<Idea[]> {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.category_id) query.append('category_id', params.category_id);
    if (params?.status) query.append('status', params.status);
    if (params?.include_archived !== undefined) query.append('include_archived', String(params.include_archived));
    if (params?.sort_by) query.append('sort_by', params.sort_by);
    if (params?.sort_order) query.append('sort_order', params.sort_order);

    return this.request<Idea[]>(`/ideas?${query.toString()}`);
  }

  async createIdea(data: {
    raw_thought: string;
    title?: string;
    category_id?: string;
    status?: string;
    importance?: number;
    tags?: string[];
    canvas_x?: number;
    canvas_y?: number;
  }): Promise<Idea> {
    return this.request<Idea>('/ideas', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getIdea(id: string): Promise<IdeaDetail> {
    return this.request<IdeaDetail>(`/ideas/${id}`);
  }

  async updateIdea(id: string, data: Omit<Partial<Idea>, 'tags'> & { tags?: string[] }): Promise<IdeaDetail> {
    return this.request<IdeaDetail>(`/ideas/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteIdea(id: string, permanent: boolean = false): Promise<void> {
    return this.request<void>(`/ideas/${id}?permanent=${permanent}`, {
      method: 'DELETE',
    });
  }

  // --- Notes ---
  async addNote(ideaId: string, content: string): Promise<Note> {
    return this.request<Note>(`/ideas/${ideaId}/notes`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  }

  async updateNote(ideaId: string, noteId: string, content: string): Promise<Note> {
    return this.request<Note>(`/ideas/${ideaId}/notes/${noteId}`, {
      method: 'PATCH',
      body: JSON.stringify({ content }),
    });
  }

  async deleteNote(ideaId: string, noteId: string): Promise<void> {
    return this.request<void>(`/ideas/${ideaId}/notes/${noteId}`, {
      method: 'DELETE',
    });
  }

  // --- Tasks ---
  async addTask(ideaId: string, title: string, position?: number): Promise<Task> {
    return this.request<Task>(`/ideas/${ideaId}/tasks`, {
      method: 'POST',
      body: JSON.stringify({ title, position }),
    });
  }

  async updateTask(ideaId: string, taskId: string, data: Partial<Task>): Promise<Task> {
    return this.request<Task>(`/ideas/${ideaId}/tasks/${taskId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteTask(ideaId: string, taskId: string): Promise<void> {
    return this.request<void>(`/ideas/${ideaId}/tasks/${taskId}`, {
      method: 'DELETE',
    });
  }

  // --- References ---
  async addReference(ideaId: string, url: string): Promise<Reference> {
    return this.request<Reference>(`/ideas/${ideaId}/references`, {
      method: 'POST',
      body: JSON.stringify({ url }),
    });
  }

  async deleteReference(ideaId: string, refId: string): Promise<void> {
    return this.request<void>(`/ideas/${ideaId}/references/${refId}`, {
      method: 'DELETE',
    });
  }

  // --- Attachments ---
  async uploadAttachment(ideaId: string, file: File): Promise<Attachment> {
    const formData = new FormData();
    formData.append('file', file);
    return this.request<Attachment>(`/ideas/${ideaId}/attachments`, {
      method: 'POST',
      body: formData,
    });
  }

  async deleteAttachment(ideaId: string, attachmentId: string): Promise<void> {
    return this.request<void>(`/ideas/${ideaId}/attachments/${attachmentId}`, {
      method: 'DELETE',
    });
  }

  // --- Connections ---
  async getConnections(): Promise<IdeaConnection[]> {
    return this.request<IdeaConnection[]>('/connections');
  }

  async createConnection(sourceId: string, data: {
    target_idea_id: string;
    relationship_type?: string;
    description?: string;
  }): Promise<IdeaConnection> {
    return this.request<IdeaConnection>(`/connections/${sourceId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteConnection(connectionId: string): Promise<void> {
    return this.request<void>(`/connections/${connectionId}`, {
      method: 'DELETE',
    });
  }

  // --- AI Studio ---
  async getAIStatus(): Promise<AIStatus> {
    return this.request<AIStatus>('/ai/status');
  }

  async summarizeIdea(ideaId: string): Promise<AISummary> {
    return this.request<AISummary>(`/ideas/${ideaId}/ai/summarize`, {
      method: 'POST',
    });
  }

  async expandIdea(ideaId: string): Promise<AIExpansion> {
    return this.request<AIExpansion>(`/ideas/${ideaId}/ai/expand`, {
      method: 'POST',
    });
  }

  async getChatHistory(ideaId: string): Promise<AIMessage[]> {
    return this.request<AIMessage[]>(`/ideas/${ideaId}/ai/chat`);
  }

  async sendChatMessage(ideaId: string, message: string): Promise<AIMessage> {
    return this.request<AIMessage>(`/ideas/${ideaId}/ai/chat`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  }

  // --- Rediscover ---
  async getRediscoverIdeas(): Promise<RediscoverItem[]> {
    return this.request<RediscoverItem[]>('/rediscover');
  }

  // --- Search ---
  async search(query: string, categoryId?: string, status?: string): Promise<Idea[]> {
    const params = new URLSearchParams({ q: query });
    if (categoryId) params.append('category_id', categoryId);
    if (status) params.append('status', status);
    return this.request<Idea[]>(`/search?${params.toString()}`);
  }
}

export const api = new ApiService();
