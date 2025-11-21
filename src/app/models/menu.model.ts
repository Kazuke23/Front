export interface clsMenu {
  id: string;
  restauranteId: string;
  restauranteNombre?: string;
  nombre: string;
  fechaInicio: string;
  fechaFin: string;
  foto?: string; // URL de la imagen o base64
  createdAt: Date;
  updatedAt: Date;
}

// Alias para compatibilidad
export type Menu = clsMenu;

export interface MenuFormData {
  restaurante: string;
  nombre: string;
  fechaInicio: string;
  fechaFin: string;
}

