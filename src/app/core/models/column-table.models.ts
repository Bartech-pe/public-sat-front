import { IButtonSplit } from '@interfaces/button.interface';

export interface Column {
  header: string;
  type: 'avatar' | 'string' | 'number' | 'boolean' | 'buttons';
  customExportHeader?: string;
  align?: 'center' | 'start' | 'end';
  avatarUrl?: string;
  widthClass?: string;
  colSpan?: string;
  rowSpan?: string;
  field?: string;
  fields?: {
    field: string;
    textClass?: string;
  }[];
  trueText?: string;
  falseText?: string;
  buttons?: {
    icon: string;
    tooltip: 'Asignar habilidades';
    severity: 'contrast';
    badgeField: 'skills';
    onClick: 'assignmentSkills';
  }[];
}

// Tipo base para cada campo de una columna "normal" (de texto)
export interface ColumnField {
  field: string;
  textClass?: string;
}

// Tipo para columnas de texto o compuestas
export interface TextColumn {
  header: string;
  type?: 'text'; // valor por defecto si no se especifica
  fields: ColumnField[];
  widthClass?: string;
  align?: 'start' | 'center' | 'end';
  avatarUrl?: string; // opcional, si usas avatar
}

// Tipo para columnas booleanas (true/false)
export interface BooleanColumn {
  header: string;
  type: 'boolean' | 'html';
  field: string;
  trueText?: string;
  falseText?: string;
  widthClass?: string;
  align?: 'start' | 'center' | 'end';
  isTag?: boolean;
}

// Tipo para columnas con botones
export interface ButtonColumnButton {
  icon?: string;
  tooltip?: string;
  severity?:
    | 'primary'
    | 'secondary'
    | 'contrast'
    | 'danger'
    | 'info'
    | 'success';
  onClick?: string; // nombre del método que se ejecutará
  showDot?: boolean;
  badgeField?: string; // opcional, si tiene overlaybadge
  /**
   * Define si el botón está deshabilitado.
   * Puede ser:
   *  - un valor booleano fijo
   *  - una función que recibe la fila y devuelve true/false
   */
  disabled?: boolean | ((row: any) => boolean);
  component?: string;
  menuItems?: IButtonSplit[];
}

export interface ButtonColumn {
  header: string;
  type: 'buttons' | 'custom-buttons';
  buttons: ButtonColumnButton[];
  widthClass?: string;
  align?: 'start' | 'center' | 'end';
}

// Tipo unificado que agrupa todas las variantes posibles
export type ColumnDefinition = TextColumn | BooleanColumn | ButtonColumn;

export interface SortField {
  name: string;
  field: string;
  type: 'string' | 'number' | 'date';
}

export interface SortTable {
  label: string;
  field: string;
  order: 'DESC' | 'ASC';
}
