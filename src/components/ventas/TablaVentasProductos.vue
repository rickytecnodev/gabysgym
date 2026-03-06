<template>
  <div class="table-responsive">
    <table class="table table-hover">
      <thead>
        <tr>
          <th>Fecha</th>
          <th>Cliente</th>
          <th>Total</th>
          <th>Estado</th>
          <th>Empleado</th>
          <th v-if="isSuperadmin && !filtroSucursal">Sucursal</th>
        </tr>
      </thead>
      <tbody>
        <tr 
          v-for="venta in ventas" 
          :key="'venta-' + venta.id"
          @click="$emit('ver-detalle', venta)"
          style="cursor: pointer;"
        >
          <td>{{ formatFecha(venta.fecha_venta) }}</td>
          <td>{{ venta.cliente?.nombre_completo || 'Cliente general' }}</td>
          <td class="fw-bold">${{ venta.total.toFixed(2) }}</td>
          <td>
            <span :class="getEstadoBadgeClass(venta.estado_pago)">
              {{ venta.estado_pago }}
            </span>
          </td>
          <td>{{ venta.empleado?.nombre_completo }}</td>
          <td v-if="isSuperadmin && !filtroSucursal">
            {{ (venta.sucursal as any)?.nombre || 'N/A' }}
          </td>
        </tr>
        <tr v-if="loading">
          <td :colspan="isSuperadmin && !filtroSucursal ? 6 : 5" class="text-center py-4">
            <div class="spinner-border spinner-border-sm text-primary me-2" role="status">
              <span class="visually-hidden">Cargando...</span>
            </div>
            Cargando ventas...
          </td>
        </tr>
        <tr v-else-if="ventas.length === 0">
          <td :colspan="isSuperadmin && !filtroSucursal ? 6 : 5" class="text-center text-muted">No hay ventas de productos</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import type { Venta } from '@/types/gym';

defineProps<{
  ventas: Venta[];
  isSuperadmin: boolean;
  filtroSucursal: number | null;
  loading?: boolean;
}>();

defineEmits<{
  'ver-detalle': [venta: Venta];
}>();

const formatFecha = (fecha: string) => {
  return new Date(fecha).toLocaleDateString('es-MX');
};

const getEstadoBadgeClass = (estado: string) => {
  const clases: Record<string, string> = {
    pagado: 'badge bg-success',
    pendiente: 'badge bg-warning',
    cancelado: 'badge bg-danger'
  };
  return clases[estado] || 'badge bg-secondary';
};
</script>
