import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Idea, Category, IdeaConnection, IdeaDetail, AIStatus } from '../types';
import { api } from '../services/api';

interface IdeaContextType {
  ideas: Idea[];
  categories: Category[];
  connections: IdeaConnection[];
  selectedIdeaId: string | null;
  selectedIdeaDetail: IdeaDetail | null;
  loading: boolean;
  activeView: 'universe' | 'all' | 'categories' | 'connections' | 'rediscover';
  filterCategory: string | null;
  filterStatus: string | null;
  searchQuery: string;
  aiStatus: AIStatus | null;
  reducedMotion: boolean;
  physicsPaused: boolean;

  setActiveView: (view: 'universe' | 'all' | 'categories' | 'connections' | 'rediscover') => void;
  setFilterCategory: (catId: string | null) => void;
  setFilterStatus: (status: string | null) => void;
  setSearchQuery: (query: string) => void;
  setReducedMotion: (val: boolean) => void;
  setPhysicsPaused: (val: boolean | ((prev: boolean) => boolean)) => void;

  selectIdea: (id: string | null) => Promise<void>;
  refreshIdeas: () => Promise<void>;
  refreshCategories: () => Promise<void>;
  refreshConnections: () => Promise<void>;
  refreshSelectedIdea: () => Promise<void>;
  quickCapture: (rawThought: string, categoryId?: string, importance?: number, tags?: string[]) => Promise<Idea>;
  updateIdeaPosition: (id: string, x: number, y: number) => Promise<void>;
}

const IdeaContext = createContext<IdeaContextType | undefined>(undefined);

export const IdeaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [connections, setConnections] = useState<IdeaConnection[]>([]);
  const [selectedIdeaId, setSelectedIdeaId] = useState<string | null>(null);
  const [selectedIdeaDetail, setSelectedIdeaDetail] = useState<IdeaDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<'universe' | 'all' | 'categories' | 'connections' | 'rediscover'>('universe');
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [aiStatus, setAiStatus] = useState<AIStatus | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [physicsPaused, setPhysicsPaused] = useState(false);

  const refreshCategories = useCallback(async () => {
    try {
      const cats = await api.getCategories();
      setCategories(cats);
    } catch {
      // ignore
    }
  }, []);

  const refreshConnections = useCallback(async () => {
    try {
      const conns = await api.getConnections();
      setConnections(conns);
    } catch {
      // ignore
    }
  }, []);

  const refreshIdeas = useCallback(async () => {
    try {
      setLoading(true);
      const fetchedIdeas = await api.getIdeas({
        category_id: filterCategory || undefined,
        status: filterStatus || undefined,
        search: searchQuery || undefined,
      });
      setIdeas(fetchedIdeas);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [filterCategory, filterStatus, searchQuery]);

  const selectIdea = async (id: string | null) => {
    setSelectedIdeaId(id);
    if (!id) {
      setSelectedIdeaDetail(null);
      return;
    }
    try {
      const detail = await api.getIdea(id);
      setSelectedIdeaDetail(detail);
    } catch {
      setSelectedIdeaDetail(null);
    }
  };

  const refreshSelectedIdea = async () => {
    if (selectedIdeaId) {
      try {
        const detail = await api.getIdea(selectedIdeaId);
        setSelectedIdeaDetail(detail);
        // Also update list entry
        setIdeas((prev) =>
          prev.map((item) => (item.id === detail.id ? { ...item, ...detail } : item))
        );
      } catch {
        // ignore
      }
    }
  };

  const quickCapture = async (
    rawThought: string,
    categoryId?: string,
    importance: number = 3,
    tags: string[] = []
  ): Promise<Idea> => {
    // Call backend API
    const newIdea = await api.createIdea({
      raw_thought: rawThought,
      category_id: categoryId,
      importance,
      tags,
    });

    // Optimistically prepend to ideas list
    setIdeas((prev) => [newIdea, ...prev]);
    // Refresh categories count
    refreshCategories();

    // After 2.5s, refresh to pull background AI enrichment
    setTimeout(() => {
      refreshIdeas();
    }, 2500);

    return newIdea;
  };

  const updateIdeaPosition = async (id: string, x: number, y: number) => {
    // Update local state smoothly
    setIdeas((prev) =>
      prev.map((i) => (i.id === id ? { ...i, canvas_x: x, canvas_y: y, canvas_fixed: true } : i))
    );
    try {
      await api.updateIdea(id, { canvas_x: x, canvas_y: y, canvas_fixed: true });
    } catch {
      // ignore
    }
  };

  // Initial load
  useEffect(() => {
    refreshCategories();
    refreshConnections();
    api.getAIStatus().then(setAiStatus).catch(() => {});
  }, [refreshCategories, refreshConnections]);

  useEffect(() => {
    refreshIdeas();
  }, [refreshIdeas]);

  return (
    <IdeaContext.Provider
      value={{
        ideas,
        categories,
        connections,
        selectedIdeaId,
        selectedIdeaDetail,
        loading,
        activeView,
        filterCategory,
        filterStatus,
        searchQuery,
        aiStatus,
        reducedMotion,
        physicsPaused,
        setActiveView,
        setFilterCategory,
        setFilterStatus,
        setSearchQuery,
        setReducedMotion,
        setPhysicsPaused,
        selectIdea,
        refreshIdeas,
        refreshCategories,
        refreshConnections,
        refreshSelectedIdea,
        quickCapture,
        updateIdeaPosition,
      }}
    >
      {children}
    </IdeaContext.Provider>
  );
};

export const useIdeas = () => {
  const context = useContext(IdeaContext);
  if (!context) {
    throw new Error('useIdeas must be used within an IdeaProvider');
  }
  return context;
};
