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
    <div v-else class="gy-2">
      <div v-for="membresia in membresias" :key="membresia.id" @click="$emit('ver-detalle', membresia)">
        <div :class="['p-3 rounded-3 border bg-white mb-2 shadow borde-izq-tarjeta', getCardClass(membresia)]" style="cursor: pointer;">
          <div class="d-flex justify-content-between align-items-start">
            <div class="flex-grow-1">
              <h6 class="card-title mb-1 fw-bold">{{ membresia.cliente?.nombre_completo }}</h6>
              <span class="small text-muted" v-if="membresia.cliente?.telefono">
                <i class="fa-solid fa-phone me-1"></i>
                {{ membresia.cliente.telefono }}
              </span>
            </div>
            <div class="d-flex">
              <span :class="getEstadoBadgeClass(membresia.estado)" class="badge">
                {{ membresia.estado }}
              </span>
            </div>
          </div>
          <div class="d-flex justify-content-between align-items-start">
            <div class="flex-grow-1">
              <div class="small text-muted">Tipo</div>
              <div class="fw-bold">
                {{ membresia.tipo_membresia?.nombre || 'Personalizada' }}
                <span v-if="!membresia.tipo_membresia" class="badge bg-info ms-1">Promo</span>
              </div>
            </div>
            <div class="text-end">
              <div class="small text-muted">Vence</div>
              <div class="fw-bold" :class="getVencimientoClass(membresia.fecha_vencimiento)">
                {{ formatFecha(membresia.fecha_vencimiento) }}
              </div>
            </div>
          </div>
          <div class="mt-2 pt-2 border-top d-flex justify-content-between align-items-center flex-wrap gap-1"
            @click.stop>
            <div class="d-flex flex-wrap gap-1">
              <button @click.stop="$emit('registrar-pago', membresia)" class="btn btn-sm btn-outline-success"
                :disabled="membresia.estado === 'cancelada'" title="Registrar pago">
                <i class="fa-solid fa-money-bill-wave"></i>
              </button>
              <button @click.stop="$emit('enviar-recordatorio', membresia)" class="btn btn-sm btn-outline-success"
                :disabled="(membresia.estado !== 'activa' && membresia.estado !== 'vencida') || !membresia.cliente?.whatsapp"
                title="Enviar recordatorio">
                <i class="fa-brands fa-whatsapp"></i>
              </button>
              <button v-if="membresia.estado === 'activa' || membresia.estado === 'vencida'"
                @click.stop="$emit('cancelar', membresia.id)" class="btn btn-sm btn-outline-danger" title="Cancelar">
                <i class="fa-solid fa-ban"></i>
              </button>
              <button v-if="membresia.estado === 'cancelada'" @click.stop="$emit('reactivar', membresia)"
                class="btn btn-sm btn-outline-success" title="Reactivar">
                <i class="fa-solid fa-check-circle"></i>
              </button>
              <button @click.stop="$emit('editar-fechas', membresia)" class="btn btn-sm btn-outline-primary"
                title="Editar fechas">
                <i class="fa-solid fa-calendar-days"></i>
              </button>
              <button @click.stop="$emit('editar-cliente', membresia.cliente!)" class="btn btn-sm btn-outline-primary"
                title="Editar cliente" :disabled="!membresia.cliente">
                <i class="fa-solid fa-user-edit"></i>
              </button>
              <button v-if="isSuperadmin" @click.stop="$emit('eliminar', membresia)"
                class="btn btn-sm btn-outline-danger" title="Eliminar">
                <i class="fa-solid fa-trash"></i>
              </button>
            </div>
            <span v-if="isSuperadmin && !filtroSucursal && membresia.sucursal" class="small text-muted">
              <i class="fa-solid fa-building me-1"></i>
              {{ (membresia.sucursal as any)?.nombre }}
            </span>
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
  if (membresia.estado === 'vencida') return 'borde-izq-rojo';
  if (membresia.estado === 'cancelada') return 'borde-izq-gris';
  const hoyStr = new Date().toISOString().split('T')[0];
  const fechaVencimientoStr = normalizarFecha(membresia.fecha_vencimiento);
  if (!fechaVencimientoStr) return 'borde-izq-verde';
  const hoyDate = new Date(hoyStr + 'T00:00:00');
  const vencimientoDate = new Date(fechaVencimientoStr + 'T00:00:00');
  const diasRestantes = Math.ceil((vencimientoDate.getTime() - hoyDate.getTime()) / (1000 * 60 * 60 * 24));
  if (diasRestantes <= 7 && diasRestantes >= 0) return 'borde-izq-amarillo';
  return 'borde-izq-verde';
};
</script>

<style scoped>
.borde-izq-tarjeta {
  border-left-width: 5px !important;
  border-left-style: solid !important;
  transition: transform 0.2s, box-shadow 0.2s;
}

.borde-izq-verde {
  border-left-color: var(--bs-success) !important;
}

.borde-izq-rojo {
  border-left-color: var(--bs-danger) !important;
}

.borde-izq-amarillo {
  border-left-color: var(--bs-warning) !important;
}

.borde-izq-gris {
  border-left-color: var(--bs-secondary) !important;
}

.borde-izq-tarjeta:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1) !important;
}
</style>
