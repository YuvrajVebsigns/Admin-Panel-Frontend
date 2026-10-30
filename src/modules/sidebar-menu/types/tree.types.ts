import { SidebarMenu } from './sidebar-menu.types';

export interface MenuGroupState {
  id: string; // e.g. "group:content management"
  groupName: string; // e.g. "Content Management"
  items: SidebarMenu[]; // Root items in this group
}

export type SelectionType =
  | {
      type: 'group';
      groupId: string;
      name: string;
    }
  | {
      type: 'item';
      groupId: string;
      itemId: string;
      name: string;
      isParent: boolean;
      childrenCount: number;
    }
  | {
      type: 'child';
      groupId: string;
      parentId: string;
      parentName: string;
      childId: string;
      name: string;
    }
  | null;
