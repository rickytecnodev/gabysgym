<template>
  <div class="bg-light min-vh-100">
    <GymNavbar />
    <div v-if="loading" class="container-fluid py-4">
      <div class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Cargando...</span>
        </div>
        <p class="mt-3 text-muted">Cargando dashboard...</p>
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
        <h1 class="h3 mb-0">Dashboard</h1>
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
      </div>
      <div class="row g-3 mb-4">
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
                  <h3 class="mb-0 text-danger">{{ stats.ventasPendientes }}</h3>
                </div>
                <div class="text-danger">
                  <i class="fa-solid fa-exclamation-circle fa-2x"></i>
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
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '@/composables/useAuth';
import { useGymFilters } from '@/composables/useGymFilters';
import { fetchVentas, fetchMembresias, fetchPagosMembresiaConFiltros, fetchClientes } from '@/services/gymApi';
import GymNavbar from '@/components/GymNavbar.vue';

const router = useRouter();
const { currentSucursalId, isSuperadmin, isAuthenticated } = useAuth();
const { setFilters } = useGymFilters();

const stats = ref({
  ventasHoy: 0,
  membresiasActivas: 0,
  membresiasPorVencer: 0,
  membresiasVencidas: 0,
  ventasPendientes: 0,
  clientes: 0
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
    
    await loadStats();
  } catch (err: any) {
    console.error('Error al cargar dashboard:', err);
    error.value = err.message || 'Error al cargar el dashboard';
  } finally {
    loading.value = false;
  }
});

const loadStats = async () => {
  try {
    const hoy = new Date().toISOString().split('T')[0];
    
    // Ventas de hoy (productos + pagos de membresías)
    const { data: ventas, error: ventasError } = await fetchVentas(
      isSuperadmin.value ? null : currentSucursalId.value,
      undefined,
      hoy,
      hoy
    );
    
    // Pagos de membresías de hoy
    const { data: pagosMembresia, error: pagosError } = await fetchPagosMembresiaConFiltros(
      isSuperadmin.value ? null : currentSucursalId.value,
      undefined,
      hoy,
      hoy
    );
    
    if (ventasError) {
      console.error('Error al cargar ventas:', ventasError);
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
      isSuperadmin.value ? null : currentSucursalId.value,
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
      isSuperadmin.value ? null : currentSucursalId.value
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
      isSuperadmin.value ? null : currentSucursalId.value
    );
    
    if (clientesError) {
      console.error('Error al cargar clientes:', clientesError);
    } else if (clientes) {
      stats.value.clientes = clientes.length;
    }
  } catch (error) {
    console.error('Error en loadStats:', error);
  }
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

