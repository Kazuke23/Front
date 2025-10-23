export interface FormOption {
  label: string;   // Texto visible en el select
  value: string;   // Valor real que se envía
}

export interface FormField {
  name: string;           // Nombre del campo (control)
  label: string;          // Etiqueta que se muestra
  required?: boolean;     // Si es obligatorio
  type?: string;          // Tipo de input: text, email, select, etc.
  placeholder?: string;   // Texto dentro del input
  options?: FormOption[]; // Opciones del select (label y value)
}
