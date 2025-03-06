import request from '../utils/axios-config';
import { Source } from '../types/source';

export interface SourceListParams {
  page?: number;
  pageSize?: number;
  type?: string;
  status?: string;
  keyword?: string;
}

export interface SourceListResponse {
  total: number;
  data: Source[];
}

export const getSources = (params: SourceListParams) => {
  return request.get<SourceListResponse>('/sources', { params });
};

export const getSourceDetail = (id: number) => {
  return request.get<Source>(`/sources/${id}`);
};

export const createSource = (data: Partial<Source>) => {
  return request.post<Source>('/sources', data);
};

export const updateSource = (id: number, data: Partial<Source>) => {
  return request.put<Source>(`/sources/${id}`, data);
};

export const deleteSource = (id: number) => {
  return request.delete(`/sources/${id}`);
};
