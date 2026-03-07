<template>
  <div>
    <div v-if="loading" class="text-center py-4">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Cargando...</span>
      </div>
    </div>
    <div v-else-if="ventas.length === 0" class="text-center text-muted py-4">
      No hay ventas de productos
    </div>
    <div v-else class="gy-2">
      <div v-for="venta in ventas" :key="'venta-' + venta.id" @click="$emit('ver-detalle', venta)">
        <div :class="['p-3 rounded-3 border bg-white mb-2 borde-izq-tarjeta', getBordeIzqClass(venta.estado_pago)]" style="cursor: pointer;">
          <div class="d-flex justify-content-between align-items-start">
            <div class="flex-grow-1">
              <h6 class="card-title mb-1 fw-bold">{{ venta.cliente?.nombre_completo || 'Cliente general' }}</h6>
              <span class="small text-muted">
                <i class="fa-solid fa-calendar me-1"></i>
                {{ formatFecha(venta.fecha_venta) }}
              </span>
            </div>
            <div class="d-flex">
              <span :class="getEstadoBadgeClass(venta.estado_pago)" class="badge">
                {{ venta.estado_pago }}
              </span>
            </div>
          </div>
          <div class="d-flex justify-content-between align-items-start">
            <div class="flex-grow-1">
              <div class="small text-muted">Total</div>
              <div class="fw-bold text-primary">${{ venta.total.toFixed(2) }}</div>
            </div>
            <div class="text-end">
              <div class="small text-muted">Empleado</div>
              <div class="fw-bold">{{ venta.empleado?.nombre_completo || '—' }}</div>
            </div>
          </div>
          <div class="mt-2 pt-2 border-top d-flex justify-content-between align-items-center" @click.stop>
            <div class="d-flex gap-1">
              <button @click.stop="$emit('editar', venta)" class="btn btn-sm btn-outline-primary" title="Editar">
                <i class="fa-solid fa-edit"></i>
              </button>
              <button
                v-if="isSuperadmin"
                @click.stop="$emit('eliminar', venta)"
                class="btn btn-sm btn-outline-danger"
                title="Eliminar"
              >
                <i class="fa-solid fa-trash"></i>
              </button>
            </div>
            <span v-if="isSuperadmin && !filtroSucursal && venta.sucursal" class="small text-muted">
              <i class="fa-solid fa-building me-1"></i>
              {{ (venta.sucursal as any)?.nombre }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Venta } from '@/types/gym';
import { formatFecha } from '@/utils/dateFormatter';

defineProps<{
  ventas: Venta[];
  isSuperadmin: boolean;
  filtroSucursal: number | null;
  loading?: boolean;
}>();

defineEmits<{
  'ver-detalle': [venta: Venta];
  'editar': [venta: Venta];
  'eliminar': [venta: Venta];
}>();

const getEstadoBadgeClass = (estado: string) => {
  const clases: Record<string, string> = {
    pagado: 'bg-success',
    pendiente: 'bg-warning',
    cancelado: 'bg-danger'
  };
  return clases[estado] || 'bg-secondary';
};

const getBordeIzqClass = (estadoPago: string) => {
  if (estadoPago === 'pagado') return 'borde-izq-verde';
  if (estadoPago === 'pendiente') return 'borde-izq-amarillo';
  if (estadoPago === 'cancelado') return 'borde-izq-gris';
  return 'borde-izq-gris';
};
</script>

<style scoped>
.borde-izq-tarjeta {
  border-left-width: 5px !important;
  border-left-style: solid !important;
  transition: transform 0.2s, box-shadow 0.2s;
}

.borde-izq-verde { border-left-color: var(--bs-success) !important; }
.borde-izq-amarillo { border-left-color: var(--bs-warning) !important; }
.borde-izq-gris { border-left-color: var(--bs-secondary) !important; }

.borde-izq-tarjeta:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1) !important;
}
</style>
