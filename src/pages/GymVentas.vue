<template>
  <div class="bg-light min-vh-100">
    <div class="container-fluid py-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h1 class="h3 mb-0">Ventas</h1>
        <button @click="showModal = true" class="btn btn-primary">
          <i class="fa-solid fa-plus me-1"></i>
          Nueva Venta
        </button>
      </div>

      <!-- Filtros -->
      <FiltrosVentas v-model:filtro-sucursal="filtroSucursal" v-model:filtro-fecha-desde="filtroFechaDesde"
        v-model:filtro-fecha-hasta="filtroFechaHasta" v-model:filtro-estado="filtroEstado"
        :periodo-activo="periodoActivo" :sucursales="sucursales" :is-superadmin="isSuperadmin"
        @aplicar-periodo="aplicarPeriodo" @limpiar-periodo="limpiarPeriodo" />

      <!-- Tabs y Tablas de ventas -->
      <TabsVentas :tab-activo="tabActivo" @cambiar-tab="tabActivo = $event">
        <template #productos>
          <!-- Tabla de ventas productos (Desktop) -->
          <div class="d-none d-md-block">
            <TablaVentasProductos :ventas="ventasFiltradas" :is-superadmin="isSuperadmin"
              :filtro-sucursal="filtroSucursal" :loading="loadingDataVentas" @ver-detalle="verDetalleVenta"
              @editar="editarVenta" @eliminar="eliminarVenta" />
          </div>
          <!-- Vista móvil de ventas productos (Mobile) -->
          <div class="d-block d-md-none">
            <TablaVentasProductosMobile :ventas="ventasFiltradas" :is-superadmin="isSuperadmin"
              :filtro-sucursal="filtroSucursal" :loading="loadingDataVentas" @ver-detalle="verDetalleVenta"
              @editar="editarVenta" @eliminar="eliminarVenta" />
          </div>
        </template>
        <template #membresias>
          <!-- Tabla de pagos membresía (Desktop) -->
          <div class="d-none d-md-block">
            <TablaPagosMembresia :pagos="pagosMembresiaFiltrados" :is-superadmin="isSuperadmin"
              :filtro-sucursal="filtroSucursal" :loading="loadingDataVentas" @ver-detalle="verDetalleMembresia"
              @editar="editarPagoMembresia" @eliminar="eliminarPagoMembresia" />
          </div>
          <!-- Vista móvil de pagos membresía (Mobile) -->
          <div class="d-block d-md-none">
            <TablaPagosMembresiaMobile :pagos="pagosMembresiaFiltrados" :is-superadmin="isSuperadmin"
              :filtro-sucursal="filtroSucursal" :loading="loadingDataVentas" @ver-detalle="verDetalleMembresia"
              @editar="editarPagoMembresia" @eliminar="eliminarPagoMembresia" />
          </div>
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
                    <input v-model.number="cantidadProducto" type="number" min="1" class="form-control"
                      style="width: 100px;" placeholder="Cant.">
                    <button type="button" @click="agregarProducto" class="btn btn-primary"
                      :disabled="!productoSeleccionado || !cantidadProducto">
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
                  <span
                    :class="ventaDetalle.estado_pago === 'pagado' ? 'badge bg-success' : ventaDetalle.estado_pago === 'pendiente' ? 'badge bg-warning' : 'badge bg-danger'">
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
              <button v-if="ventaDetalle?.estado_pago === 'pendiente'" @click="marcarPagadoDesdeDetalle"
                class="btn btn-success me-2">
                <i class="fa-solid fa-check me-1"></i>
                Marcar como Pagado
              </button>
              <button type="button" class="btn btn-secondary" @click="showDetalleModal = false">Cerrar</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal de detalle de membresía pagada -->
      <div v-if="showDetalleMembresiaModal" class="modal show d-block" tabindex="-1"
        style="background-color: rgba(0,0,0,0.5)">
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
                    <p><strong>Fecha Vencimiento:</strong> {{
                      formatFecha(pagoMembresiaDetalle.membresia.fecha_vencimiento) }}
                    </p>
                    <p><strong>Estado:</strong>
                      <span
                        :class="pagoMembresiaDetalle.membresia.estado === 'activa' ? 'badge bg-success' : pagoMembresiaDetalle.membresia.estado === 'vencida' ? 'badge bg-danger' : 'badge bg-secondary'">
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
                    <p><strong>Mes Pagado:</strong> {{ formatMesPagado(pagoMembresiaDetalle.mes_pagado) }}</p>
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

      <!-- Modal de editar pago de membresía -->
      <div v-if="showModalEditarPago" class="modal show d-block" tabindex="-1"
        style="background-color: rgba(0,0,0,0.5)">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Editar Pago de Membresía</h5>
              <button type="button" class="btn-close" @click="cerrarModalEditarPago"></button>
            </div>
            <div class="modal-body">
              <form @submit.prevent="guardarPagoEditado">
                <div class="mb-3">
                  <label class="form-label">Fecha de Pago *</label>
                  <input v-model="formPagoEdit.fecha_pago" type="date" class="form-control" required>
                </div>
                <div class="mb-3">
                  <label class="form-label">Monto *</label>
                  <input v-model.number="formPagoEdit.monto" type="number" step="0.01" class="form-control" required>
                </div>
                <div class="mb-3">
                  <label class="form-label">Mes Pagado *</label>
                  <input v-model="formPagoEdit.mes_pagado" type="month" class="form-control" required>
                </div>
                <div class="mb-3">
                  <label class="form-label">Método de Pago</label>
                  <select v-model="formPagoEdit.metodo_pago" class="form-select">
                    <option value="">Selecciona...</option>
                    <option value="efectivo">Efectivo</option>
                    <option value="tarjeta">Tarjeta</option>
                    <option value="transferencia">Transferencia</option>
                  </select>
                </div>
                <div class="mb-3">
                  <label class="form-label">Notas</label>
                  <textarea v-model="formPagoEdit.notas" class="form-control" rows="2"></textarea>
                </div>
                <div v-if="errorMessage" class="alert alert-danger">{{ errorMessage }}</div>
                <div class="modal-footer">
                  <button type="button" class="btn btn-secondary" @click="cerrarModalEditarPago">Cancelar</button>
                  <button type="submit" class="btn btn-primary" :disabled="loading">
                    <span v-if="loading" class="spinner-border spinner-border-sm me-1"></span>
                    Guardar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal de editar venta -->
      <div v-if="showModalEditarVenta" class="modal show d-block" tabindex="-1"
        style="background-color: rgba(0,0,0,0.5)">
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Editar Venta #{{ ventaEditando?.id }}</h5>
              <button type="button" class="btn-close" @click="cerrarModalEditarVenta"></button>
            </div>
            <div class="modal-body">
              <form @submit.prevent="guardarVentaEditada">
                <div class="mb-3">
                  <label class="form-label">Agregar Producto</label>
                  <div class="row g-2 mb-2">
                    <div class="col-md-4">
                      <select v-model.number="productoSeleccionadoEdit" class="form-select">
                        <option :value="null">Selecciona un producto</option>
                        <option v-for="producto in productosDisponibles" :key="producto.id" :value="producto.id">
                          {{ producto.nombre }} - ${{ producto.precio.toFixed(2) }}
                        </option>
                      </select>
                    </div>
                    <div class="col-md-2">
                      <input v-model.number="cantidadProductoEdit" type="number" min="1" class="form-control"
                        placeholder="Cantidad">
                    </div>
                    <div class="col-md-3">
                      <input v-model.number="precioProductoEdit" type="number" step="0.01" min="0" class="form-control"
                        placeholder="Precio (opcional)">
                      <small class="text-muted">Dejar en 0 para usar precio del producto</small>
                    </div>
                    <div class="col-md-3">
                      <button type="button" @click="agregarProductoEdit" class="btn btn-primary w-100">
                        <i class="fa-solid fa-plus me-1"></i>
                        Agregar
                      </button>
                    </div>
                  </div>
                </div>

                <div v-if="productosVentaEdit.length > 0" class="mb-3">
                  <label class="form-label">Productos en la Venta</label>
                  <div class="table-responsive">
                    <table class="table table-sm">
                      <thead>
                        <tr>
                          <th>Producto</th>
                          <th>Cantidad</th>
                          <th>Precio Unitario</th>
                          <th>Subtotal</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="(item, index) in productosVentaEdit" :key="index">
                          <td>{{ item.nombre }}</td>
                          <td>
                            <input v-model.number="item.cantidad" type="number" min="1"
                              class="form-control form-control-sm"
                              @change="item.subtotal = item.cantidad * item.precio_unitario">
                          </td>
                          <td>
                            <input v-model.number="item.precio_unitario" type="number" step="0.01" min="0"
                              class="form-control form-control-sm"
                              @change="item.subtotal = item.cantidad * item.precio_unitario">
                          </td>
                          <td>${{ item.subtotal.toFixed(2) }}</td>
                          <td>
                            <button type="button" @click="eliminarProductoEdit(index)"
                              class="btn btn-sm btn-outline-danger">
                              <i class="fa-solid fa-trash"></i>
                            </button>
                          </td>
                        </tr>
                      </tbody>
                      <tfoot>
                        <tr>
                          <th colspan="3" class="text-end">Total:</th>
                          <th>${{productosVentaEdit.reduce((sum, item) => sum + item.subtotal, 0).toFixed(2)}}</th>
                          <th></th>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>

                <div class="mb-3">
                  <label class="form-label">Estado de Pago *</label>
                  <select v-model="estadoPagoEdit" class="form-select" required>
                    <option value="pagado">Pagado</option>
                    <option value="pendiente">Pendiente</option>
                    <option value="cancelado">Cancelado</option>
                  </select>
                </div>

                <div v-if="errorMessage" class="alert alert-danger">{{ errorMessage }}</div>
                <div class="modal-footer">
                  <button type="button" class="btn btn-secondary" @click="cerrarModalEditarVenta">Cancelar</button>
                  <button type="submit" class="btn btn-primary" :disabled="loading">
                    <span v-if="loading" class="spinner-border spinner-border-sm me-1"></span>
                    Guardar Cambios
                  </button>
                </div>
              </form>
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
import { deleteVenta, updateVenta, updatePagoMembresia, deletePagoMembresia } from '@/services/gymApi';
import type { Venta, VentaForm, PagoMembresia } from '@/types/gym';
import Swal from 'sweetalert2';
import { getFechaHoraActualLocal, getFechaActualLocal } from '@/utils/dateFormatter';
import { formatFecha, formatMesPagado } from '@/utils/dateFormatter';
import FiltrosVentas from '@/components/ventas/FiltrosVentas.vue';
import TabsVentas from '@/components/ventas/TabsVentas.vue';
import TablaVentasProductos from '@/components/ventas/TablaVentasProductos.vue';
import TablaVentasProductosMobile from '@/components/ventas/TablaVentasProductosMobile.vue';
import TablaPagosMembresia from '@/components/ventas/TablaPagosMembresia.vue';
import TablaPagosMembresiaMobile from '@/components/ventas/TablaPagosMembresiaMobile.vue';

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
const showModalEditarPago = ref(false);
const showModalEditarVenta = ref(false);
const ventaDetalle = ref<Venta | null>(null);
const pagoMembresiaDetalle = ref<PagoMembresia | null>(null);
const pagoEditando = ref<PagoMembresia | null>(null);
const ventaEditando = ref<Venta | null>(null);
const tabActivo = ref<'productos' | 'membresias'>('productos');
const loading = ref(false);
const errorMessage = ref('');
const filtroFechaDesde = ref(getFechaActualLocal());
const filtroFechaHasta = ref(getFechaActualLocal());
const filtroEstado = ref('');
const filtroSucursal = ref<number | null>(null);
const periodoActivo = ref<string>('');
const sucursalSeleccionada = ref<number | null>(null);

const productoSeleccionado = ref<number | null>(null);
const cantidadProducto = ref(1);
const productosVenta = ref<Array<{ producto_id: number; cantidad: number; precio: number; nombre: string }>>([]);

const formPagoEdit = ref({
  fecha_pago: '',
  monto: 0,
  mes_pagado: '',
  metodo_pago: '',
  notas: ''
});

const productosVentaEdit = ref<Array<{ producto_id: number; cantidad: number; precio_unitario: number; subtotal: number; nombre: string }>>([]);
const productoSeleccionadoEdit = ref<number | null>(null);
const cantidadProductoEdit = ref(1);
const precioProductoEdit = ref(0);
const estadoPagoEdit = ref<'pagado' | 'pendiente' | 'cancelado'>('pagado');

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
  } else {
    // Si no hay filtros guardados, aplicar el filtro rápido de "hoy" por defecto
    aplicarPeriodo('hoy');
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

  const empleadoId = isSuperadmin.value ? null : currentUser.value?.id || null;

  await loadVentasFromComposable(
    sucursalId,
    fechaDesde || undefined,
    fechaHasta || undefined,
    empleadoId
  );

  await loadPagosMembresiaFromComposable(
    sucursalId,
    fechaDesde || undefined,
    fechaHasta || undefined,
    empleadoId
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

const editarVenta = (venta: Venta) => {
  ventaEditando.value = venta;

  // Cargar los productos de la venta en el formulario de edición
  if (venta.detalles && venta.detalles.length > 0) {
    productosVentaEdit.value = venta.detalles.map(detalle => ({
      producto_id: detalle.producto_id,
      cantidad: detalle.cantidad,
      precio_unitario: detalle.precio_unitario,
      subtotal: detalle.subtotal,
      nombre: detalle.producto?.nombre || 'Producto'
    }));
  } else {
    productosVentaEdit.value = [];
  }

  estadoPagoEdit.value = venta.estado_pago || 'pagado';
  errorMessage.value = '';
  showModalEditarVenta.value = true;
};

const cerrarModalEditarVenta = () => {
  showModalEditarVenta.value = false;
  ventaEditando.value = null;
  productosVentaEdit.value = [];
  productoSeleccionadoEdit.value = null;
  cantidadProductoEdit.value = 1;
  precioProductoEdit.value = 0;
  estadoPagoEdit.value = 'pagado';
  errorMessage.value = '';
};

const agregarProductoEdit = () => {
  if (!productoSeleccionadoEdit.value) {
    errorMessage.value = 'Debes seleccionar un producto';
    return;
  }

  const producto = productosDisponibles.value.find(p => p.id === productoSeleccionadoEdit.value);
  if (!producto) {
    errorMessage.value = 'Producto no encontrado';
    return;
  }

  const precio = precioProductoEdit.value > 0 ? precioProductoEdit.value : producto.precio;
  const subtotal = precio * cantidadProductoEdit.value;

  productosVentaEdit.value.push({
    producto_id: productoSeleccionadoEdit.value,
    cantidad: cantidadProductoEdit.value,
    precio_unitario: precio,
    subtotal: subtotal,
    nombre: producto.nombre
  });

  productoSeleccionadoEdit.value = null;
  cantidadProductoEdit.value = 1;
  precioProductoEdit.value = 0;
  errorMessage.value = '';
};

const eliminarProductoEdit = (index: number) => {
  productosVentaEdit.value.splice(index, 1);
};

const guardarVentaEditada = async () => {
  if (!ventaEditando.value) return;

  if (productosVentaEdit.value.length === 0) {
    errorMessage.value = 'Debes agregar al menos un producto';
    return;
  }

  loading.value = true;
  errorMessage.value = '';

  try {
    const detalles = productosVentaEdit.value.map(p => ({
      producto_id: p.producto_id,
      cantidad: p.cantidad,
      precio_unitario: p.precio_unitario,
      subtotal: p.subtotal
    }));

    const total = productosVentaEdit.value.reduce((sum, item) => sum + item.subtotal, 0);

    const { error } = await updateVenta(ventaEditando.value.id, {
      total: total,
      estado_pago: estadoPagoEdit.value,
      detalles: detalles
    });

    if (error) {
      errorMessage.value = error.message;
      loading.value = false;
      return;
    }

    Swal.fire('Éxito', 'Venta actualizada correctamente', 'success');
    cerrarModalEditarVenta();
    await loadVentas();
    if (showDetalleModal.value && ventaDetalle.value?.id === ventaEditando.value.id) {
      showDetalleModal.value = false;
    }
  } catch (error: any) {
    errorMessage.value = error.message || 'Error al actualizar venta';
  } finally {
    loading.value = false;
  }
};

const eliminarVenta = async (venta: Venta) => {
  if (!isSuperadmin.value) {
    Swal.fire('Error', 'Solo el superadmin puede eliminar ventas', 'error');
    return;
  }

  const result = await Swal.fire({
    title: '¿Eliminar venta?',
    text: `¿Estás seguro de eliminar la venta #${venta.id}? Esta acción no se puede deshacer.`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#dc3545'
  });

  if (result.isConfirmed) {
    const { error } = await deleteVenta(venta.id);
    if (error) {
      Swal.fire('Error', error.message, 'error');
    } else {
      Swal.fire('Éxito', 'Venta eliminada correctamente', 'success');
      await loadVentas();
      if (showDetalleModal.value && ventaDetalle.value?.id === venta.id) {
        showDetalleModal.value = false;
      }
    }
  }
};

const editarPagoMembresia = (pago: PagoMembresia) => {
  pagoEditando.value = pago;
  formPagoEdit.value = {
    fecha_pago: pago.fecha_pago.includes('T') ? pago.fecha_pago.split('T')[0] : pago.fecha_pago,
    monto: pago.monto,
    mes_pagado: pago.mes_pagado,
    metodo_pago: pago.metodo_pago || '',
    notas: pago.notas || ''
  };
  showModalEditarPago.value = true;
};

const eliminarPagoMembresia = async (pago: PagoMembresia) => {
  if (!isSuperadmin.value) {
    Swal.fire('Error', 'Solo el superadmin puede eliminar pagos de membresías', 'error');
    return;
  }

  const result = await Swal.fire({
    title: '¿Eliminar pago?',
    text: `¿Estás seguro de eliminar este pago de $${pago.monto.toFixed(2)}? Esta acción no se puede deshacer.`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#dc3545'
  });

  if (result.isConfirmed) {
    const { error } = await deletePagoMembresia(pago.id);
    if (error) {
      Swal.fire('Error', error.message, 'error');
    } else {
      Swal.fire('Éxito', 'Pago eliminado correctamente', 'success');
      await loadVentas();
      if (showDetalleMembresiaModal.value && pagoMembresiaDetalle.value?.id === pago.id) {
        showDetalleMembresiaModal.value = false;
      }
    }
  }
};

const cerrarModalEditarPago = () => {
  showModalEditarPago.value = false;
  pagoEditando.value = null;
  formPagoEdit.value = {
    fecha_pago: '',
    monto: 0,
    mes_pagado: '',
    metodo_pago: '',
    notas: ''
  };
  errorMessage.value = '';
};

const guardarPagoEditado = async () => {
  if (!pagoEditando.value) return;

  loading.value = true;
  errorMessage.value = '';

  try {
    // Convertir fecha_pago a formato con hora si es necesario
    let fechaPago = formPagoEdit.value.fecha_pago;
    if (!fechaPago.includes('T')) {
      fechaPago = getFechaHoraActualLocal();
    }

    const { error } = await updatePagoMembresia(pagoEditando.value.id, {
      fecha_pago: fechaPago,
      monto: formPagoEdit.value.monto,
      mes_pagado: formPagoEdit.value.mes_pagado,
      metodo_pago: formPagoEdit.value.metodo_pago || null,
      notas: formPagoEdit.value.notas || null
    });

    if (error) {
      errorMessage.value = error.message;
      loading.value = false;
      return;
    }

    Swal.fire('Éxito', 'Pago actualizado correctamente', 'success');
    cerrarModalEditarPago();
    await loadVentas();
  } catch (error: any) {
    errorMessage.value = error.message || 'Error al actualizar pago';
  } finally {
    loading.value = false;
  }
};

</script>
