export interface Menu {
  id: string;
  name: string;
  path: string;
  icon?: string;
  permissionKey?: string;
  parentId?: string | null;
  order: number;
  isVisible: boolean;
  isActive: boolean;
  group?: string;
  children?: Menu[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateMenuDto {
  name: string;
  path: string;
  icon?: string;
  permissionKey?: string;
  parentId?: string | null;
  order?: number;
  group?: string;
  isVisible?: boolean;
  isActive?: boolean;
}

export interface UpdateMenuDto extends Partial<CreateMenuDto> {}

export interface MenuReorderDto {
  id: string;
  parentId: string | null;
  order: number;
}
