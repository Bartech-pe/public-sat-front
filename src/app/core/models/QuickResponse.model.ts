export interface QuickResponseModel {
    quickResponseId: number;
    title: string;
    content: string;
    isActive: boolean;
    keywords: string;
    quickResponseCategoryId: number;
}
export interface QuickResponseItem {
    quickResponseId:       number;
    title:                 string;
    content:               string;
    isActive:              boolean;
    keywords:              string;
    createdAt:             string;
    quickResponseCategory: QuickResponseCategory;
}

export interface QuickResponseCategory {
    quickResponseCategoryId: number;
    name:                    string;
}
export interface IQuickResponseFilter {
  categoryId?: number | null;
  isActive?: boolean | null;
  orderby?: 'title' | 'createdAt' | string;
  search?: string | null;
}
export interface ICreateQuickRespone {
    title:                 string;
    content:               string;
    isActive:              boolean;
    keywords?:              string;
    quickResponseCategoryId: number;
}
export interface IUpdateQuickRespone {
    title?:                 string;
    content?:               string;
    isActive?:              boolean;
    keywords?:              string;
    quickResponseCategoryId: number;
}
