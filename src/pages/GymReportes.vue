<template>
  <div class="bg-light min-vh-100">
    <GymNavbar />
    <div class="container-fluid py-4">
      <h1 class="h3 mb-4">Reportes</h1>

      <!-- Filtros -->
      <div class="card mb-4">
        <div class="card-body">
          <!-- Botones de filtro rápido -->
          <div class="mb-3">
            <label class="form-label fw-bold">Filtro Rápido:</label>
            <div class="btn-group" role="group">
              <button 
                type="button" 
                class="btn btn-sm"
                :class="periodoActivo === 'hoy' ? 'btn-primary' : 'btn-outline-primary'"
                @click="aplicarPeriodo('hoy')"
              >
                Hoy
              </button>
              <button 
                type="button" 
                class="btn btn-sm"
                :class="periodoActivo === 'semana' ? 'btn-primary' : 'btn-outline-primary'"
                @click="aplicarPeriodo('semana')"
              >
                Semana Actual
              </button>
              <button 
                type="button" 
                class="btn btn-sm"
                :class="periodoActivo === 'mes' ? 'btn-primary' : 'btn-outline-primary'"
                @click="aplicarPeriodo('mes')"
              >
                Mes Actual
              </button>
              <button 
                type="button" 
                class="btn btn-sm"
                :class="periodoActivo === 'año' ? 'btn-primary' : 'btn-outline-primary'"
                @click="aplicarPeriodo('año')"
              >
                Año Actual
              </button>
              <button 
                type="button" 
                class="btn btn-sm btn-outline-secondary"
                @click="limpiarPeriodo"
                v-if="periodoActivo"
              >
                Limpiar
              </button>
            </div>
          </div>
          <div class="row g-3">
            <div class="col-md-3" v-if="isSuperadmin">
              <label class="form-label">Sucursal</label>
              <select v-model="filtroSucursalId" class="form-select">
                <option value="">Todas</option>
                <option v-for="sucursal in sucursales" :key="sucursal.id" :value="sucursal.id">
                  {{ sucursal.nombre }}
                </option>
              </select>
            </div>
            <div class="col-md-3" v-if="isSuperadmin">
              <label class="form-label">Empleado</label>
              <select v-model="filtroEmpleadoId" class="form-select">
                <option value="">Todos</option>
                <option v-for="empleado in empleadosFiltrados" :key="empleado.id" :value="empleado.id">
                  {{ empleado.nombre_completo }}
                </option>
              </select>
            </div>
            <div class="col-md-3">
              <label class="form-label">Fecha Desde</label>
              <input v-model="filtroFechaDesde" type="date" class="form-control" :disabled="!!periodoActivo">
            </div>
            <div class="col-md-3">
              <label class="form-label">Fecha Hasta</label>
              <input v-model="filtroFechaHasta" type="date" class="form-control" :disabled="!!periodoActivo">
            </div>
          </div>
        </div>
      </div>

      <!-- Reporte de Ventas -->
      <div class="card mb-4">
        <div class="card-header">
          <h5 class="mb-0">Reporte de Ventas</h5>
        </div>
        <div class="card-body">
          <div v-if="reporteVentas.length > 0" class="table-responsive">
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
          <div v-if="reporteMembresias" class="row g-3">
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
import { getReporteVentas, getReporteMembresias, fetchSucursales } from '@/services/gymApi';
import { useAuth } from '@/composables/useAuth';
import type { ReporteVentas, ReporteMembresias, Empleado, Sucursal } from '@/types/gym';
import { supabase } from '@/utils/supabase';
import GymNavbar from '@/components/GymNavbar.vue';

const { currentSucursalId, isSuperadmin } = useAuth();

const reporteVentas = ref<ReporteVentas[]>([]);
const reporteMembresias = ref<ReporteMembresias | null>(null);
const empleados = ref<Empleado[]>([]);
const sucursales = ref<Sucursal[]>([]);
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

// Watchers para hacer los filtros reactivos
watch([filtroFechaDesde, filtroFechaHasta, filtroEmpleadoId, filtroSucursalId], () => {
  // Solo cargar si ambas fechas están establecidas
  if (filtroFechaDesde.value && filtroFechaHasta.value) {
    cargarReportes();
  }
}, { immediate: false });

// Watcher para recargar empleados cuando cambia la sucursal
watch(filtroSucursalId, () => {
  if (isSuperadmin.value) {
    cargarEmpleados();
    // Limpiar filtro de empleado si cambia la sucursal
    filtroEmpleadoId.value = null;
  }
});

onMounted(async () => {
  // Establecer período activo como "hoy" por defecto usando la misma función
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
  // Cargar reportes después de establecer las fechas
  await cargarReportes();
});

const loadSucursales = async () => {
  const { data } = await fetchSucursales();
  if (data) {
    sucursales.value = data;
  }
};

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
    // Actualizar las fechas - el watcher se encargará de recargar
    filtroFechaDesde.value = fechas.desde;
    filtroFechaHasta.value = fechas.hasta;
  }
};

const limpiarPeriodo = () => {
  periodoActivo.value = '';
  const hoy = new Date();
  // Establecer ambas fechas como hoy al limpiar
  filtroFechaDesde.value = hoy.toISOString().split('T')[0];
  filtroFechaHasta.value = hoy.toISOString().split('T')[0];
  // El watcher se encargará de llamar a cargarReportes automáticamente
};

const cargarEmpleados = async () => {
  if (!isSuperadmin.value) return;
  
  let query = supabase
    .from('empleados')
    .select('id, nombre_completo, sucursal_id')
    .eq('activo', true)
    .neq('rol', 'superadmin')
    .order('nombre_completo');
  
  // Si hay filtro de sucursal, filtrar por sucursal
  if (filtroSucursalId.value) {
    query = query.eq('sucursal_id', filtroSucursalId.value);
  }
  
  const { data } = await query;
  
  if (data) {
    empleados.value = data as Empleado[];
  }
};

const cargarReportes = async () => {
  // Usar siempre las fechas del filtro (ya están establecidas por el período o manualmente)
  const fechaDesde = filtroFechaDesde.value;
  const fechaHasta = filtroFechaHasta.value;
  
  if (!fechaDesde || !fechaHasta) {
    return;
  }

  // Determinar sucursal para el reporte
  const sucursalId = isSuperadmin.value 
    ? (filtroSucursalId.value || null)
    : currentSucursalId.value;
  
  // Cargar reporte de ventas (combinado)
  const { data: ventasData, error: reporteVentasError } = await getReporteVentas(
    fechaDesde,
    fechaHasta,
    sucursalId,
    filtroEmpleadoId.value || undefined
  );

  if (reporteVentasError) {
    console.error('Error al cargar reporte de ventas:', reporteVentasError);
  } else if (ventasData) {
    reporteVentas.value = ventasData;
  }

  // Cargar reporte de membresías (no depende de fechas, solo de sucursal)
  const { data: membresiasData, error: membresiasError } = await getReporteMembresias(
    sucursalId
  );

  if (membresiasError) {
    console.error('Error al cargar reporte de membresías:', membresiasError);
  } else if (membresiasData) {
    reporteMembresias.value = membresiasData;
  }
};

const formatFecha = (fecha: string) => {
  return new Date(fecha).toLocaleDateString('es-MX');
};
</script>

