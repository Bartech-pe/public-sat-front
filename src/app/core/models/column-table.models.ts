export interface Column {
  field: string;
  header: string;
  customExportHeader?: string;
  align?: 'center' | 'start' | 'end';
  widthClass?: string;
  colSpan?: string;
  rowSpan?: string;
}
