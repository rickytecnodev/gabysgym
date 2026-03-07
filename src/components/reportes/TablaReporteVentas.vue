<template>
  <div class="p-3 rounded-3 border bg-white">
    <h5 class="mb-3">Reporte de Ventas</h5>
    <div v-if="loading" class="text-center py-4">
      <div class="spinner-border spinner-border-sm text-primary me-2" role="status">
        <span class="visually-hidden">Cargando...</span>
      </div>
      Cargando reportes...
    </div>
    <div v-else-if="reporteVentas.length > 0" class="table-responsive">
      <table class="table table-hover mb-0">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Cantidad de Ventas</th>
            <th>Ventas Productos</th>
            <th>Pagos Membresías</th>
            <th>Total</th>
            <th v-if="isSuperadmin && !filtroSucursalId">Sucursal</th>
            <th v-if="filtroEmpleadoId">Empleado</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in reporteVentas" :key="index">
            <td>{{ formatFecha(item.fecha) }}</td>
            <td>{{ item.cantidad_ventas }}</td>
            <td class="text-primary fw-bold">{{ item.cantidad_ventas_productos }}</td>
            <td class="text-success fw-bold">{{ item.cantidad_ventas_membresias }}</td>
            <td class="fw-bold">${{ item.total.toFixed(2) }}</td>
            <td v-if="isSuperadmin && !filtroSucursalId">{{ item.sucursal_nombre || 'N/A' }}</td>
            <td v-if="filtroEmpleadoId">{{ item.empleado_nombre || 'N/A' }}</td>
          </tr>
        </tbody>
        <tfoot>
          <tr class="table-primary">
            <th>Total General</th>
            <th>{{ totalVentas }}</th>
            <th class="text-primary">{{ totalVentasProductos }}</th>
            <th class="text-success">{{ totalPagosMembresias }}</th>
            <th>${{ totalMontoVentas.toFixed(2) }}</th>
            <th v-if="isSuperadmin && !filtroSucursalId"></th>
            <th v-if="filtroEmpleadoId"></th>
          </tr>
        </tfoot>
      </table>
    </div>
    <p v-else class="text-muted mb-0">No hay datos para mostrar</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { formatFecha } from '@/utils/dateFormatter';

interface ReporteVenta {
  fecha: string;
  cantidad_ventas: number;
  cantidad_ventas_productos: number;
  cantidad_ventas_membresias: number;
  total: number;
  sucursal_nombre?: string;
  empleado_nombre?: string;
}

const props = defineProps<{
  reporteVentas: ReporteVenta[];
  isSuperadmin: boolean;
  filtroSucursalId: number | null;
  filtroEmpleadoId: number | null;
  loading?: boolean;
}>();

const totalVentas = computed(() => {
  return props.reporteVentas.reduce((sum, item) => sum + item.cantidad_ventas, 0);
});

const totalMontoVentas = computed(() => {
  return props.reporteVentas.reduce((sum, item) => sum + item.total, 0);
});

const totalVentasProductos = computed(() => {
  return props.reporteVentas.reduce((sum, item) => sum + item.cantidad_ventas_productos, 0);
});

const totalPagosMembresias = computed(() => {
  return props.reporteVentas.reduce((sum, item) => sum + item.cantidad_ventas_membresias, 0);
});
</script>
