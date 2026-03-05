// Tipos para el sistema de gimnasios

export interface Sucursal {
  id: number;
  nombre: string;
  direccion?: string | null;
  telefono?: string | null;
  email?: string | null;
  activa: boolean;
  created_at: string;
  updated_at: string;
}

export interface Empleado {
  id: number;
  username: string;
  password?: string; // Solo para creación/actualización, no se devuelve en consultas
  email?: string | null;
  nombre_completo: string;
  telefono?: string | null;
  rol: 'superadmin' | 'empleado';
  sucursal_id?: number | null;
  activo: boolean;
  created_at: string;
  updated_at: string;
  sucursal?: Sucursal | null;
}

export interface Cliente {
  id: number;
  nombre_completo: string;
  email?: string | null;
  telefono: string;
  whatsapp?: string | null;
  fecha_nacimiento?: string | null;
  genero?: string | null;
  direccion?: string | null;
  sucursal_id: number;
  notas?: string | null;
  created_at: string;
  updated_at: string;
  sucursal?: Sucursal | null;
}

export interface Producto {
  id: number;
  nombre: string;
  descripcion?: string | null;
  precio: number;
  stock: number;
  categoria?: string | null;
  estado: 'activo' | 'inactivo';
  sucursal_id: number;
  created_at: string;
  updated_at: string;
  sucursal?: Sucursal | null;
}

export interface VentaDetalle {
  id: number;
  venta_id: number;
  producto_id: number;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  created_at: string;
  producto?: Producto | null;
}

export interface Venta {
  id: number;
  sucursal_id: number;
  empleado_id: number;
  cliente_id?: number | null;
  fecha_venta: string;
  total: number;
  estado_pago: 'pagado' | 'pendiente' | 'cancelado';
  notas?: string | null;
  created_at: string;
  updated_at: string;
  sucursal?: Sucursal | null;
  empleado?: Empleado | null;
  cliente?: Cliente | null;
  detalles?: VentaDetalle[];
}

export interface TipoMembresia {
  id: number;
  nombre: string;
  descripcion?: string | null;
  precio_mensual: number;
  duracion_dias: number;
  activa: boolean;
  created_at: string;
  updated_at: string;
}

export interface Membresia {
  id: number;
  cliente_id: number;
  sucursal_id: number;
  tipo_membresia_id: number;
  fecha_inicio: string;
  fecha_vencimiento: string;
  estado: 'activa' | 'vencida' | 'cancelada';
  precio_mensual: number;
  created_at: string;
  updated_at: string;
  cliente?: Cliente | null;
  sucursal?: Sucursal | null;
  tipo_membresia?: TipoMembresia | null;
}

export interface PagoMembresia {
  id: number;
  membresia_id: number;
  empleado_id: number;
  fecha_pago: string;
  monto: number;
  mes_pagado: string;
  metodo_pago?: string | null;
  notas?: string | null;
  created_at: string;
  membresia?: Membresia | null;
  empleado?: Empleado | null;
}

// Tipos para formularios
export interface LoginForm {
  username: string;
  password: string;
  sucursal_id?: number | null;
}

export interface ProductoForm {
  nombre: string;
  descripcion?: string;
  precio: number;
  stock: number;
  categoria?: string;
  estado: 'activo' | 'inactivo';
}

export interface VentaForm {
  cliente_id?: number | null;
  productos: Array<{
    producto_id: number;
    cantidad: number;
  }>;
  estado_pago: 'pagado' | 'pendiente' | 'cancelado';
  notas?: string;
}

export interface ClienteForm {
  nombre_completo: string;
  email?: string;
  telefono: string;
  whatsapp?: string;
  fecha_nacimiento?: string;
  genero?: string;
  direccion?: string;
  notas?: string;
}

export interface MembresiaForm {
  cliente_id: number;
  tipo_membresia_id: number;
  fecha_inicio: string;
  precio_mensual: number;
}

export interface PagoMembresiaForm {
  membresia_id: number;
  fecha_pago: string;
  monto: number;
  mes_pagado: string;
  metodo_pago?: string;
  notas?: string;
}

// Tipos para reportes
export interface ReporteVentas {
  fecha: string;
  total: number;
  cantidad_ventas: number;
  cantidad_ventas_productos: number;
  cantidad_ventas_membresias: number;
  sucursal_id?: number;
  sucursal_nombre?: string;
  empleado_id?: number;
  empleado_nombre?: string;
}

export interface ReporteMembresias {
  total_activas: number;
  total_vencidas: number;
  total_canceladas: number;
  por_vencer_7_dias: number;
  por_vencer_15_dias: number;
}
