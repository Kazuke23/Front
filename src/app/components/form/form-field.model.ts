export interface FormField {
  type: 'text' | 'email' | 'number' | 'select';
  name: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  options?: { label: string; value: string }[];
}
