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
            <div v-if="isSuperadmin" class="col-md-3">
              <label class="form-label">Sucursal</label>
              <select v-model="filtroSucursal" class="form-select">
                <option :value="null">Todas</option>
                <option v-for="sucursal in sucursales" :key="sucursal.id" :value="sucursal.id">
                  {{ sucursal.nombre }}
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
            <div class="col-md-3">
              <label class="form-label">Estado</label>
              <select v-model="filtroEstado" class="form-select">
                <option value="">Todos</option>
                <option value="pagado">Pagado</option>
                <option value="pendiente">Pendiente</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabs y Tablas de ventas -->
      <div class="card">
        <div class="card-body">
          <!-- Tabs -->
          <ul class="nav nav-tabs mb-3" role="tablist">
            <li class="nav-item" role="presentation">
              <button 
                class="nav-link" 
                :class="{ active: tabActivo === 'productos' }"
                @click="tabActivo = 'productos'"
                type="button"
              >
                Productos
              </button>
            </li>
            <li class="nav-item" role="presentation">
              <button 
                class="nav-link" 
                :class="{ active: tabActivo === 'membresias' }"
                @click="tabActivo = 'membresias'"
                type="button"
              >
                Membresías
              </button>
            </li>
          </ul>

          <!-- Tab: Productos -->
          <div v-show="tabActivo === 'productos'" class="tab-content">
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
                    v-for="venta in ventasFiltradas" 
                    :key="'venta-' + venta.id"
                    @click="verDetalleVenta(venta)"
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
                  <tr v-if="ventasFiltradas.length === 0">
                    <td :colspan="isSuperadmin && !filtroSucursal ? 6 : 5" class="text-center text-muted">No hay ventas de productos</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Tab: Membresías -->
          <div v-show="tabActivo === 'membresias'" class="tab-content">
            <div class="table-responsive">
              <table class="table table-hover">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Cliente</th>
                    <th>Monto</th>
                    <th>Mes Pagado</th>
                    <th>Empleado</th>
                    <th v-if="isSuperadmin && !filtroSucursal">Sucursal</th>
                  </tr>
                </thead>
                <tbody>
                  <tr 
                    v-for="pago in pagosMembresiaFiltrados" 
                    :key="'pago-' + pago.id"
                    @click="verDetalleMembresia(pago)"
                    style="cursor: pointer;"
                  >
                    <td>{{ formatFecha(pago.fecha_pago) }}</td>
                    <td>{{ pago.membresia?.cliente?.nombre_completo || 'N/A' }}</td>
                    <td class="fw-bold">${{ pago.monto.toFixed(2) }}</td>
                    <td>{{ pago.mes_pagado }}</td>
                    <td>{{ pago.empleado?.nombre_completo }}</td>
                    <td v-if="isSuperadmin && !filtroSucursal">
                      {{ (pago.membresia?.sucursal as any)?.nombre || 'N/A' }}
                    </td>
                  </tr>
                  <tr v-if="pagosMembresiaFiltrados.length === 0">
                    <td :colspan="isSuperadmin && !filtroSucursal ? 6 : 5" class="text-center text-muted">No hay pagos de membresías</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

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
                  <span :class="getEstadoBadgeClass(ventaDetalle.estado_pago)">
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
                      <span :class="getEstadoBadgeClass(pagoMembresiaDetalle.membresia.estado)">
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
import { fetchVentas, createVenta, updateVentaEstado, fetchProductos, fetchClientes, fetchSucursales, fetchPagosMembresiaConFiltros } from '@/services/gymApi';
import { useAuth } from '@/composables/useAuth';
import { useGymFilters } from '@/composables/useGymFilters';
import type { Venta, Producto, Cliente, VentaForm, Sucursal, PagoMembresia, Membresia } from '@/types/gym';
import Swal from 'sweetalert2';
import GymNavbar from '@/components/GymNavbar.vue';

const { currentSucursalId, currentUser, isSuperadmin } = useAuth();
const { getFilters, clearFilters } = useGymFilters();

const ventas = ref<Venta[]>([]);
const pagosMembresia = ref<PagoMembresia[]>([]);
const productosDisponibles = ref<Producto[]>([]);
const clientes = ref<Cliente[]>([]);
const sucursales = ref<Sucursal[]>([]);
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
watch([filtroFechaDesde, filtroFechaHasta, filtroEstado, filtroSucursal], () => {
  loadVentas();
});

watch(periodoActivo, () => {
  loadVentas();
});

onMounted(() => {
  // Leer filtros desde el composable
  const filters = getFilters();
  
  if (filters) {
    if (filters.periodo) {
      periodoActivo.value = filters.periodo;
      aplicarPeriodo(filters.periodo, false);
    }
    
    if (filters.estado) {
      filtroEstado.value = filters.estado;
    }
    
    // Limpiar filtros después de usarlos
    clearFilters();
  }
  
  loadVentas();
  loadProductos();
  loadClientes();
  
  if (isSuperadmin.value) {
    loadSucursales();
  }
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

const aplicarPeriodo = (periodo: string, recargar = true) => {
  periodoActivo.value = periodo;
  const fechas = calcularFechasPeriodo(periodo);
  
  if (fechas.desde && fechas.hasta) {
    filtroFechaDesde.value = fechas.desde;
    filtroFechaHasta.value = fechas.hasta;
    
    if (recargar) {
      loadVentas();
    }
  }
};

const limpiarPeriodo = () => {
  periodoActivo.value = '';
  filtroFechaDesde.value = '';
  filtroFechaHasta.value = '';
  loadVentas();
};

const loadVentas = async () => {
  // Si hay un período activo, usar esas fechas; si no, usar el rango manual
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
  
  // Cargar ventas de productos
  const { data, error } = await fetchVentas(
    sucursalId,
    undefined,
    fechaDesde || undefined,
    fechaHasta || undefined
  );
  if (error) {
    Swal.fire('Error', error.message, 'error');
    return;
  }
  ventas.value = data || [];
  
  // Cargar pagos de membresías
  const { data: pagosData, error: pagosError } = await fetchPagosMembresiaConFiltros(
    sucursalId,
    undefined,
    fechaDesde || undefined,
    fechaHasta || undefined
  );
  if (pagosError) {
    console.error('Error al cargar pagos de membresías:', pagosError);
  } else {
    pagosMembresia.value = pagosData || [];
  }
};

const loadProductos = async () => {
  const { data } = await fetchProductos(
    isSuperadmin.value ? null : currentSucursalId.value
  );
  if (data) {
    productosDisponibles.value = data.filter(p => p.estado === 'activo');
  }
};

const loadClientes = async () => {
  const sucursalId = isSuperadmin.value 
    ? (sucursalSeleccionada.value || null) 
    : currentSucursalId.value;
  const { data } = await fetchClientes(sucursalId);
  if (data) {
    clientes.value = data;
  }
};

// Watcher para recargar clientes cuando cambia la sucursal seleccionada (solo para superadmin)
watch(sucursalSeleccionada, () => {
  if (isSuperadmin.value) {
    loadClientes();
    loadProductos();
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

  // Determinar la sucursal a usar
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

  try {
    const { error } = await createVenta({
      ...formVenta.value,
      productos: productosVenta.value.map(p => ({
        producto_id: p.producto_id,
        cantidad: p.cantidad
      })),
      sucursal_id: sucursalId,
      empleado_id: currentUser.value.id
    });

    if (error) {
      errorMessage.value = error.message;
      return;
    }

    Swal.fire('Éxito', 'Venta registrada correctamente', 'success');
    cerrarModal();
    loadVentas();
    loadProductos();
  } catch (error: any) {
    errorMessage.value = error.message || 'Error al guardar venta';
  } finally {
    loading.value = false;
  }
};

const verDetalleVenta = (venta: Venta) => {
  ventaDetalle.value = venta;
  showDetalleModal.value = true;
};

const verDetalleMembresia = (pago: PagoMembresia) => {
  pagoMembresiaDetalle.value = pago;
  showDetalleMembresiaModal.value = true;
};

const marcarPagado = async (id: number) => {
  const result = await Swal.fire({
    title: '¿Marcar como pagado?',
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Sí, marcar',
    cancelButtonText: 'Cancelar'
  });

  if (result.isConfirmed) {
    const { error } = await updateVentaEstado(id, 'pagado');
    if (error) {
      Swal.fire('Error', error.message, 'error');
      return;
    }
    Swal.fire('Éxito', 'Venta marcada como pagada', 'success');
    loadVentas();
  }
};

const marcarPagadoDesdeDetalle = async () => {
  if (!ventaDetalle.value) return;
  
  const result = await Swal.fire({
    title: '¿Marcar como pagado?',
    text: `¿Estás seguro de marcar la venta #${ventaDetalle.value.id} como pagada?`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Sí, marcar',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#28a745'
  });

  if (result.isConfirmed) {
    const { error } = await updateVentaEstado(ventaDetalle.value.id, 'pagado');
    if (error) {
      Swal.fire('Error', error.message, 'error');
      return;
    }
    Swal.fire('Éxito', 'Venta marcada como pagada', 'success');
    showDetalleModal.value = false;
    loadVentas();
  }
};

const formatFecha = (fecha: string) => {
  return new Date(fecha).toLocaleDateString('es-MX');
};

const getEstadoBadgeClass = (estado: string) => {
  const clases: Record<string, string> = {
    pagado: 'badge bg-success',
    pendiente: 'badge bg-warning',
    cancelado: 'badge bg-danger',
    activa: 'badge bg-success',
    vencida: 'badge bg-danger',
    cancelada: 'badge bg-secondary'
  };
  return clases[estado] || 'badge bg-secondary';
};
</script>

