export interface MenuOption {
  icon: string;
  label: string;
  link: string;
  items: MenuOptionItem[];
  active?: boolean;
  expand?: boolean;
}

export interface MenuOptionItem {
  icon?: string;
  label: string;
  link: string;
}
