export interface QuickResponseModel {
  id: number;
  title: string;
  content: string;
  status: boolean;
  keywords: string;
  quickResponseCategoryId: number;
}
export interface QuickResponseItem {
  id: number;
  title: string;
  content: string;
  status: boolean;
  keywords: string;
  createdAt: string;
  quickResponseCategory: QuickResponseCategory;
}

export interface QuickResponseCategory {
  quickResponseCategoryId: number;
  name: string;
}
export interface IQuickResponseFilter {
  categoryId?: number | null;
  status?: boolean | null;
  orderby?: 'title' | 'createdAt' | string;
  search?: string | null;
}
export interface ICreateQuickRespone {
  title: string;
  content: string;
  status: boolean;
  keywords?: string;
  quickResponseCategoryId: number;
}
export interface IUpdateQuickRespone {
  title?: string;
  content?: string;
  status?: boolean;
  keywords?: string;
  quickResponseCategoryId: number;
}
