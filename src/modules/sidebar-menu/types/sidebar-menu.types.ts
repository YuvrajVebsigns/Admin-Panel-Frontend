export interface SidebarMenu {
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
  children?: SidebarMenu[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateSidebarMenuDto {
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

export interface UpdateSidebarMenuDto extends Partial<CreateSidebarMenuDto> {}

export interface SidebarMenuReorderDto {
  id: string;
  parentId: string | null;
  order: number;
  group: string | null;
}
