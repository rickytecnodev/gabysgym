<template>
  <div class="p-3 rounded-3 border bg-white">
    <h5 class="mb-3">Reporte de Ventas</h5>
    <div v-if="loading" class="text-center py-4">
      <div class="spinner-border spinner-border-sm text-primary me-2" role="status">
        <span class="visually-hidden">Cargando...</span>
      </div>
      Cargando reportes...
    </div>
    <div v-else-if="reporteVentas.length > 0" class="gy-2">
      <div v-for="(item, index) in reporteVentas" :key="index" class="p-3 rounded-3 border bg-white mb-2 shadow-sm">
        <div class="d-flex justify-content-between align-items-start mb-2">
          <div>
            <h6 class="mb-1 fw-bold">{{ formatFecha(item.fecha) }}</h6>
            <div class="small text-muted">
              <i class="fa-solid fa-shopping-cart me-1"></i>
              {{ item.cantidad_ventas }} venta(s)
            </div>
          </div>
          <div class="text-end">
            <div class="fw-bold fs-5 text-primary">${{ item.total.toFixed(2) }}</div>
          </div>
        </div>
        <div class="row g-2 mt-2 pt-2 border-top">
          <div class="col-6">
            <div class="small text-muted">Ventas Productos</div>
            <div class="fw-bold text-primary">{{ item.cantidad_ventas_productos }}</div>
          </div>
          <div class="col-6">
            <div class="small text-muted">Pagos Membresías</div>
            <div class="fw-bold text-success">{{ item.cantidad_ventas_membresias }}</div>
          </div>
        </div>
        <div
          v-if="(isSuperadmin && !filtroSucursalId && item.sucursal_nombre) || (filtroEmpleadoId && item.empleado_nombre)"
          class="mt-2 pt-2 border-top">
          <div class="small text-muted">
            <div v-if="isSuperadmin && !filtroSucursalId && item.sucursal_nombre">
              <i class="fa-solid fa-building me-1"></i>
              {{ item.sucursal_nombre }}
            </div>
            <div v-if="filtroEmpleadoId && item.empleado_nombre" class="mt-1">
              <i class="fa-solid fa-user me-1"></i>
              {{ item.empleado_nombre }}
            </div>
          </div>
        </div>
      </div>

      <!-- Totales -->
      <div class="p-3 rounded-3 border mt-2 shadow-sm border-top" style="background-color: #eaf3fa;">
        <h6 class="fw-bold mb-3">Total General</h6>
        <div class="row g-2">
          <div class="col-6">
            <div class="small text-muted">Total Ventas</div>
            <div class="fw-bold">{{ totalVentas }}</div>
          </div>
          <div class="col-6">
            <div class="small text-muted">Monto Total</div>
            <div class="fw-bold text-primary">${{ totalMontoVentas.toFixed(2) }}</div>
          </div>
          <div class="col-6 mt-2">
            <div class="small text-muted">Ventas Productos</div>
            <div class="fw-bold text-primary">{{ totalVentasProductos }}</div>
          </div>
          <div class="col-6 mt-2">
            <div class="small text-muted">Pagos Membresías</div>
            <div class="fw-bold text-success">{{ totalPagosMembresias }}</div>
          </div>
        </div>
      </div>
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
