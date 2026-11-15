import { LucideIcon } from 'lucide-react';

export type ToolCategory = 'dsa' | 'utilities' | 'data' | 'productivity';

export interface DeveloperToolMeta {
  id: string; // e.g. 'sorting-visualizer'
  title: string;
  tagline: string;
  description: string;
  category: ToolCategory;
  categoryName: string;
  iconName: string;
  badge?: string;
  popular?: boolean;
  tags: string[];
  urlPath: string;
}

export interface ToolCategoryInfo {
  id: ToolCategory;
  name: string;
  description: string;
  iconName: string;
  count: number;
}

