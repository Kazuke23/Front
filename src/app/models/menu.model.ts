export interface Menu {
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

export interface MenuFormData {
  restaurante: string;
  nombre: string;
  fechaInicio: string;
  fechaFin: string;
}

