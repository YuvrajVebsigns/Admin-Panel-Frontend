export interface Subscribe {
  id: string;
  email: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  status?: string;
  websiteId?:
    | string
    | {
        id: string;
        name: string;
        domain: string;
      };
  subscribedAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface SubscribeQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
  filters?: Record<string, unknown>;
}
