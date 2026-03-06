<template>
  <div class="card">
    <div class="card-body">
      <div class="table-responsive">
        <table class="table table-hover">
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Tipo</th>
              <th>Inicio</th>
              <th>Vencimiento</th>
              <th>Estado</th>
              <th v-if="isSuperadmin && !filtroSucursal">Sucursal</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr 
              v-for="membresia in membresias" 
              :key="membresia.id"
              :class="getRowClass(membresia)"
              @click="$emit('ver-detalle', membresia)"
              style="cursor: pointer;"
            >
              <td>
                <div>{{ membresia.cliente?.nombre_completo }}</div>
                <small class="text-muted">{{ membresia.cliente?.telefono }}</small>
              </td>
              <td>
                {{ membresia.tipo_membresia?.nombre || 'Personalizada' }}
                <span v-if="!membresia.tipo_membresia" class="badge bg-info ms-1">Promo</span>
              </td>
              <td>{{ formatFecha(membresia.fecha_inicio) }}</td>
              <td>
                <span :class="getVencimientoClass(membresia.fecha_vencimiento)">
                  {{ formatFecha(membresia.fecha_vencimiento) }}
                </span>
              </td>
              <td>
                <span :class="getEstadoBadgeClass(membresia.estado)">
                  {{ membresia.estado }}
                </span>
              </td>
              <td v-if="isSuperadmin && !filtroSucursal">
                {{ (membresia.sucursal as any)?.nombre || 'N/A' }}
              </td>
              <td @click.stop>
                <div class="d-flex flex-wrap gap-1">
                  <div class="btn-group" role="group">
                    <button 
                      @click.stop="$emit('registrar-pago', membresia)" 
                      class="btn btn-sm btn-outline-success"
                      :disabled="membresia.estado === 'cancelada'"
                      :title="membresia.estado === 'cancelada' ? 'No se puede pagar una membresía cancelada' : 'Registrar pago'"
                    >
                      <i class="fa-solid fa-money-bill-wave"></i>
                    </button>
                    <button 
                      @click.stop="$emit('enviar-recordatorio', membresia)" 
                      class="btn btn-sm btn-outline-success"
                      :disabled="(membresia.estado !== 'activa' && membresia.estado !== 'vencida') || !membresia.cliente?.whatsapp"
                      :title="(membresia.estado !== 'activa' && membresia.estado !== 'vencida') ? 'Solo disponible para membresías activas o vencidas' : !membresia.cliente?.whatsapp ? 'El cliente no tiene WhatsApp' : 'Enviar recordatorio por WhatsApp'"
                    >
                      <i class="fa-brands fa-whatsapp"></i>
                    </button>
                    <button 
                      v-if="membresia.estado === 'activa' || membresia.estado === 'vencida'"
                      @click.stop="$emit('cancelar', membresia.id)" 
                      class="btn btn-sm btn-outline-danger"
                      title="Cancelar membresía"
                    >
                      <i class="fa-solid fa-ban"></i>
                    </button>
                    <button 
                      v-if="membresia.estado === 'cancelada'"
                      @click.stop="$emit('reactivar', membresia)" 
                      class="btn btn-sm btn-outline-success"
                      title="Reactivar membresía"
                    >
                      <i class="fa-solid fa-check-circle"></i>
                    </button>
                  </div>
                  <div class="btn-group" role="group">
                    <button 
                      @click.stop="$emit('editar-fechas', membresia)" 
                      class="btn btn-sm btn-outline-primary"
                      title="Editar fechas de membresía"
                    >
                      <i class="fa-solid fa-calendar-days"></i>
                    </button>
                    <button 
                      @click.stop="$emit('editar-cliente', membresia.cliente!)" 
                      class="btn btn-sm btn-outline-primary"
                      title="Editar cliente"
                      :disabled="!membresia.cliente"
                    >
                      <i class="fa-solid fa-user-edit"></i>
                    </button>
                    <button 
                      @click.stop="$emit('eliminar', membresia)" 
                      class="btn btn-sm btn-outline-danger"
                      title="Eliminar membresía"
                    >
                      <i class="fa-solid fa-trash"></i>
                    </button>
                  </div>
                </div>
              </td>
            </tr>
            <tr v-if="loading">
              <td :colspan="isSuperadmin && !filtroSucursal ? 7 : 6" class="text-center py-4">
                <div class="spinner-border spinner-border-sm text-primary me-2" role="status">
                  <span class="visually-hidden">Cargando...</span>
                </div>
                Cargando membresías...
              </td>
            </tr>
            <tr v-else-if="membresias.length === 0">
              <td :colspan="isSuperadmin && !filtroSucursal ? 7 : 6" class="text-center text-muted">No hay membresías</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Membresia } from '@/types/gym';

defineProps<{
  membresias: Membresia[];
  isSuperadmin: boolean;
  filtroSucursal: number | null;
  loading?: boolean;
}>();

defineEmits<{
  'ver-detalle': [membresia: Membresia];
  'registrar-pago': [membresia: Membresia];
  'enviar-recordatorio': [membresia: Membresia];
  'cancelar': [id: number];
  'reactivar': [membresia: Membresia];
  'editar-fechas': [membresia: Membresia];
  'editar-cliente': [cliente: any];
  'eliminar': [membresia: Membresia];
}>();

const formatFecha = (fecha: string) => {
  let fechaStr = '';
  if (typeof fecha === 'string') {
    if (fecha.includes('T')) {
      fechaStr = fecha.split('T')[0];
    } else if (fecha.includes(' ')) {
      fechaStr = fecha.split(' ')[0];
    } else {
      fechaStr = fecha;
    }
  } else {
    const fechaObj = new Date(fecha);
    const año = fechaObj.getFullYear();
    const mes = String(fechaObj.getMonth() + 1).padStart(2, '0');
    const dia = String(fechaObj.getDate()).padStart(2, '0');
    fechaStr = `${año}-${mes}-${dia}`;
  }
  
  const partes = fechaStr.split('-');
  if (partes.length === 3) {
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
  }
  
  return new Date(fecha).toLocaleDateString('es-MX');
};

const getEstadoBadgeClass = (estado: string) => {
  const clases: Record<string, string> = {
    activa: 'badge bg-success',
    vencida: 'badge bg-danger',
    cancelada: 'badge bg-secondary'
  };
  return clases[estado] || 'badge bg-secondary';
};

const normalizarFecha = (fecha: any): string | null => {
  if (!fecha) return null;
  
  try {
    if (typeof fecha === 'string') {
      const fechaStr = fecha.trim();
      if (fechaStr.includes('T')) {
        return fechaStr.split('T')[0];
      } else if (fechaStr.includes(' ')) {
        return fechaStr.split(' ')[0];
      } else if (/^\d{4}-\d{2}-\d{2}$/.test(fechaStr)) {
        return fechaStr;
      }
    }
    
    const fechaObj = new Date(fecha);
    if (!isNaN(fechaObj.getTime())) {
      const año = fechaObj.getFullYear();
      const mes = String(fechaObj.getMonth() + 1).padStart(2, '0');
      const dia = String(fechaObj.getDate()).padStart(2, '0');
      return `${año}-${mes}-${dia}`;
    }
  } catch (e) {
    console.error('Error al normalizar fecha:', fecha, e);
  }
  
  return null;
};

const getVencimientoClass = (fechaVencimiento: string) => {
  const hoyStr = new Date().toISOString().split('T')[0];
  const fechaVencimientoStr = normalizarFecha(fechaVencimiento);
  
  if (!fechaVencimientoStr) return '';
  
  const hoyDate = new Date(hoyStr + 'T00:00:00');
  const vencimientoDate = new Date(fechaVencimientoStr + 'T00:00:00');
  const diffTime = vencimientoDate.getTime() - hoyDate.getTime();
  const diasRestantes = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diasRestantes < 0) return 'text-danger fw-bold';
  if (diasRestantes >= 0 && diasRestantes <= 7) return 'text-warning fw-bold';
  
  return '';
};

const getRowClass = (membresia: Membresia) => {
  if (membresia.estado === 'vencida') return 'table-danger';
  if (membresia.estado === 'cancelada') return 'table-secondary';
  
  const hoyStr = new Date().toISOString().split('T')[0];
  const fechaVencimientoStr = normalizarFecha(membresia.fecha_vencimiento);
  
  if (!fechaVencimientoStr) return '';
  
  const hoyDate = new Date(hoyStr + 'T00:00:00');
  const vencimientoDate = new Date(fechaVencimientoStr + 'T00:00:00');
  const diasRestantes = Math.ceil((vencimientoDate.getTime() - hoyDate.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diasRestantes <= 7 && diasRestantes >= 0) return 'table-warning';
  return '';
};
</script>
