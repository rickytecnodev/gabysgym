<template>
  <div class="bg-light min-vh-100">
    <div class="container-fluid py-2">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h1 class="h3 mb-0">Ventas</h1>
        <button @click="showModal = true" class="btn btn-primary">
          <i class="fa-solid fa-plus me-1"></i>
          Nueva Venta
        </button>
      </div>

      <!-- Tabs y Tablas de ventas -->
      <TabsVentas :tab-activo="tabActivo" @cambiar-tab="tabActivo = $event"> <!-- Filtros -->

        <template #productos>
          <FiltrosVentas v-model:filtro-sucursal="filtroSucursal" v-model:filtro-fecha-desde="filtroFechaDesde"
            v-model:filtro-fecha-hasta="filtroFechaHasta" v-model:filtro-estado="filtroEstado"
            :periodo-activo="periodoActivo" :sucursales="sucursales" :is-superadmin="isSuperadmin"
            :tab-activo="tabActivo" @aplicar-periodo="aplicarPeriodo" @limpiar-periodo="limpiarPeriodo" />
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
          <FiltrosVentas v-model:filtro-sucursal="filtroSucursal" v-model:filtro-fecha-desde="filtroFechaDesde"
            v-model:filtro-fecha-hasta="filtroFechaHasta" v-model:filtro-estado="filtroEstado"
            :periodo-activo="periodoActivo" :sucursales="sucursales" :is-superadmin="isSuperadmin"
            :tab-activo="tabActivo" @aplicar-periodo="aplicarPeriodo" @limpiar-periodo="limpiarPeriodo" />
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
      <GymModal v-model:show="showModal" title="Nueva Venta" size="lg">
        <ModalNuevaVenta v-model:sucursal-id="sucursalSeleccionada" v-model:producto-id="productoSeleccionado"
          v-model:cantidad="cantidadProducto" :form="formVenta" :sucursales="sucursales"
          :clientes-filtrados="clientesFiltrados" :productos-disponibles="productosDisponibles"
          :productos-venta="productosVenta" :total-venta="totalVenta" :is-superadmin="isSuperadmin"
          :error-message="errorMessage" @submit="guardarVenta" @agregar-producto="agregarProducto"
          @quitar-producto="quitarProducto" />
        <template #footer>
          <button type="button" class="btn btn-secondary" @click="cerrarModal">Cancelar</button>
          <button type="submit" form="formVenta" class="btn btn-primary"
            :disabled="loading || productosVenta.length === 0">
            <span v-if="loading" class="spinner-border spinner-border-sm me-1"></span>
            Guardar Venta
          </button>
        </template>
      </GymModal>

      <!-- Modal de detalle de venta -->
      <GymModal v-model:show="showDetalleModal" :title="'Detalle de Venta #' + (ventaDetalle?.id ?? '')">
        <ModalDetalleVenta :venta="ventaDetalle" />
        <template #footer>
          <button v-if="ventaDetalle?.estado_pago === 'pendiente'" @click="marcarPagadoDesdeDetalle"
            class="btn btn-success me-2">
            <i class="fa-solid fa-check me-1"></i>
            Marcar como Pagado
          </button>
          <button type="button" class="btn btn-secondary" @click="showDetalleModal = false">Cerrar</button>
        </template>
      </GymModal>

      <!-- Modal de detalle de membresía pagada -->
      <GymModal v-model:show="showDetalleMembresiaModal" title="Detalle de Membresía" size="lg">
        <ModalDetalleMembresiaPago :pago="pagoMembresiaDetalle" />
        <template #footer>
          <button type="button" class="btn btn-secondary" @click="showDetalleMembresiaModal = false">Cerrar</button>
        </template>
      </GymModal>

      <!-- Modal de editar pago de membresía -->
      <GymModal v-model:show="showModalEditarPago" title="Editar Pago de Membresía">
        <ModalEditarPago :form="formPagoEdit" :error-message="errorMessage" @submit="guardarPagoEditado" />
        <template #footer>
          <button type="button" class="btn btn-secondary" @click="cerrarModalEditarPago">Cancelar</button>
          <button type="submit" form="formPagoEdit" class="btn btn-primary" :disabled="loading">
            <span v-if="loading" class="spinner-border spinner-border-sm me-1"></span>
            Guardar
          </button>
        </template>
      </GymModal>

      <!-- Modal de editar venta -->
      <GymModal v-model:show="showModalEditarVenta" :title="'Editar Venta #' + (ventaEditando?.id ?? '')" size="lg">
        <ModalEditarVenta v-model:producto-id="productoSeleccionadoEdit" v-model:cantidad="cantidadProductoEdit"
          v-model:precio="precioProductoEdit" v-model:estado-pago="estadoPagoEdit"
          :productos-disponibles="productosDisponibles" :productos-venta-edit="productosVentaEdit"
          :total-edit="productosVentaEdit.reduce((sum, item) => sum + item.subtotal, 0)" :error-message="errorMessage"
          @submit="guardarVentaEditada" @agregar-producto="agregarProductoEdit"
          @eliminar-producto="eliminarProductoEdit" />
        <template #footer>
          <button type="button" class="btn btn-secondary" @click="cerrarModalEditarVenta">Cancelar</button>
          <button type="submit" form="formVentaEdit" class="btn btn-primary" :disabled="loading">
            <span v-if="loading" class="spinner-border spinner-border-sm me-1"></span>
            Guardar Cambios
          </button>
        </template>
      </GymModal>
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
import GymModal from '@/components/GymModal.vue';
import FiltrosVentas from '@/components/ventas/FiltrosVentas.vue';
import TabsVentas from '@/components/ventas/TabsVentas.vue';
import TablaVentasProductos from '@/components/ventas/TablaVentasProductos.vue';
import TablaVentasProductosMobile from '@/components/ventas/TablaVentasProductosMobile.vue';
import TablaPagosMembresia from '@/components/ventas/TablaPagosMembresia.vue';
import TablaPagosMembresiaMobile from '@/components/ventas/TablaPagosMembresiaMobile.vue';
import ModalNuevaVenta from '@/components/ventas/modals/NuevaVenta.vue';
import ModalDetalleVenta from '@/components/ventas/modals/DetalleVenta.vue';
import ModalDetalleMembresiaPago from '@/components/ventas/modals/DetalleMembresiaPago.vue';
import ModalEditarPago from '@/components/ventas/modals/EditarPago.vue';
import ModalEditarVenta from '@/components/ventas/modals/EditarVenta.vue';

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
    if (filters.periodo === 'todos') {
      periodoActivo.value = '';
      filtroFechaDesde.value = '';
      filtroFechaHasta.value = '';
    } else if (filters.periodo) {
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
