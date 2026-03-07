<template>
  <div class="bg-light min-vh-100">
    <div class="container-fluid py-2">
      <div class="mb-3">
        <h1 class="h3 mb-0">Reportes</h1>
      </div>

      <!-- Filtros -->
      <FiltrosReportes :periodo-activo="periodoActivo" :filtro-sucursal-id="filtroSucursalId"
        :filtro-empleado-id="filtroEmpleadoId" :filtro-fecha-desde="filtroFechaDesde"
        :filtro-fecha-hasta="filtroFechaHasta" :sucursales="sucursales" :empleados-filtrados="empleadosFiltrados"
        :is-superadmin="isSuperadmin" @aplicar-periodo="aplicarPeriodo" @limpiar-periodo="limpiarPeriodo"
        @update:filtroSucursalId="filtroSucursalId = $event" @update:filtroEmpleadoId="filtroEmpleadoId = $event"
        @update:filtroFechaDesde="filtroFechaDesde = $event; recargarReportes()"
        @update:filtroFechaHasta="filtroFechaHasta = $event; recargarReportes()" />

      <!-- Reporte de Ventas (Desktop) -->
      <div class="d-none d-md-block mb-2">
        <TablaReporteVentas :reporte-ventas="reporteVentas" :is-superadmin="isSuperadmin"
          :filtro-sucursal-id="filtroSucursalId" :filtro-empleado-id="filtroEmpleadoId"
          :loading="loadingDataReportes" />
      </div>

      <!-- Vista móvil de reporte de ventas (Mobile) -->
      <div class="d-block d-md-none mb-2">
        <TablaReporteVentasMobile :reporte-ventas="reporteVentas" :is-superadmin="isSuperadmin"
          :filtro-sucursal-id="filtroSucursalId" :filtro-empleado-id="filtroEmpleadoId"
          :loading="loadingDataReportes" />
      </div>

      <!-- Reporte de Membresías -->
      <TarjetasReporteMembresias :reporte-membresias="reporteMembresias" :loading="loadingDataReportes" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useAuth } from '@/composables/useAuth';
import { useReportes } from '@/composables/useReportes';
import FiltrosReportes from '@/components/reportes/FiltrosReportes.vue';
import TablaReporteVentas from '@/components/reportes/TablaReporteVentas.vue';
import TablaReporteVentasMobile from '@/components/reportes/TablaReporteVentasMobile.vue';
import TarjetasReporteMembresias from '@/components/reportes/TarjetasReporteMembresias.vue';

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

const empleadosFiltrados = computed(() => {
  if (!isSuperadmin.value || !filtroSucursalId.value) {
    return empleados.value;
  }
  return empleados.value.filter(e => e.sucursal_id === filtroSucursalId.value);
});

const recargarReportes = () => {
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
  filtroFechaDesde.value = '';
  filtroFechaHasta.value = '';

  const sucursalId = isSuperadmin.value
    ? (filtroSucursalId.value || null)
    : currentSucursalId.value;

  cargarReportes(
    '',
    '',
    sucursalId,
    filtroEmpleadoId.value || undefined
  );
};

// Las funciones cargarEmpleados y cargarReportes ahora vienen del composable

</script>
