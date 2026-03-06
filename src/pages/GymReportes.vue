<template>
  <div class="bg-light min-vh-100">
    <GymNavbar />
    <div class="container-fluid py-4">
      <h1 class="h3 mb-4">Reportes</h1>

      <!-- Filtros -->
      <FiltrosReportes
        :periodo-activo="periodoActivo"
        :filtro-sucursal-id="filtroSucursalId"
        :filtro-empleado-id="filtroEmpleadoId"
        :filtro-fecha-desde="filtroFechaDesde"
        :filtro-fecha-hasta="filtroFechaHasta"
        :sucursales="sucursales"
        :empleados-filtrados="empleadosFiltrados"
        :is-superadmin="isSuperadmin"
        @aplicar-periodo="aplicarPeriodo"
        @limpiar-periodo="limpiarPeriodo"
        @update:filtroSucursalId="filtroSucursalId = $event"
        @update:filtroEmpleadoId="filtroEmpleadoId = $event"
        @update:filtroFechaDesde="filtroFechaDesde = $event; recargarReportes()"
        @update:filtroFechaHasta="filtroFechaHasta = $event; recargarReportes()"
      />

      <!-- Reporte de Ventas -->
      <div class="card mb-4">
        <div class="card-header">
          <h5 class="mb-0">Reporte de Ventas</h5>
        </div>
        <div class="card-body">
          <div v-if="loadingDataReportes" class="text-center py-4">
            <div class="spinner-border spinner-border-sm text-primary me-2" role="status">
              <span class="visually-hidden">Cargando...</span>
            </div>
            Cargando reportes...
          </div>
          <div v-else-if="reporteVentas.length > 0" class="table-responsive">
            <table class="table table-hover">
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
      </div>

      <!-- Reporte de Membresías -->
      <div class="card">
        <div class="card-header">
          <h5 class="mb-0">Estado de Membresías</h5>
        </div>
        <div class="card-body">
          <div v-if="loadingDataReportes" class="text-center py-4">
            <div class="spinner-border spinner-border-sm text-primary me-2" role="status">
              <span class="visually-hidden">Cargando...</span>
            </div>
            Cargando reportes...
          </div>
          <div v-else-if="reporteMembresias" class="row g-3">
            <div class="col-md-3">
              <div class="card border-success">
                <div class="card-body text-center">
                  <h3 class="text-success">{{ reporteMembresias.total_activas }}</h3>
                  <p class="mb-0 text-muted">Membresías Activas</p>
                </div>
              </div>
            </div>
            <div class="col-md-3">
              <div class="card border-danger">
                <div class="card-body text-center">
                  <h3 class="text-danger">{{ reporteMembresias.total_vencidas }}</h3>
                  <p class="mb-0 text-muted">Membresías Vencidas</p>
                </div>
              </div>
            </div>
            <div class="col-md-3">
              <div class="card border-secondary">
                <div class="card-body text-center">
                  <h3 class="text-secondary">{{ reporteMembresias.total_canceladas }}</h3>
                  <p class="mb-0 text-muted">Membresías Canceladas</p>
                </div>
              </div>
            </div>
            <div class="col-md-3">
              <div class="card border-warning">
                <div class="card-body text-center">
                  <h3 class="text-warning">{{ reporteMembresias.por_vencer_7_dias }}</h3>
                  <p class="mb-0 text-muted">Por Vencer (7 días)</p>
                </div>
              </div>
            </div>
          </div>
          <p v-else class="text-muted mb-0">Cargando datos...</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useAuth } from '@/composables/useAuth';
import { useReportes } from '@/composables/useReportes';
import GymNavbar from '@/components/GymNavbar.vue';
import FiltrosReportes from '@/components/reportes/FiltrosReportes.vue';
import { formatFecha } from '@/utils/dateFormatter';

const { currentSucursalId, isSuperadmin } = useAuth();
const {
  reporteVentas,
  reporteMembresias,
  empleados,
  sucursales,
  loadingData: loadingDataReportes,
  loadSucursales,
  cargarEmpleados,
  cargarReportes
} = useReportes();

const filtroFechaDesde = ref('');
const filtroFechaHasta = ref('');
const filtroEmpleadoId = ref<number | null>(null);
const filtroSucursalId = ref<number | null>(null);
const periodoActivo = ref<string>('');

const totalVentas = computed(() => {
  return reporteVentas.value.reduce((sum, item) => sum + item.cantidad_ventas, 0);
});

const totalMontoVentas = computed(() => {
  return reporteVentas.value.reduce((sum, item) => sum + item.total, 0);
});

const totalVentasProductos = computed(() => {
  return reporteVentas.value.reduce((sum, item) => sum + item.cantidad_ventas_productos, 0);
});

const totalPagosMembresias = computed(() => {
  return reporteVentas.value.reduce((sum, item) => sum + item.cantidad_ventas_membresias, 0);
});

const empleadosFiltrados = computed(() => {
  if (!isSuperadmin.value || !filtroSucursalId.value) {
    return empleados.value;
  }
  return empleados.value.filter(e => e.sucursal_id === filtroSucursalId.value);
});

const recargarReportes = () => {
  if (filtroFechaDesde.value && filtroFechaHasta.value) {
    const sucursalId = isSuperadmin.value 
      ? (filtroSucursalId.value || null)
      : currentSucursalId.value;
    
    cargarReportes(
      filtroFechaDesde.value,
      filtroFechaHasta.value,
      sucursalId,
      filtroEmpleadoId.value || undefined
    );
  }
};

watch([filtroFechaDesde, filtroFechaHasta, filtroEmpleadoId, filtroSucursalId], () => {
  recargarReportes();
}, { immediate: false });

watch(filtroSucursalId, () => {
  if (isSuperadmin.value) {
    cargarEmpleados(filtroSucursalId.value || undefined);
    filtroEmpleadoId.value = null;
    // Recargar reportes después de cambiar sucursal y resetear empleado
    recargarReportes();
  }
});

onMounted(async () => {
  periodoActivo.value = 'hoy';
  const fechas = calcularFechasPeriodo('hoy');
  
  if (fechas.desde && fechas.hasta) {
    filtroFechaDesde.value = fechas.desde;
    filtroFechaHasta.value = fechas.hasta;
  }
  
  if (isSuperadmin.value) {
    await loadSucursales();
  }
  
  await cargarEmpleados();
  
  const sucursalId = isSuperadmin.value 
    ? (filtroSucursalId.value || null)
    : currentSucursalId.value;
  
  await cargarReportes(
    filtroFechaDesde.value,
    filtroFechaHasta.value,
    sucursalId,
    filtroEmpleadoId.value || undefined
  );
});

const calcularFechasPeriodo = (periodo: string) => {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  
  let desde: Date;
  let hasta: Date = new Date(hoy);
  hasta.setHours(23, 59, 59, 999);
  
  switch (periodo) {
    case 'hoy':
      desde = new Date(hoy);
      break;
    case 'semana':
      desde = new Date(hoy);
      desde.setDate(hoy.getDate() - hoy.getDay()); // Lunes de esta semana
      break;
    case 'mes':
      desde = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
      hasta = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0, 23, 59, 59, 999);
      break;
    case 'año':
      desde = new Date(hoy.getFullYear(), 0, 1);
      hasta = new Date(hoy.getFullYear(), 11, 31, 23, 59, 59, 999);
      break;
    default:
      return { desde: null, hasta: null };
  }
  
  return {
    desde: desde.toISOString().split('T')[0],
    hasta: hasta.toISOString().split('T')[0]
  };
};

const aplicarPeriodo = (periodo: string) => {
  periodoActivo.value = periodo;
  const fechas = calcularFechasPeriodo(periodo);
  
  if (fechas.desde && fechas.hasta) {
    filtroFechaDesde.value = fechas.desde;
    filtroFechaHasta.value = fechas.hasta;
    
    const sucursalId = isSuperadmin.value 
      ? (filtroSucursalId.value || null)
      : currentSucursalId.value;
    
    cargarReportes(
      filtroFechaDesde.value,
      filtroFechaHasta.value,
      sucursalId,
      filtroEmpleadoId.value || undefined
    );
  }
};

const limpiarPeriodo = () => {
  periodoActivo.value = '';
  const hoy = new Date();
  filtroFechaDesde.value = hoy.toISOString().split('T')[0];
  filtroFechaHasta.value = hoy.toISOString().split('T')[0];
  
  const sucursalId = isSuperadmin.value 
    ? (filtroSucursalId.value || null)
    : currentSucursalId.value;
  
  cargarReportes(
    filtroFechaDesde.value,
    filtroFechaHasta.value,
    sucursalId,
    filtroEmpleadoId.value || undefined
  );
};

// Las funciones cargarEmpleados y cargarReportes ahora vienen del composable

</script>

