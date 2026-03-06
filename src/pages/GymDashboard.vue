<template>
  <div class="bg-light min-vh-100">
    <GymNavbar />
    <div v-if="loading" class="container-fluid py-4">
      <div class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Cargando...</span>
        </div>
        <p class="mt-3 text-muted">Cargando inicio...</p>
      </div>
    </div>
    <div v-else-if="error" class="container-fluid py-4">
      <div class="alert alert-danger" role="alert">
        <h4 class="alert-heading">Error</h4>
        <p>{{ error }}</p>
        <hr>
        <p class="mb-0">Por favor, verifica tu conexión y las variables de entorno.</p>
      </div>
    </div>
    <div v-else class="container-fluid py-4">
      <div class="mb-4">
        <h1 class="h3 mb-0">Inicio</h1>
      </div>

      <!-- Selector de sucursal (solo para superadmin) -->
      <div v-if="isSuperadmin" class="card mb-4">
        <div class="card-body">
          <div class="row align-items-end">
            <div class="col-md-4">
              <label class="form-label fw-bold">Filtrar por Sucursal:</label>
              <select 
                v-model="sucursalSeleccionada" 
                @change="loadStats" 
                class="form-select"
              >
                <option :value="null">Todas</option>
                <option v-for="sucursal in sucursales" :key="sucursal.id" :value="sucursal.id">
                  {{ sucursal.nombre }}
                </option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- Estadísticas rápidas -->
      <div class="row g-3 mb-4">
        <div class="col-md-3">
          <div 
            @click="stats.ventasHoy > 0 ? navegarAVentas('hoy') : null" 
            :class="['card border-0 shadow-sm h-100', stats.ventasHoy > 0 ? 'hover-card' : 'opacity-50']" 
            :style="stats.ventasHoy > 0 ? 'cursor: pointer;' : 'cursor: not-allowed;'"
          >
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <h6 class="text-muted mb-1">Ventas Hoy</h6>
                  <h3 class="mb-0">{{ stats.ventasHoy }}</h3>
                </div>
                <div class="text-primary">
                  <i class="fa-solid fa-shopping-cart fa-2x"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div 
            @click="stats.ventasPendientes > 0 ? navegarAVentas('hoy', 'pendiente') : null" 
            :class="['card border-0 shadow-sm h-100', stats.ventasPendientes > 0 ? 'hover-card' : 'opacity-50']" 
            :style="stats.ventasPendientes > 0 ? 'cursor: pointer;' : 'cursor: not-allowed;'"
          >
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <h6 class="text-muted mb-1">Ventas Pendientes</h6>
                  <h3 class="mb-0 text-warning">{{ stats.ventasPendientes }}</h3>
                </div>
                <div class="text-warning">
                  <i class="fa-solid fa-exclamation-circle fa-2x"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div 
            @click="stats.membresiasActivas > 0 ? navegarAMembresias({ estado: 'activa' }) : null" 
            :class="['card border-0 shadow-sm h-100', stats.membresiasActivas > 0 ? 'hover-card' : 'opacity-50']" 
            :style="stats.membresiasActivas > 0 ? 'cursor: pointer;' : 'cursor: not-allowed;'"
          >
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <h6 class="text-muted mb-1">Membresías Activas</h6>
                  <h3 class="mb-0">{{ stats.membresiasActivas }}</h3>
                </div>
                <div class="text-success">
                  <i class="fa-solid fa-users fa-2x"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div 
            @click="stats.membresiasPorVencer > 0 ? navegarAMembresiasPorVencer() : null" 
            :class="['card border-0 shadow-sm h-100', stats.membresiasPorVencer > 0 ? 'hover-card' : 'opacity-50']" 
            :style="stats.membresiasPorVencer > 0 ? 'cursor: pointer;' : 'cursor: not-allowed;'"
          >
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <h6 class="text-muted mb-1">Membresías por Vencer</h6>
                  <h3 class="mb-0 text-warning">{{ stats.membresiasPorVencer }}</h3>
                </div>
                <div class="text-warning">
                  <i class="fa-solid fa-clock fa-2x"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="row g-3 mb-4">
        <div class="col-md-3">
          <div 
            @click="stats.membresiasVencidas > 0 ? navegarAMembresias({ estado: 'vencida' }) : null" 
            :class="['card border-0 shadow-sm h-100', stats.membresiasVencidas > 0 ? 'hover-card' : 'opacity-50']" 
            :style="stats.membresiasVencidas > 0 ? 'cursor: pointer;' : 'cursor: not-allowed;'"
          >
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <h6 class="text-muted mb-1">Membresías Vencidas</h6>
                  <h3 class="mb-0 text-danger">{{ stats.membresiasVencidas }}</h3>
                </div>
                <div class="text-danger">
                  <i class="fa-solid fa-exclamation-triangle fa-2x"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <h6 class="text-muted mb-1">Total Clientes</h6>
                  <h3 class="mb-0">{{ stats.clientes }}</h3>
                </div>
                <div class="text-info">
                  <i class="fa-solid fa-user-group fa-2x"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div 
            @click="stats.bitacorasHoy > 0 ? navegarABitacoras() : null" 
            :class="['card border-0 shadow-sm h-100', stats.bitacorasHoy > 0 ? 'hover-card' : 'opacity-50']" 
            :style="stats.bitacorasHoy > 0 ? 'cursor: pointer;' : 'cursor: not-allowed;'"
          >
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <h6 class="text-muted mb-1">Bitácoras Hoy</h6>
                  <h3 class="mb-0">{{ stats.bitacorasHoy }}</h3>
                </div>
                <div class="text-info">
                  <i class="fa-solid fa-book fa-2x"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Navegación rápida -->
      <div class="row g-3">
        <div class="col-md-3">
          <router-link to="/gym/productos" class="text-decoration-none">
            <div class="card border-0 shadow-sm h-100">
              <div class="card-body text-center">
                <i class="fa-solid fa-box fa-3x text-primary mb-3"></i>
                <h5>Productos</h5>
                <p class="text-muted mb-0">Gestionar inventario</p>
              </div>
            </div>
          </router-link>
        </div>
        <div class="col-md-3">
          <router-link to="/gym/ventas" class="text-decoration-none">
            <div class="card border-0 shadow-sm h-100">
              <div class="card-body text-center">
                <i class="fa-solid fa-cash-register fa-3x text-success mb-3"></i>
                <h5>Ventas</h5>
                <p class="text-muted mb-0">Registrar y gestionar ventas</p>
              </div>
            </div>
          </router-link>
        </div>
        <div class="col-md-3">
          <router-link to="/gym/membresias" class="text-decoration-none">
            <div class="card border-0 shadow-sm h-100">
              <div class="card-body text-center">
                <i class="fa-solid fa-id-card fa-3x text-info mb-3"></i>
                <h5>Membresías</h5>
                <p class="text-muted mb-0">Gestionar membresías</p>
              </div>
            </div>
          </router-link>
        </div>
        <div class="col-md-3">
          <router-link to="/gym/clientes" class="text-decoration-none">
            <div class="card border-0 shadow-sm h-100">
              <div class="card-body text-center">
                <i class="fa-solid fa-user-group fa-3x text-info mb-3"></i>
                <h5>Clientes</h5>
                <p class="text-muted mb-0">Gestionar clientes</p>
              </div>
            </div>
          </router-link>
        </div>
        <div class="col-md-3">
          <router-link to="/gym/reportes" class="text-decoration-none">
            <div class="card border-0 shadow-sm h-100">
              <div class="card-body text-center">
                <i class="fa-solid fa-chart-bar fa-3x text-warning mb-3"></i>
                <h5>Reportes</h5>
                <p class="text-muted mb-0">Ver reportes y estadísticas</p>
              </div>
            </div>
          </router-link>
        </div>
        <div class="col-md-3">
          <router-link to="/gym/bitacoras" class="text-decoration-none">
            <div class="card border-0 shadow-sm h-100">
              <div class="card-body text-center">
                <i class="fa-solid fa-book fa-3x text-info mb-3"></i>
                <h5>Bitácoras</h5>
                <p class="text-muted mb-0">Bitácora del día</p>
              </div>
            </div>
          </router-link>
        </div>
        <div class="col-md-3" v-if="isSuperadmin">
          <router-link to="/gym/usuarios" class="text-decoration-none">
            <div class="card border-0 shadow-sm h-100">
              <div class="card-body text-center">
                <i class="fa-solid fa-user-gear fa-3x text-primary mb-3"></i>
                <h5>Usuarios</h5>
                <p class="text-muted mb-0">Gestionar usuarios</p>
              </div>
            </div>
          </router-link>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '@/composables/useAuth';
import { useGymFilters } from '@/composables/useGymFilters';
import { useBitacoras } from '@/composables/useBitacoras';
import { fetchVentas, fetchMembresias, fetchPagosMembresiaConFiltros, fetchClientes, fetchSucursales } from '@/services/gymApi';
import { getFechaActualLocal } from '@/utils/dateFormatter';
import type { Sucursal } from '@/types/gym';
import GymNavbar from '@/components/GymNavbar.vue';

const router = useRouter();
const { currentSucursalId, isSuperadmin, isAuthenticated, currentUser } = useAuth();
const { setFilters } = useGymFilters();
const { bitacoras: bitacorasData, loadBitacoras } = useBitacoras();

const sucursales = ref<Sucursal[]>([]);
const sucursalSeleccionada = ref<number | null>(null);

const stats = ref({
  ventasHoy: 0,
  membresiasActivas: 0,
  membresiasPorVencer: 0,
  membresiasVencidas: 0,
  ventasPendientes: 0,
  clientes: 0,
  bitacorasHoy: 0
});

const navegarAVentas = (periodo?: string, estado?: string) => {
  setFilters({
    periodo,
    estado
  });
  router.push('/gym/ventas');
};

const navegarAMembresias = (filters: { estado?: string; fechaDesde?: string; fechaHasta?: string }) => {
  setFilters(filters);
  router.push('/gym/membresias');
};

const navegarAMembresiasPorVencer = () => {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const en7Dias = new Date(hoy);
  en7Dias.setDate(en7Dias.getDate() + 7);
  
  setFilters({
    fechaDesde: hoy.toISOString().split('T')[0],
    fechaHasta: en7Dias.toISOString().split('T')[0],
    estado: 'activa'
  });
  router.push('/gym/membresias');
};

const navegarABitacoras = () => {
  router.push('/gym/bitacoras');
};

const loading = ref(true);
const error = ref<string | null>(null);


onMounted(async () => {
  try {
    loading.value = true;
    error.value = null;
    
    // Verificar autenticación
    if (!isAuthenticated.value) {
      error.value = 'No estás autenticado. Por favor, inicia sesión.';
      loading.value = false;
      return;
    }
    
    // Cargar sucursales si es superadmin
    if (isSuperadmin.value) {
      const { data } = await fetchSucursales();
      if (data) {
        sucursales.value = data;
      }
    }
    
    await loadStats();
    await loadBitacorasStats();
  } catch (err: any) {
    console.error('Error al cargar inicio:', err);
    error.value = err.message || 'Error al cargar el inicio';
  } finally {
    loading.value = false;
  }
});

const loadBitacorasStats = async () => {
  try {
    const hoy = getFechaActualLocal();
    // Determinar la sucursal a usar para filtrar
    const sucursalId = isSuperadmin.value 
      ? (sucursalSeleccionada.value || null)
      : currentSucursalId.value;
    
    if (isSuperadmin.value) {
      // Superadmin: cargar todas las bitácoras y contar solo las que NO son de él y pertenecen a la sucursal seleccionada
      await loadBitacoras(null, hoy, hoy, sucursalId);
      stats.value.bitacorasHoy = bitacorasData.value.filter(b => 
        b.fecha === hoy && b.empleado_id !== currentUser.value?.id
      ).length;
    } else {
      // Empleado: contar solo sus propias bitácoras
      await loadBitacoras(currentUser.value?.id, hoy, hoy, null);
      stats.value.bitacorasHoy = bitacorasData.value.filter(b => b.fecha === hoy).length;
    }
  } catch (error) {
    console.error('Error al cargar bitácoras:', error);
  }
};

const loadStats = async () => {
  try {
    // Calcular el rango completo del día de hoy con hora
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const hoyInicio = hoy.toISOString(); // Incluye hora: "2026-04-03T00:00:00.000Z"
    
    const hoyFin = new Date(hoy);
    hoyFin.setHours(23, 59, 59, 999);
    const hoyFinStr = hoyFin.toISOString(); // Incluye hora: "2026-04-03T23:59:59.999Z"
    
    // Determinar la sucursal a usar para filtrar
    const sucursalId = isSuperadmin.value 
      ? (sucursalSeleccionada.value || null)
      : currentSucursalId.value;
    
    // Usar directamente fetchVentas y fetchPagosMembresiaConFiltros con el rango completo del día
    // para asegurar que se incluyan todas las ventas
    const { data: ventas, error: ventasError } = await fetchVentas(
      sucursalId,
      undefined,
      hoyInicio,
      hoyFinStr
    );
    
    const { data: pagosMembresia, error: pagosError } = await fetchPagosMembresiaConFiltros(
      sucursalId,
      undefined,
      hoyInicio,
      hoyFinStr
    );
    
    if (ventasError || pagosError) {
      console.error('Error al cargar ventas:', ventasError || pagosError);
      stats.value.ventasHoy = 0;
    } else {
      // Contar ventas de productos
      const ventasProductos = ventas?.length || 0;
      // Contar pagos de membresías
      const pagosMembresiaCount = pagosMembresia?.length || 0;
      // Total de ventas (productos + pagos de membresías)
      stats.value.ventasHoy = ventasProductos + pagosMembresiaCount;
    }

    // Cargar TODAS las ventas pendientes (sin filtro de fecha)
    const { data: todasLasVentas, error: ventasPendientesError } = await fetchVentas(
      sucursalId,
      undefined,
      undefined,
      undefined
    );
    
    if (ventasPendientesError) {
      console.error('Error al cargar ventas pendientes:', ventasPendientesError);
    } else {
      // Contar todas las ventas pendientes (de cualquier fecha)
      stats.value.ventasPendientes = todasLasVentas?.filter(v => v.estado_pago === 'pendiente').length || 0;
    }

    // Membresías
    const { data: membresias, error: membresiasError } = await fetchMembresias(
      sucursalId
    );
    
    if (membresiasError) {
      console.error('Error al cargar membresías:', membresiasError);
    } else if (membresias) {
      stats.value.membresiasActivas = membresias.filter(m => m.estado === 'activa').length;
      stats.value.membresiasVencidas = membresias.filter(m => m.estado === 'vencida').length;
      
      // Calcular "por vencer" = membresías activas que vencen en los próximos 7 días (hasta el día 7, inclusive)
      // Si hoy es día 5, entonces "por vencer" es del día 5 al día 12 (7 días desde hoy)
      const hoyStr = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      const hoyDate = new Date(hoyStr + 'T00:00:00');
      const en7Dias = new Date(hoyDate);
      en7Dias.setDate(en7Dias.getDate() + 7); // Sumar 7 días
      
      // Normalizar fecha de en7Dias a string YYYY-MM-DD para comparación
      const en7DiasStr = en7Dias.toISOString().split('T')[0];
      
      stats.value.membresiasPorVencer = membresias.filter(m => {
        if (m.estado !== 'activa') return false;
        
        // Normalizar fecha de vencimiento a YYYY-MM-DD (sin zona horaria)
        let fechaVencimientoStr = '';
        if (typeof m.fecha_vencimiento === 'string') {
          const fechaStr = m.fecha_vencimiento.trim();
          if (fechaStr.includes('T')) {
            fechaVencimientoStr = fechaStr.split('T')[0];
          } else if (fechaStr.includes(' ')) {
            fechaVencimientoStr = fechaStr.split(' ')[0];
          } else {
            fechaVencimientoStr = fechaStr;
          }
        } else {
          const fecha = new Date(m.fecha_vencimiento);
          if (!isNaN(fecha.getTime())) {
            fechaVencimientoStr = fecha.toISOString().split('T')[0];
          }
        }
        
        if (!fechaVencimientoStr) return false;
        
        // Comparar como strings: debe ser >= hoy y <= en7Dias
        // Si hoy es 2026-03-05 y en7Dias es 2026-03-12, entonces incluir del 05 al 12
        return fechaVencimientoStr >= hoyStr && fechaVencimientoStr <= en7DiasStr;
      }).length;
    }

    // Clientes
    const { data: clientes, error: clientesError } = await fetchClientes(
      sucursalId
    );
    
    if (clientesError) {
      console.error('Error al cargar clientes:', clientesError);
    } else if (clientes) {
      stats.value.clientes = clientes.length;
    }
    } catch (error) {
      console.error('Error en loadStats:', error);
    }
    
    // Recargar bitácoras cuando cambian las estadísticas (por el filtro de sucursal)
    await loadBitacorasStats();
  };

</script>

<style scoped>
.hover-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  cursor: pointer;
}

.hover-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
}
</style>

