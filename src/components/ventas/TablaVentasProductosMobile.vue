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
    <div v-else class="row g-3">
      <div v-for="venta in ventas" :key="'venta-' + venta.id" class="col-12">
        <div 
          class="card h-100 shadow-sm" 
          @click="$emit('ver-detalle', venta)"
          style="cursor: pointer;"
        >
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start mb-2">
              <div class="flex-grow-1">
                <h6 class="card-title mb-1 fw-bold">
                  {{ venta.cliente?.nombre_completo || 'Cliente general' }}
                </h6>
                <div class="small text-muted">
                  <i class="fa-solid fa-calendar me-1"></i>
                  {{ formatFecha(venta.fecha_venta) }}
                </div>
              </div>
              <span :class="getEstadoBadgeClass(venta.estado_pago)" class="badge">
                {{ venta.estado_pago }}
              </span>
            </div>
            <div class="mb-2">
              <div class="fw-bold fs-5 text-primary">
                ${{ venta.total.toFixed(2) }}
              </div>
              <div class="small text-muted mt-1">
                <i class="fa-solid fa-user me-1"></i>
                {{ venta.empleado?.nombre_completo }}
              </div>
              <div v-if="isSuperadmin && !filtroSucursal && venta.sucursal" class="small text-muted mt-1">
                <i class="fa-solid fa-building me-1"></i>
                {{ (venta.sucursal as any)?.nombre }}
              </div>
            </div>
            <div class="d-flex gap-1 mt-2 pt-2 border-top" @click.stop>
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
