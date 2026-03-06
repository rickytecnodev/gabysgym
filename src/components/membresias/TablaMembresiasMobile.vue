<template>
  <div>
    <div v-if="loading" class="text-center py-4">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Cargando...</span>
      </div>
    </div>
    <div v-else-if="membresias.length === 0" class="text-center text-muted py-4">
      No hay membresías
    </div>
    <div v-else class="row g-3">
      <div v-for="membresia in membresias" :key="membresia.id" class="col-12">
        <div 
          class="card h-100 shadow-sm" 
          :class="getCardClass(membresia)"
          @click="$emit('ver-detalle', membresia)"
          style="cursor: pointer;"
        >
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start mb-2">
              <div class="flex-grow-1">
                <h6 class="card-title mb-1 fw-bold">{{ membresia.cliente?.nombre_completo }}</h6>
                <small class="text-muted" v-if="membresia.cliente?.telefono">
                  <i class="fa-solid fa-phone me-1"></i>
                  {{ membresia.cliente.telefono }}
                </small>
              </div>
              <span :class="getEstadoBadgeClass(membresia.estado)" class="badge">
                {{ membresia.estado }}
              </span>
            </div>
            
            <div class="mb-2">
              <div class="d-flex align-items-center mb-1">
                <i class="fa-solid fa-tag me-2 text-muted"></i>
                <span class="small">
                  {{ membresia.tipo_membresia?.nombre || 'Personalizada' }}
                  <span v-if="!membresia.tipo_membresia" class="badge bg-info ms-1">Promo</span>
                </span>
              </div>
              <div class="small text-muted mb-1">
                <i class="fa-solid fa-calendar-check me-2"></i>
                Inicio: {{ formatFecha(membresia.fecha_inicio) }}
              </div>
              <div class="small" :class="getVencimientoClass(membresia.fecha_vencimiento)">
                <i class="fa-solid fa-calendar-times me-2"></i>
                Vence: {{ formatFecha(membresia.fecha_vencimiento) }}
              </div>
              <div v-if="isSuperadmin && !filtroSucursal && membresia.sucursal" class="small text-muted mt-1">
                <i class="fa-solid fa-building me-2"></i>
                {{ (membresia.sucursal as any)?.nombre }}
              </div>
            </div>
            
            <div class="d-flex flex-wrap gap-1 mt-2 pt-2 border-top" @click.stop>
              <button 
                @click.stop="$emit('registrar-pago', membresia)" 
                class="btn btn-sm btn-outline-success"
                :disabled="membresia.estado === 'cancelada'"
                title="Registrar pago"
              >
                <i class="fa-solid fa-money-bill-wave"></i>
              </button>
              <button 
                @click.stop="$emit('enviar-recordatorio', membresia)" 
                class="btn btn-sm btn-outline-success"
                :disabled="(membresia.estado !== 'activa' && membresia.estado !== 'vencida') || !membresia.cliente?.whatsapp"
                title="Enviar recordatorio"
              >
                <i class="fa-brands fa-whatsapp"></i>
              </button>
              <button 
                v-if="membresia.estado === 'activa' || membresia.estado === 'vencida'"
                @click.stop="$emit('cancelar', membresia.id)" 
                class="btn btn-sm btn-outline-danger"
                title="Cancelar"
              >
                <i class="fa-solid fa-ban"></i>
              </button>
              <button 
                v-if="membresia.estado === 'cancelada'"
                @click.stop="$emit('reactivar', membresia)" 
                class="btn btn-sm btn-outline-success"
                title="Reactivar"
              >
                <i class="fa-solid fa-check-circle"></i>
              </button>
              <button 
                @click.stop="$emit('editar-fechas', membresia)" 
                class="btn btn-sm btn-outline-primary"
                title="Editar fechas"
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
                v-if="isSuperadmin"
                @click.stop="$emit('eliminar', membresia)" 
                class="btn btn-sm btn-outline-danger"
                title="Eliminar"
              >
                <i class="fa-solid fa-trash"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Membresia } from '@/types/gym';
import { formatFecha } from '@/utils/dateFormatter';

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

const getEstadoBadgeClass = (estado: string) => {
  const clases: Record<string, string> = {
    activa: 'bg-success',
    vencida: 'bg-danger',
    cancelada: 'bg-secondary'
  };
  return clases[estado] || 'bg-secondary';
};

const normalizarFecha = (fecha: any): string | null => {
  if (!fecha) return null;
  try {
    if (typeof fecha === 'string') {
      const fechaStr = fecha.trim();
      if (fechaStr.includes('T')) return fechaStr.split('T')[0];
      if (fechaStr.includes(' ')) return fechaStr.split(' ')[0];
      if (/^\d{4}-\d{2}-\d{2}$/.test(fechaStr)) return fechaStr;
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
  if (!fechaVencimientoStr) return 'text-muted';
  const hoyDate = new Date(hoyStr + 'T00:00:00');
  const vencimientoDate = new Date(fechaVencimientoStr + 'T00:00:00');
  const diffTime = vencimientoDate.getTime() - hoyDate.getTime();
  const diasRestantes = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  if (diasRestantes < 0) return 'text-danger fw-bold';
  if (diasRestantes >= 0 && diasRestantes <= 7) return 'text-warning fw-bold';
  return 'text-muted';
};

const getCardClass = (membresia: Membresia) => {
  if (membresia.estado === 'vencida') return 'border-danger';
  if (membresia.estado === 'cancelada') return 'border-secondary';
  const hoyStr = new Date().toISOString().split('T')[0];
  const fechaVencimientoStr = normalizarFecha(membresia.fecha_vencimiento);
  if (!fechaVencimientoStr) return '';
  const hoyDate = new Date(hoyStr + 'T00:00:00');
  const vencimientoDate = new Date(fechaVencimientoStr + 'T00:00:00');
  const diasRestantes = Math.ceil((vencimientoDate.getTime() - hoyDate.getTime()) / (1000 * 60 * 60 * 24));
  if (diasRestantes <= 7 && diasRestantes >= 0) return 'border-warning';
  return '';
};
</script>

<style scoped>
.card {
  transition: transform 0.2s, box-shadow 0.2s;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1) !important;
}
</style>
