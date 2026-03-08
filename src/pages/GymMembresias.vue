<template>
  <div class="bg-light min-vh-100">
    <div class="container-fluid py-2">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h1 class="h3 mb-0">Membresías</h1>
        <button @click="showModal = true" class="btn btn-primary">
          <i class="fa-solid fa-plus me-1"></i>
          Nueva Membresía
        </button>
      </div>

      <!-- Filtros -->
      <FiltrosMembresias v-model:filtro-sucursal="filtroSucursal" v-model:filtro-fecha-desde="filtroFechaDesde"
        v-model:filtro-fecha-hasta="filtroFechaHasta" v-model:filtro-estado="filtroEstado"
        :periodo-activo="periodoActivo" :filtro-cliente-id="filtroClienteId"
        :nombre-cliente="getNombreCliente(filtroClienteId)" :sucursales="sucursales" :is-superadmin="isSuperadmin"
        @aplicar-periodo="aplicarPeriodo" @limpiar-periodo="limpiarPeriodo"
        @limpiar-filtro-cliente="limpiarFiltroCliente" @actualizar-estados="actualizarEstados" />


      <!-- Tabla de membresías (Desktop) -->
      <div class="d-none d-md-block">
        <TablaMembresias :membresias="membresiasFiltradas" :is-superadmin="isSuperadmin"
          :filtro-sucursal="filtroSucursal" :loading="loadingDataMembresias" @ver-detalle="verDetalle"
          @registrar-pago="registrarPago" @enviar-recordatorio="enviarRecordatorio" @cancelar="cancelarMembresia"
          @reactivar="reactivarMembresia" @editar-fechas="editarFechas" @editar-cliente="editarCliente"
          @eliminar="eliminarMembresia" />
      </div>

      <!-- Vista móvil de membresías (Mobile) -->
      <div class="d-block d-md-none">
        <TablaMembresiasMobile :membresias="membresiasFiltradas" :is-superadmin="isSuperadmin"
          :filtro-sucursal="filtroSucursal" :loading="loadingDataMembresias" @ver-detalle="verDetalle"
          @registrar-pago="registrarPago" @enviar-recordatorio="enviarRecordatorio" @cancelar="cancelarMembresia"
          @reactivar="reactivarMembresia" @editar-fechas="editarFechas" @editar-cliente="editarCliente"
          @eliminar="eliminarMembresia" />
      </div>

      <!-- Modal de nueva membresía -->
      <GymModal v-model:show="showModal" title="Nueva Membresía">
        <ModalNuevaMembresia v-model:sucursal-id="sucursalSeleccionada" :form="formMembresia" :sucursales="sucursales"
          :clientes="clientes" :tipos-membresia="tiposMembresia" :is-superadmin="isSuperadmin" :loading="loading"
          :error-message="errorMessage" @submit="guardarMembresia" @change-tipo="onTipoMembresiaChange" />
        <template #footer>
          <button type="button" class="btn btn-secondary" @click="cerrarModal">Cancelar</button>
          <button type="submit" form="formMembresia" class="btn btn-primary" :disabled="loading">
            <span v-if="loading" class="spinner-border spinner-border-sm me-1"></span>
            Guardar
          </button>
        </template>
      </GymModal>

      <!-- Modal de detalle -->
      <GymModal v-model:show="showDetalleModal" title="Detalle de Membresía" size="lg">
        <ModalDetalleMembresia :membresia="membresiaDetalle" :pagos="pagosMembresia" :is-superadmin="isSuperadmin"
          @registrar-pago="registrarPago" @enviar-whatsapp="(m) => enviarRecordatorio(m)" @cancelar="cancelarMembresia"
          @reactivar="reactivarMembresia" @editar-fechas="editarFechas" @eliminar="eliminarMembresia" />
        <template #footer>
          <button type="button" class="btn btn-secondary" @click="showDetalleModal = false">Cerrar</button>
        </template>
      </GymModal>

      <!-- Modal de registrar pago -->
      <GymModal v-model:show="showPagoModal" title="Registrar Pago de Membresía">
        <ModalRegistrarPago v-model:extender-vencimiento="extenderVencimiento" :form="formPago"
          :membresia="membresiaPago" :error-message="errorMessagePago" @submit="guardarPago" />
        <template #footer>
          <button type="button" class="btn btn-secondary" @click="cerrarPagoModal">Cancelar</button>
          <button type="submit" form="formPago" class="btn btn-primary" :disabled="loadingPago">
            <span v-if="loadingPago" class="spinner-border spinner-border-sm me-1"></span>
            Registrar Pago
          </button>
        </template>
      </GymModal>

      <!-- Modal de editar fechas -->
      <GymModal v-model:show="showFechasModal" title="Editar Fechas de Membresía">
        <ModalEditarFechas :form="formFechas" :membresia="membresiaEditandoFechas" :error-message="errorMessageFechas"
          @submit="guardarFechas" />
        <template #footer>
          <button type="button" class="btn btn-secondary" @click="cerrarFechasModal">Cancelar</button>
          <button type="submit" form="formFechas" class="btn btn-primary" :disabled="loadingFechas">
            <span v-if="loadingFechas" class="spinner-border spinner-border-sm me-1"></span>
            Guardar Cambios
          </button>
        </template>
      </GymModal>

      <!-- Modal de editar cliente -->
      <GymModal v-model:show="showClienteModal" title="Editar Cliente">
        <ModalEditarCliente :form="formCliente" :error-message="errorMessageCliente" @submit="guardarCliente" />
        <template #footer>
          <button type="button" class="btn btn-secondary" @click="cerrarClienteModal">Cancelar</button>
          <button type="submit" form="formClienteMembresias" class="btn btn-primary" :disabled="loadingCliente">
            <span v-if="loadingCliente" class="spinner-border spinner-border-sm me-1"></span>
            Guardar
          </button>
        </template>
      </GymModal>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import {
  fetchMembresias,
  createMembresia,
  updateMembresiaEstado,
  fetchPagosMembresia,
  createPagoMembresia,
  updateCliente,
  updateMembresiaFechas
} from '@/services/gymApi';
import { getWhatsAppRecordatorioUrl } from '@/utils/gymWhatsappService';
import { useAuth } from '@/composables/useAuth';
import { useGymFilters } from '@/composables/useGymFilters';
import { useMembresias } from '@/composables/useMembresias';
import { supabase } from '@/utils/supabase';
import type { Membresia, Cliente, MembresiaForm } from '@/types/gym';
import Swal from 'sweetalert2';
import { getFechaActualLocal, getFechaHoraActualLocal } from '@/utils/dateFormatter';
import GymModal from '@/components/GymModal.vue';
import FiltrosMembresias from '@/components/membresias/FiltrosMembresias.vue';
import TablaMembresias from '@/components/membresias/TablaMembresias.vue';
import TablaMembresiasMobile from '@/components/membresias/TablaMembresiasMobile.vue';
import ModalNuevaMembresia from '@/components/membresias/modals/NuevaMembresia.vue';
import ModalDetalleMembresia from '@/components/membresias/modals/DetalleMembresia.vue';
import ModalRegistrarPago from '@/components/membresias/modals/RegistrarPago.vue';
import ModalEditarFechas from '@/components/membresias/modals/EditarFechas.vue';
import ModalEditarCliente from '@/components/membresias/modals/EditarCliente.vue';

const { currentSucursalId, currentUser, isSuperadmin } = useAuth();
const { getFilters, clearFilters } = useGymFilters();
const {
  membresias,
  clientes,
  tiposMembresia,
  pagosMembresia,
  sucursales,
  loadingData: loadingDataMembresias,
  normalizarFecha,
  loadMembresias: loadMembresiasFromComposable,
  loadSucursales,
  loadClientes,
  loadTiposMembresia,
  loadPagosMembresia,
  actualizarEstados: actualizarEstadosFromComposable,
  cancelarMembresia: cancelarMembresiaFromComposable,
  reactivarMembresia: reactivarMembresiaFromComposable,
  eliminarMembresia: eliminarMembresiaFromComposable
} = useMembresias();

const showModal = ref(false);
const showDetalleModal = ref(false);
const showClienteModal = ref(false);
const showPagoModal = ref(false);
const showFechasModal = ref(false);
const membresiaDetalle = ref<Membresia | null>(null);
const membresiaPago = ref<Membresia | null>(null);
const membresiaEditandoFechas = ref<Membresia | null>(null);
const clienteEditando = ref<Cliente | null>(null);
const loading = ref(false);
const loadingCliente = ref(false);
const loadingPago = ref(false);
const loadingFechas = ref(false);
const errorMessage = ref('');
const errorMessageFechas = ref('');
const errorMessageCliente = ref('');
const errorMessagePago = ref('');
const extenderVencimiento = ref(true);
const filtroEstado = ref('');
const filtroFechaDesde = ref('');
const filtroFechaHasta = ref('');
const filtroSucursal = ref<number | null>(null);
const periodoActivo = ref<string>('');
const filtroClienteId = ref<number | null>(null);
const sucursalSeleccionada = ref<number | null>(null);

const formMembresia = ref<MembresiaForm & { fecha_vencimiento?: string }>({
  cliente_id: 0,
  tipo_membresia_id: 0,
  fecha_inicio: getFechaActualLocal(),
  precio_mensual: 0,
  fecha_vencimiento: ''
});

const formCliente = ref({
  nombre_completo: '',
  telefono: '',
  email: '',
  whatsapp: '',
  direccion: ''
});

const formPago = ref({
  membresia_id: 0,
  fecha_pago: getFechaActualLocal(),
  mes_pagado: new Date().toISOString().slice(0, 7),
  monto: 0,
  metodo_pago: '',
  notas: ''
});

const formFechas = ref({
  fecha_inicio: '',
  fecha_vencimiento: ''
});

// La función normalizarFecha ahora viene del composable

const membresiasFiltradas = computed(() => {
  let filtradas = [...membresias.value];

  // Filtro por estado
  if (filtroEstado.value) {
    filtradas = filtradas.filter(m => m.estado === filtroEstado.value);
  }

  // Filtro por cliente
  if (filtroClienteId.value) {
    filtradas = filtradas.filter(m => m.cliente_id === filtroClienteId.value);
  }

  // Filtro por rango de fechas (fecha de vencimiento)
  if (filtroFechaDesde.value || filtroFechaHasta.value) {
    filtradas = filtradas.filter(m => {
      // Normalizar fecha de vencimiento
      const fechaVencimientoStr = normalizarFecha(m.fecha_vencimiento);
      if (!fechaVencimientoStr) {
        return false; // Si no se puede normalizar, excluir
      }

      // Normalizar filtros
      const fechaDesdeStr = filtroFechaDesde.value ? normalizarFecha(filtroFechaDesde.value) : null;
      const fechaHastaStr = filtroFechaHasta.value ? normalizarFecha(filtroFechaHasta.value) : null;

      // Comparar como strings (YYYY-MM-DD)
      // La comparación lexicográfica funciona porque el formato es YYYY-MM-DD

      // Si hay filtro "desde", excluir fechas anteriores
      if (fechaDesdeStr && fechaVencimientoStr < fechaDesdeStr) {
        return false;
      }

      // Si hay filtro "hasta", excluir fechas posteriores (pero incluir las iguales)
      if (fechaHastaStr && fechaVencimientoStr > fechaHastaStr) {
        return false;
      }

      // Si llegamos aquí, la fecha está en el rango (inclusivo en ambos extremos)
      return true;
    });
  }

  return filtradas.sort((a, b) => {
    const fechaA = new Date(a.fecha_vencimiento).getTime();
    const fechaB = new Date(b.fecha_vencimiento).getTime();
    return fechaA - fechaB;
  });
});

// Watchers para hacer los filtros reactivos
// Solo recargar del servidor cuando cambia la sucursal (necesita datos diferentes)
watch(filtroSucursal, () => {
  loadMembresias();
});

// Los filtros de estado, fechas y cliente se hacen en el cliente (computed)
// No necesitamos recargar del servidor para estos filtros

watch(filtroSucursal, () => {
  if (isSuperadmin.value) {
    const sucursalId = filtroSucursal.value || null;
    loadClientes(sucursalId);
  }
});

// Watchers para calcular fecha de vencimiento automáticamente
watch([() => formMembresia.value.fecha_inicio, () => formMembresia.value.tipo_membresia_id], () => {
  if (formMembresia.value.fecha_inicio && formMembresia.value.tipo_membresia_id && formMembresia.value.tipo_membresia_id > 0) {
    calcularPrecio();
  }
});

onMounted(async () => {
  // Leer filtros desde el composable
  const filters = getFilters();

  if (filters) {
    if (filters.estado) {
      filtroEstado.value = filters.estado;
    }

    if (filters.clienteId) {
      filtroClienteId.value = filters.clienteId;
    }

    if (filters.fechaDesde && filters.fechaHasta) {
      filtroFechaDesde.value = filters.fechaDesde;
      filtroFechaHasta.value = filters.fechaHasta;
    } else if (filters.periodo) {
      periodoActivo.value = filters.periodo;
      aplicarPeriodo(filters.periodo);
    }

    // Limpiar filtros después de usarlos
    clearFilters();
  }

  await loadMembresias();
  const sucursalId = isSuperadmin.value ? null : currentSucursalId.value;
  await loadClientes(sucursalId);
  await loadTiposMembresia();

  if (isSuperadmin.value) {
    await loadSucursales();
  }

  // Actualizar estados silenciosamente al cargar (sin mostrar alerta)
  await actualizarEstadosFromComposable(false);
  await loadMembresias();
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
    case 'siguiente-semana':
      desde = new Date(hoy);
      hasta = new Date(hoy);
      hasta.setDate(hoy.getDate() + 7); // Hoy + 7 días
      hasta.setHours(23, 59, 59, 999);
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

    // No recargar del servidor, el filtro se aplica en el cliente
  }
};

const limpiarPeriodo = () => {
  periodoActivo.value = '';
  filtroFechaDesde.value = '';
  filtroFechaHasta.value = '';
  // No recargar del servidor, solo limpiar filtros
};

const limpiarFiltroCliente = () => {
  filtroClienteId.value = null;
  // No recargar del servidor, solo limpiar filtro
};

const getNombreCliente = (clienteId: number | null): string => {
  if (!clienteId) return '';
  const cliente = clientes.value.find(c => c.id === clienteId);
  if (cliente) return cliente.nombre_completo || '';
  // Si no está en la lista de clientes, buscar en las membresías
  const membresia = membresias.value.find(m => m.cliente_id === clienteId);
  return membresia?.cliente?.nombre_completo || '';
};

const loadMembresias = async () => {
  const sucursalId = isSuperadmin.value
    ? (filtroSucursal.value || null)
    : currentSucursalId.value;

  // Cargar todas las membresías de la sucursal (sin filtros de estado/cliente)
  // Los filtros se aplican en el cliente mediante el computed
  await loadMembresiasFromComposable(
    sucursalId,
    undefined, // No filtrar por estado en el servidor
    undefined  // No filtrar por cliente en el servidor
  );
};

const onTipoMembresiaChange = () => {
  if (formMembresia.value.tipo_membresia_id > 0) {
    calcularPrecio();
  }
};

const calcularPrecio = () => {
  const tipo = tiposMembresia.value.find(t => t.id === formMembresia.value.tipo_membresia_id);
  if (tipo) {
    formMembresia.value.precio_mensual = tipo.precio_mensual;
    // Calcular la fecha de vencimiento automáticamente, pero el usuario puede editarla
    if (formMembresia.value.fecha_inicio) {
      const fechaInicio = new Date(formMembresia.value.fecha_inicio);
      const fechaVencimiento = new Date(fechaInicio);
      fechaVencimiento.setDate(fechaVencimiento.getDate() + tipo.duracion_dias);
      formMembresia.value.fecha_vencimiento = fechaVencimiento.toISOString().split('T')[0];
    }
  }
};

const actualizarEstados = async (mostrarMensaje = true) => {
  await actualizarEstadosFromComposable(mostrarMensaje);
  await loadMembresias();
};

const cerrarModal = () => {
  showModal.value = false;
  sucursalSeleccionada.value = null;
  formMembresia.value = {
    cliente_id: 0,
    tipo_membresia_id: 0,
    fecha_inicio: getFechaActualLocal(),
    precio_mensual: 0,
    fecha_vencimiento: '' as string
  };
  errorMessage.value = '';
};

const guardarMembresia = async () => {
  // Determinar la sucursal a usar
  const sucursalId = isSuperadmin.value
    ? sucursalSeleccionada.value
    : currentSucursalId.value;

  if (!sucursalId) {
    errorMessage.value = isSuperadmin.value
      ? 'Debes seleccionar una sucursal'
      : 'Debes estar asignado a una sucursal';
    return;
  }

  // Validar que tenga tipo de membresía y fecha de vencimiento
  if (!formMembresia.value.tipo_membresia_id) {
    errorMessage.value = 'Debes seleccionar un tipo de membresía';
    return;
  }

  if (!formMembresia.value.fecha_vencimiento) {
    errorMessage.value = 'Debes ingresar la fecha de vencimiento';
    return;
  }

  loading.value = true;
  errorMessage.value = '';

  try {
    // Usar la fecha de vencimiento del formulario (siempre editable)
    const fechaVencimiento = formMembresia.value.fecha_vencimiento;

    if (!fechaVencimiento) {
      errorMessage.value = 'Debes ingresar la fecha de vencimiento';
      loading.value = false;
      return;
    }

    // Usar el tipo de membresía seleccionado
    const tipoMembresiaId = formMembresia.value.tipo_membresia_id;

    if (!tipoMembresiaId) {
      errorMessage.value = 'Error: no hay tipos de membresía disponibles';
      loading.value = false;
      return;
    }

    const { data: membresiaCreada, error } = await createMembresia({
      cliente_id: formMembresia.value.cliente_id,
      tipo_membresia_id: tipoMembresiaId,
      fecha_inicio: formMembresia.value.fecha_inicio,
      precio_mensual: formMembresia.value.precio_mensual,
      fecha_vencimiento: fechaVencimiento,
      sucursal_id: sucursalId
    });

    if (error) {
      errorMessage.value = error.message;
      return;
    }

    // Crear el pago inicial automáticamente
    if (membresiaCreada && currentUser.value) {
      const fechaInicio = new Date(formMembresia.value.fecha_inicio);
      const mesPagado = `${fechaInicio.getFullYear()}-${String(fechaInicio.getMonth() + 1).padStart(2, '0')}`;

      const { error: pagoError } = await createPagoMembresia({
        membresia_id: membresiaCreada.id,
        fecha_pago: getFechaHoraActualLocal(),
        monto: formMembresia.value.precio_mensual,
        mes_pagado: mesPagado,
        metodo_pago: 'efectivo',
        notas: 'Pago inicial de membresía',
        empleado_id: currentUser.value.id
      });

      if (pagoError) {
        console.error('Error al crear pago inicial:', pagoError);
        // No fallar la creación de la membresía si falla el pago, solo mostrar advertencia
        Swal.fire('Advertencia', 'Membresía creada pero no se pudo registrar el pago inicial', 'warning');
      }
    }

    Swal.fire('Éxito', 'Membresía creada correctamente', 'success');
    cerrarModal();
    loadMembresias();
  } catch (error: any) {
    errorMessage.value = error.message || 'Error al guardar membresía';
  } finally {
    loading.value = false;
  }
};

const verDetalle = async (membresia: Membresia) => {
  membresiaDetalle.value = membresia;
  await loadPagosMembresia(membresia.id);
  showDetalleModal.value = true;
};

const cancelarMembresia = async (id: number) => {
  const result = await cancelarMembresiaFromComposable(id);
  if (result?.success) {
    await loadMembresias();
  }
};

const reactivarMembresia = async (membresia: Membresia) => {
  const result = await reactivarMembresiaFromComposable(membresia);
  if (result?.success) {
    await loadMembresias();

    // Si el modal de detalle está abierto, actualizar
    if (showDetalleModal.value && membresiaDetalle.value?.id === membresia.id) {
      membresiaDetalle.value.estado = 'activa';
    }
  }
};

const enviarRecordatorio = (membresia: Membresia) => {
  if (!membresia.cliente?.whatsapp) {
    Swal.fire('Error', 'El cliente no tiene WhatsApp registrado', 'error');
    return;
  }

  const url = getWhatsAppRecordatorioUrl(membresia);
  if (url) {
    window.open(url, '_blank');
  }
};

const editarFechas = (membresia: Membresia) => {
  membresiaEditandoFechas.value = membresia;
  // Manejar formato de fecha (puede venir como ISO string o solo fecha)
  const fechaInicio = membresia.fecha_inicio.includes('T')
    ? membresia.fecha_inicio.split('T')[0]
    : membresia.fecha_inicio;
  const fechaVencimiento = membresia.fecha_vencimiento.includes('T')
    ? membresia.fecha_vencimiento.split('T')[0]
    : membresia.fecha_vencimiento;

  formFechas.value = {
    fecha_inicio: fechaInicio,
    fecha_vencimiento: fechaVencimiento
  };
  showFechasModal.value = true;
};

const cerrarFechasModal = () => {
  showFechasModal.value = false;
  membresiaEditandoFechas.value = null;
  formFechas.value = {
    fecha_inicio: '',
    fecha_vencimiento: ''
  };
  errorMessageFechas.value = '';
};

const guardarFechas = async () => {
  if (!membresiaEditandoFechas.value) {
    errorMessageFechas.value = 'Error: membresía no seleccionada';
    return;
  }

  if (!currentUser.value) {
    errorMessageFechas.value = 'Error de autenticación';
    return;
  }

  loadingFechas.value = true;
  errorMessageFechas.value = '';

  try {
    // Calcular el nuevo estado basado en la fecha de vencimiento
    const fechaVencimiento = new Date(formFechas.value.fecha_vencimiento);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    fechaVencimiento.setHours(0, 0, 0, 0);

    let nuevoEstado: 'activa' | 'vencida' | 'cancelada' | null = null;
    let mensajeEstado = '';

    // Determinar el nuevo estado según la fecha de vencimiento
    if (fechaVencimiento < hoy) {
      // Si la fecha es pasada, debe estar vencida (a menos que esté cancelada)
      if (membresiaEditandoFechas.value.estado !== 'cancelada') {
        nuevoEstado = 'vencida';
        mensajeEstado = ' y marcada como vencida';
      }
    } else {
      // Si la fecha es futura o hoy
      if (membresiaEditandoFechas.value.estado === 'cancelada' ||
        membresiaEditandoFechas.value.estado === 'vencida') {
        // Si estaba cancelada o vencida y ahora tiene fecha futura, reactivar
        nuevoEstado = 'activa';
        mensajeEstado = ' y reactivada';
      } else if (membresiaEditandoFechas.value.estado === 'activa') {
        // Si ya estaba activa y sigue con fecha futura, mantener activa
        nuevoEstado = 'activa';
      }
    }

    // Actualizar fechas
    const { error } = await updateMembresiaFechas(
      membresiaEditandoFechas.value.id,
      formFechas.value.fecha_inicio,
      formFechas.value.fecha_vencimiento
    );

    if (error) {
      errorMessageFechas.value = error.message;
      return;
    }

    // Actualizar el estado si es necesario
    if (nuevoEstado && nuevoEstado !== membresiaEditandoFechas.value.estado) {
      const { error: estadoError } = await updateMembresiaEstado(
        membresiaEditandoFechas.value.id,
        nuevoEstado
      );
      if (estadoError) {
        console.error('Error al actualizar estado:', estadoError);
        mensajeEstado = '';
      }
    }

    Swal.fire('Éxito', 'Fechas actualizadas correctamente' + mensajeEstado, 'success');
    cerrarFechasModal();
    loadMembresias();

    // Si el modal de detalle está abierto, actualizar la membresía
    if (showDetalleModal.value && membresiaDetalle.value?.id === membresiaEditandoFechas.value.id) {
      const { data } = await fetchMembresias(
        isSuperadmin.value ? null : currentSucursalId.value,
        undefined,
        undefined
      );
      if (data) {
        const membresiaActualizada = data.find(m => m.id === membresiaDetalle.value!.id);
        if (membresiaActualizada) {
          membresiaDetalle.value = membresiaActualizada;
        }
      }
    }
  } catch (error: any) {
    errorMessageFechas.value = error.message || 'Error al actualizar fechas';
  } finally {
    loadingFechas.value = false;
  }
};


// Las funciones getVencimientoClass y getRowClass ahora están en el componente TablaMembresias

const editarCliente = (cliente: Cliente) => {
  clienteEditando.value = cliente;
  formCliente.value = {
    nombre_completo: cliente.nombre_completo || '',
    telefono: cliente.telefono || '',
    email: cliente.email || '',
    whatsapp: cliente.whatsapp || '',
    direccion: cliente.direccion || ''
  };
  showClienteModal.value = true;
};

const cerrarClienteModal = () => {
  showClienteModal.value = false;
  clienteEditando.value = null;
  formCliente.value = {
    nombre_completo: '',
    telefono: '',
    email: '',
    whatsapp: '',
    direccion: ''
  };
  errorMessageCliente.value = '';
};

const guardarCliente = async () => {
  if (!clienteEditando.value) return;

  loadingCliente.value = true;
  errorMessageCliente.value = '';

  try {
    const { error } = await updateCliente(clienteEditando.value.id, formCliente.value);

    if (error) {
      errorMessageCliente.value = error.message;
      return;
    }

    Swal.fire('Éxito', 'Cliente actualizado correctamente', 'success');
    cerrarClienteModal();
    await loadMembresias();
    const sucursalId = isSuperadmin.value ? (filtroSucursal.value || null) : currentSucursalId.value;
    await loadClientes(sucursalId);
  } catch (error: any) {
    errorMessageCliente.value = error.message || 'Error al actualizar cliente';
  } finally {
    loadingCliente.value = false;
  }
};

const eliminarMembresia = async (membresia: Membresia) => {
  if (!isSuperadmin.value) {
    Swal.fire('Error', 'Solo el superadmin puede eliminar membresías', 'error');
    return;
  }

  const result = await eliminarMembresiaFromComposable(membresia);
  if (result?.success) {
    await loadMembresias();

    // Cerrar el modal de detalle si está abierto
    if (showDetalleModal.value && membresiaDetalle.value?.id === membresia.id) {
      showDetalleModal.value = false;
    }
  }
};

const registrarPago = (membresia: Membresia) => {
  membresiaPago.value = membresia;
  const hoy = new Date();
  formPago.value = {
    membresia_id: membresia.id,
    fecha_pago: getFechaActualLocal(),
    mes_pagado: hoy.toISOString().slice(0, 7),
    monto: membresia.precio_mensual || 0,
    metodo_pago: '',
    notas: ''
  };
  // Si está vencida, siempre extender. Si está activa, por defecto también extender
  extenderVencimiento.value = true;
  showPagoModal.value = true;
};

const cerrarPagoModal = () => {
  showPagoModal.value = false;
  membresiaPago.value = null;
  formPago.value = {
    membresia_id: 0,
    fecha_pago: getFechaActualLocal(),
    mes_pagado: new Date().toISOString().slice(0, 7),
    monto: 0,
    metodo_pago: '',
    notas: ''
  };
  errorMessagePago.value = '';
  extenderVencimiento.value = true;
};

const guardarPago = async () => {
  if (!currentUser.value) {
    errorMessagePago.value = 'Error de autenticación';
    return;
  }

  if (!membresiaPago.value) {
    errorMessagePago.value = 'Error: membresía no seleccionada';
    return;
  }

  loadingPago.value = true;
  errorMessagePago.value = '';

  try {
    // Crear el pago
    const { error: pagoError } = await createPagoMembresia({
      ...formPago.value,
      empleado_id: currentUser.value.id
    });

    if (pagoError) {
      errorMessagePago.value = pagoError.message;
      return;
    }

    // Si la membresía está vencida o cancelada, siempre reactivarla y extender
    // Si está activa, solo extender si está marcada la opción
    const debeExtender = membresiaPago.value.estado === 'vencida' ||
      membresiaPago.value.estado === 'cancelada' ||
      extenderVencimiento.value;

    if (debeExtender && membresiaPago.value.tipo_membresia) {
      const tipoMembresia = tiposMembresia.value.find(t => t.id === membresiaPago.value!.tipo_membresia_id);
      if (tipoMembresia) {
        let nuevaFechaVencimiento: Date;

        // Si está vencida o cancelada, calcular desde hoy. Si está activa, extender desde la fecha actual
        if (membresiaPago.value.estado === 'vencida' || membresiaPago.value.estado === 'cancelada') {
          nuevaFechaVencimiento = new Date();
          nuevaFechaVencimiento.setDate(nuevaFechaVencimiento.getDate() + tipoMembresia.duracion_dias);
        } else {
          const fechaVencimientoActual = new Date(membresiaPago.value.fecha_vencimiento);
          nuevaFechaVencimiento = new Date(fechaVencimientoActual);
          nuevaFechaVencimiento.setDate(nuevaFechaVencimiento.getDate() + tipoMembresia.duracion_dias);
        }

        // Actualizar la membresía: reactivar si está vencida o cancelada, o mantener activa
        const nuevoEstado = 'activa';
        const { error: updateError } = await updateMembresiaEstado(
          membresiaPago.value.id,
          nuevoEstado
        );

        if (updateError) {
          console.error('Error al actualizar estado:', updateError);
        } else {
          // Actualizar la fecha de vencimiento directamente en la base de datos
          const { error: fechaError } = await supabase
            .from('membresias')
            .update({
              fecha_vencimiento: nuevaFechaVencimiento.toISOString().split('T')[0],
              estado: nuevoEstado
            })
            .eq('id', membresiaPago.value.id);

          if (fechaError) {
            console.error('Error al actualizar fecha:', fechaError);
          }
        }
      }
    } else if (membresiaPago.value.estado === 'vencida' || membresiaPago.value.estado === 'cancelada') {
      // Si está vencida o cancelada pero no se extiende, solo reactivar
      await updateMembresiaEstado(membresiaPago.value.id, 'activa');
    }

    Swal.fire('Éxito', 'Pago registrado correctamente', 'success');
    cerrarPagoModal();
    loadMembresias();

    // Si el modal de detalle está abierto, recargar los pagos
    if (showDetalleModal.value && membresiaDetalle.value) {
      const { data } = await fetchPagosMembresia(membresiaDetalle.value.id);
      if (data) {
        pagosMembresia.value = data;
      }
    }
  } catch (error: any) {
    errorMessagePago.value = error.message || 'Error al registrar pago';
  } finally {
    loadingPago.value = false;
  }
};
</script>
