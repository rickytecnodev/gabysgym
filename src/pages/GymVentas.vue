<template>
  <div class="bg-light min-vh-100">
    <GymNavbar />
    <div class="container-fluid py-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h1 class="h3 mb-0">Ventas</h1>
        <button @click="showModal = true" class="btn btn-primary">
          <i class="fa-solid fa-plus me-1"></i>
          Nueva Venta
        </button>
      </div>

      <!-- Filtros -->
      <FiltrosVentas
        v-model:filtro-sucursal="filtroSucursal"
        v-model:filtro-fecha-desde="filtroFechaDesde"
        v-model:filtro-fecha-hasta="filtroFechaHasta"
        v-model:filtro-estado="filtroEstado"
        :periodo-activo="periodoActivo"
        :sucursales="sucursales"
        :is-superadmin="isSuperadmin"
        @aplicar-periodo="aplicarPeriodo"
        @limpiar-periodo="limpiarPeriodo"
      />

      <!-- Tabs y Tablas de ventas -->
      <TabsVentas :tab-activo="tabActivo" @cambiar-tab="tabActivo = $event">
        <template #productos>
          <TablaVentasProductos
            :ventas="ventasFiltradas"
            :is-superadmin="isSuperadmin"
            :filtro-sucursal="filtroSucursal"
            :loading="loadingDataVentas"
            @ver-detalle="verDetalleVenta"
          />
        </template>
        <template #membresias>
          <TablaPagosMembresia
            :pagos="pagosMembresiaFiltrados"
            :is-superadmin="isSuperadmin"
            :filtro-sucursal="filtroSucursal"
            :loading="loadingDataVentas"
            @ver-detalle="verDetalleMembresia"
          />
        </template>
      </TabsVentas>

      <!-- Modal de nueva venta -->
      <div v-if="showModal" class="modal show d-block" tabindex="-1" style="background-color: rgba(0,0,0,0.5)">
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Nueva Venta</h5>
              <button type="button" class="btn-close" @click="cerrarModal"></button>
            </div>
            <div class="modal-body">
              <form @submit.prevent="guardarVenta">
                <div class="mb-3" v-if="isSuperadmin">
                  <label class="form-label">Sucursal *</label>
                  <select v-model="sucursalSeleccionada" class="form-select" required>
                    <option value="">Selecciona una sucursal</option>
                    <option v-for="sucursal in sucursales" :key="sucursal.id" :value="sucursal.id">
                      {{ sucursal.nombre }}
                    </option>
                  </select>
                </div>
                <div class="mb-3">
                  <label class="form-label">Cliente (opcional)</label>
                  <select v-model="formVenta.cliente_id" class="form-select">
                    <option :value="null">Cliente general</option>
                    <option v-for="cliente in clientesFiltrados" :key="cliente.id" :value="cliente.id">
                      {{ cliente.nombre_completo }} - {{ cliente.telefono }}
                    </option>
                  </select>
                </div>

                <div class="mb-3">
                  <label class="form-label">Productos</label>
                  <div class="d-flex gap-2 mb-2">
                    <select v-model="productoSeleccionado" class="form-select flex-grow-1">
                      <option value="">Selecciona un producto</option>
                      <option v-for="producto in productosDisponibles" :key="producto.id" :value="producto.id">
                        {{ producto.nombre }} - ${{ producto.precio.toFixed(2) }} (Stock: {{ producto.stock }})
                      </option>
                    </select>
                    <input 
                      v-model.number="cantidadProducto" 
                      type="number" 
                      min="1" 
                      class="form-control" 
                      style="width: 100px;"
                      placeholder="Cant."
                    >
                    <button 
                      type="button" 
                      @click="agregarProducto" 
                      class="btn btn-primary"
                      :disabled="!productoSeleccionado || !cantidadProducto"
                    >
                      Agregar
                    </button>
                  </div>

                  <div v-if="productosVenta.length > 0" class="table-responsive">
                    <table class="table table-sm">
                      <thead>
                        <tr>
                          <th>Producto</th>
                          <th>Cantidad</th>
                          <th>Precio Unit.</th>
                          <th>Subtotal</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="(item, index) in productosVenta" :key="index">
                          <td>{{ item.nombre }}</td>
                          <td>{{ item.cantidad }}</td>
                          <td>${{ item.precio.toFixed(2) }}</td>
                          <td>${{ (item.precio * item.cantidad).toFixed(2) }}</td>
                          <td>
                            <button type="button" @click="quitarProducto(index)" class="btn btn-sm btn-outline-danger">
                              <i class="fa-solid fa-times"></i>
                            </button>
                          </td>
                        </tr>
                      </tbody>
                      <tfoot>
                        <tr>
                          <th colspan="3">Total:</th>
                          <th>${{ totalVenta.toFixed(2) }}</th>
                          <th></th>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>

                <div class="mb-3">
                  <label class="form-label">Estado de Pago *</label>
                  <select v-model="formVenta.estado_pago" class="form-select" required>
                    <option value="pagado">Pagado</option>
                    <option value="pendiente">Pendiente</option>
                  </select>
                </div>

                <div class="mb-3">
                  <label class="form-label">Notas</label>
                  <textarea v-model="formVenta.notas" class="form-control" rows="2"></textarea>
                </div>

                <div v-if="errorMessage" class="alert alert-danger">{{ errorMessage }}</div>
                <div class="modal-footer">
                  <button type="button" class="btn btn-secondary" @click="cerrarModal">Cancelar</button>
                  <button type="submit" class="btn btn-primary" :disabled="loading || productosVenta.length === 0">
                    <span v-if="loading" class="spinner-border spinner-border-sm me-1"></span>
                    Guardar Venta
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal de detalle de venta -->
      <div v-if="showDetalleModal" class="modal show d-block" tabindex="-1" style="background-color: rgba(0,0,0,0.5)">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Detalle de Venta #{{ ventaDetalle?.id }}</h5>
              <button type="button" class="btn-close" @click="showDetalleModal = false"></button>
            </div>
            <div class="modal-body">
              <div v-if="ventaDetalle">
                <p><strong>Fecha:</strong> {{ formatFecha(ventaDetalle.fecha_venta) }}</p>
                <p><strong>Cliente:</strong> {{ ventaDetalle.cliente?.nombre_completo || 'Cliente general' }}</p>
                <p><strong>Empleado:</strong> {{ ventaDetalle.empleado?.nombre_completo }}</p>
                  <p><strong>Estado:</strong> 
                  <span :class="ventaDetalle.estado_pago === 'pagado' ? 'badge bg-success' : ventaDetalle.estado_pago === 'pendiente' ? 'badge bg-warning' : 'badge bg-danger'">
                    {{ ventaDetalle.estado_pago }}
                  </span>
                </p>
                <hr>
                <h6>Productos:</h6>
                <table class="table table-sm">
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>Cantidad</th>
                      <th>Precio Unit.</th>
                      <th>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="detalle in ventaDetalle.detalles" :key="detalle.id">
                      <td>{{ detalle.producto?.nombre }}</td>
                      <td>{{ detalle.cantidad }}</td>
                      <td>${{ detalle.precio_unitario.toFixed(2) }}</td>
                      <td>${{ detalle.subtotal.toFixed(2) }}</td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr>
                      <th colspan="3">Total:</th>
                      <th>${{ ventaDetalle.total.toFixed(2) }}</th>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
            <div class="modal-footer">
              <button 
                v-if="ventaDetalle?.estado_pago === 'pendiente'"
                @click="marcarPagadoDesdeDetalle" 
                class="btn btn-success me-2"
              >
                <i class="fa-solid fa-check me-1"></i>
                Marcar como Pagado
              </button>
              <button type="button" class="btn btn-secondary" @click="showDetalleModal = false">Cerrar</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal de detalle de membresía pagada -->
      <div v-if="showDetalleMembresiaModal" class="modal show d-block" tabindex="-1" style="background-color: rgba(0,0,0,0.5)">
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Detalle de Membresía</h5>
              <button type="button" class="btn-close" @click="showDetalleMembresiaModal = false"></button>
            </div>
            <div class="modal-body">
              <div v-if="pagoMembresiaDetalle && pagoMembresiaDetalle.membresia">
                <div class="row mb-3">
                  <div class="col-md-6">
                    <h6>Información del Cliente</h6>
                    <p><strong>Cliente:</strong> {{ pagoMembresiaDetalle.membresia.cliente?.nombre_completo }}</p>
                    <p><strong>Teléfono:</strong> {{ pagoMembresiaDetalle.membresia.cliente?.telefono }}</p>
                    <p><strong>WhatsApp:</strong> {{ pagoMembresiaDetalle.membresia.cliente?.whatsapp || 'N/A' }}</p>
                  </div>
                  <div class="col-md-6">
                    <h6>Información de la Membresía</h6>
                    <p><strong>Tipo:</strong> {{ pagoMembresiaDetalle.membresia.tipo_membresia?.nombre }}</p>
                    <p><strong>Fecha Inicio:</strong> {{ formatFecha(pagoMembresiaDetalle.membresia.fecha_inicio) }}</p>
                    <p><strong>Fecha Vencimiento:</strong> {{ formatFecha(pagoMembresiaDetalle.membresia.fecha_vencimiento) }}</p>
                    <p><strong>Estado:</strong> 
                      <span :class="pagoMembresiaDetalle.membresia.estado === 'activa' ? 'badge bg-success' : pagoMembresiaDetalle.membresia.estado === 'vencida' ? 'badge bg-danger' : 'badge bg-secondary'">
                        {{ pagoMembresiaDetalle.membresia.estado }}
                      </span>
                    </p>
                  </div>
                </div>
                <hr>
                <h6>Información del Pago</h6>
                <div class="row mb-3">
                  <div class="col-md-6">
                    <p><strong>Fecha de Pago:</strong> {{ formatFecha(pagoMembresiaDetalle.fecha_pago) }}</p>
                    <p><strong>Monto:</strong> ${{ pagoMembresiaDetalle.monto.toFixed(2) }}</p>
                    <p><strong>Mes Pagado:</strong> {{ pagoMembresiaDetalle.mes_pagado }}</p>
                  </div>
                  <div class="col-md-6">
                    <p><strong>Método de Pago:</strong> {{ pagoMembresiaDetalle.metodo_pago || 'N/A' }}</p>
                    <p><strong>Empleado:</strong> {{ pagoMembresiaDetalle.empleado?.nombre_completo }}</p>
                    <p v-if="pagoMembresiaDetalle.notas"><strong>Notas:</strong> {{ pagoMembresiaDetalle.notas }}</p>
                  </div>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click="showDetalleMembresiaModal = false">Cerrar</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useAuth } from '@/composables/useAuth';
import { useGymFilters } from '@/composables/useGymFilters';
import { useVentas } from '@/composables/useVentas';
import type { Venta, VentaForm, PagoMembresia } from '@/types/gym';
import Swal from 'sweetalert2';
import GymNavbar from '@/components/GymNavbar.vue';
import FiltrosVentas from '@/components/ventas/FiltrosVentas.vue';
import TabsVentas from '@/components/ventas/TabsVentas.vue';
import TablaVentasProductos from '@/components/ventas/TablaVentasProductos.vue';
import TablaPagosMembresia from '@/components/ventas/TablaPagosMembresia.vue';

const { currentSucursalId, currentUser, isSuperadmin } = useAuth();
const { getFilters, clearFilters } = useGymFilters();
const {
  ventas,
  pagosMembresia,
  productosDisponibles,
  clientes,
  sucursales,
  loadingData: loadingDataVentas,
  loadVentas: loadVentasFromComposable,
  loadPagosMembresia: loadPagosMembresiaFromComposable,
  loadProductos,
  loadClientes,
  loadSucursales,
  guardarVenta: guardarVentaFromComposable,
  marcarPagado: marcarPagadoFromComposable
} = useVentas();

const showModal = ref(false);
const showDetalleModal = ref(false);
const showDetalleMembresiaModal = ref(false);
const ventaDetalle = ref<Venta | null>(null);
const pagoMembresiaDetalle = ref<PagoMembresia | null>(null);
const tabActivo = ref<'productos' | 'membresias'>('productos');
const loading = ref(false);
const errorMessage = ref('');
const filtroFechaDesde = ref('');
const filtroFechaHasta = ref('');
const filtroEstado = ref('');
const filtroSucursal = ref<number | null>(null);
const periodoActivo = ref<string>('');
const sucursalSeleccionada = ref<number | null>(null);

const productoSeleccionado = ref<number | null>(null);
const cantidadProducto = ref(1);
const productosVenta = ref<Array<{ producto_id: number; cantidad: number; precio: number; nombre: string }>>([]);

const formVenta = ref<VentaForm>({
  cliente_id: null,
  productos: [],
  estado_pago: 'pagado',
  notas: ''
});

const ventasFiltradas = computed(() => {
  let filtradas = ventas.value;
  if (filtroEstado.value) {
    filtradas = filtradas.filter(v => v.estado_pago === filtroEstado.value);
  }
  return filtradas;
});

const pagosMembresiaFiltrados = computed(() => {
  // Los pagos de membresías siempre están pagados, así que no aplicamos filtro de estado
  return pagosMembresia.value;
});

const clientesFiltrados = computed(() => {
  if (!isSuperadmin.value || !sucursalSeleccionada.value) {
    return clientes.value;
  }
  return clientes.value.filter(c => c.sucursal_id === sucursalSeleccionada.value);
});

const totalVenta = computed(() => {
  return productosVenta.value.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
});

// Watchers para hacer los filtros reactivos
// Solo recargar del servidor cuando cambia la sucursal o las fechas (necesita datos diferentes)
watch([filtroFechaDesde, filtroFechaHasta, filtroSucursal], () => {
  loadVentas();
});

watch(periodoActivo, () => {
  loadVentas();
});

// El filtro de estado se hace en el cliente (computed)

onMounted(async () => {
  const filters = getFilters();
  
  if (filters) {
    if (filters.periodo) {
      periodoActivo.value = filters.periodo;
      aplicarPeriodo(filters.periodo);
    }
    
    if (filters.estado) {
      filtroEstado.value = filters.estado;
    }
    
    clearFilters();
  }
  
  await loadVentas();
  const sucursalId = isSuperadmin.value ? null : currentSucursalId.value;
  await loadProductos(sucursalId);
  await loadClientes(sucursalId);
  
  if (isSuperadmin.value) {
    await loadSucursales();
  }
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
    
    // El watcher de filtroFechaDesde/filtroFechaHasta ya recargará los datos
  }
};

const limpiarPeriodo = () => {
  periodoActivo.value = '';
  filtroFechaDesde.value = '';
  filtroFechaHasta.value = '';
  // El watcher de filtroFechaDesde/filtroFechaHasta ya recargará los datos
};

const loadVentas = async () => {
  let fechaDesde = filtroFechaDesde.value;
  let fechaHasta = filtroFechaHasta.value;
  
  if (periodoActivo.value) {
    const fechas = calcularFechasPeriodo(periodoActivo.value);
    fechaDesde = fechas.desde || fechaDesde;
    fechaHasta = fechas.hasta || fechaHasta;
  }
  
  const sucursalId = isSuperadmin.value 
    ? (filtroSucursal.value || null) 
    : currentSucursalId.value;
  
  await loadVentasFromComposable(
    sucursalId,
    fechaDesde || undefined,
    fechaHasta || undefined
  );
  
  await loadPagosMembresiaFromComposable(
    sucursalId,
    fechaDesde || undefined,
    fechaHasta || undefined
  );
};

// Watcher para recargar clientes cuando cambia la sucursal seleccionada (solo para superadmin)
watch(sucursalSeleccionada, () => {
  if (isSuperadmin.value) {
    const sucursalId = sucursalSeleccionada.value || null;
    loadClientes(sucursalId);
    loadProductos(sucursalId);
  }
});

const agregarProducto = () => {
  if (!productoSeleccionado.value || !cantidadProducto.value) return;
  
  const producto = productosDisponibles.value.find(p => p.id === productoSeleccionado.value);
  if (!producto) return;

  if (producto.stock < cantidadProducto.value) {
    Swal.fire('Error', 'Stock insuficiente', 'error');
    return;
  }

  productosVenta.value.push({
    producto_id: producto.id,
    cantidad: cantidadProducto.value,
    precio: producto.precio,
    nombre: producto.nombre
  });

  productoSeleccionado.value = null;
  cantidadProducto.value = 1;
};

const quitarProducto = (index: number) => {
  productosVenta.value.splice(index, 1);
};

const cerrarModal = () => {
  showModal.value = false;
  productosVenta.value = [];
  formVenta.value = {
    cliente_id: null,
    productos: [],
    estado_pago: 'pagado',
    notas: ''
  };
  sucursalSeleccionada.value = null;
  errorMessage.value = '';
};

const guardarVenta = async () => {
  if (!currentUser.value) {
    errorMessage.value = 'Error de autenticación';
    return;
  }

  const sucursalId = isSuperadmin.value 
    ? sucursalSeleccionada.value 
    : currentSucursalId.value;

  if (!sucursalId) {
    errorMessage.value = isSuperadmin.value 
      ? 'Debes seleccionar una sucursal' 
      : 'Error: no tienes sucursal asignada';
    return;
  }

  if (productosVenta.value.length === 0) {
    errorMessage.value = 'Debes agregar al menos un producto';
    return;
  }

  loading.value = true;
  errorMessage.value = '';

  const result = await guardarVentaFromComposable(
    {
      ...formVenta.value,
      productos: productosVenta.value.map(p => ({
        producto_id: p.producto_id,
        cantidad: p.cantidad
      }))
    },
    sucursalId,
    currentUser.value.id
  );

  if (result?.error) {
    errorMessage.value = result.error.message;
    loading.value = false;
    return;
  }

  if (result?.success) {
    cerrarModal();
    await loadVentas();
    const sucursalIdForProducts = isSuperadmin.value ? null : currentSucursalId.value;
    await loadProductos(sucursalIdForProducts);
  }
  
  loading.value = false;
};

const verDetalleVenta = (venta: Venta) => {
  ventaDetalle.value = venta;
  showDetalleModal.value = true;
};

const verDetalleMembresia = (pago: PagoMembresia) => {
  pagoMembresiaDetalle.value = pago;
  showDetalleMembresiaModal.value = true;
};


const marcarPagadoDesdeDetalle = async () => {
  if (!ventaDetalle.value) return;
  
  const result = await marcarPagadoFromComposable(ventaDetalle.value.id);
  if (result?.success) {
    showDetalleModal.value = false;
    await loadVentas();
  }
};

const formatFecha = (fecha: string) => {
  return new Date(fecha).toLocaleDateString('es-MX');
};
</script>

