<template>
  <div class="bg-light min-vh-100">
    <div class="container-fluid py-2">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h1 class="h3 mb-0">Clientes</h1>
        <button @click="abrirModalNuevo" class="btn btn-primary">
          <i class="fa-solid fa-plus me-1"></i>
          Nuevo Cliente
        </button>
      </div>

      <!-- Filtros -->
      <FiltrosClientes v-model:filtro-sucursal="filtroSucursal" v-model:busqueda="busqueda" :sucursales="sucursales"
        :is-superadmin="isSuperadmin" />

      <!-- Tabla de clientes (Desktop) -->
      <div class="d-none d-md-block">
        <TablaClientes :clientes="clientesFiltrados" :is-superadmin="isSuperadmin" :loading="loadingDataClientes"
          @ver-detalle="verDetalleCliente" @editar="editarCliente" @eliminar="eliminarCliente" />
      </div>

      <!-- Vista móvil de clientes (Mobile) -->
      <div class="d-block d-md-none">
        <TablaClientesMobile :clientes="clientesFiltrados" :is-superadmin="isSuperadmin" :loading="loadingDataClientes"
          @ver-detalle="verDetalleCliente" @editar="editarCliente" @eliminar="eliminarCliente" />
      </div>

      <!-- Modal de detalle de cliente -->
      <GymModal v-model:show="showDetalleModal" title="Detalle de Cliente" size="lg">
        <div v-if="clienteDetalle">
          <div class="row mb-3">
            <div class="col-md-6">
              <h6>Información Personal</h6>
              <p><strong>Nombre:</strong> {{ clienteDetalle.nombre_completo }}</p>
              <p><strong>Email:</strong> {{ clienteDetalle.email || 'N/A' }}</p>
              <p v-if="isSuperadmin"><strong>Sucursal:</strong> {{ clienteDetalle.sucursal?.nombre || 'N/A' }}</p>
            </div>
            <div class="col-md-6">
              <h6>Contacto</h6>
              <p>
                <i class="fa-solid fa-phone me-1"></i>
                <strong>Teléfono:</strong> {{ clienteDetalle.telefono }}
              </p>
              <p v-if="clienteDetalle.whatsapp">
                <i class="fa-brands fa-whatsapp me-1 text-success"></i>
                <strong>WhatsApp:</strong> {{ clienteDetalle.whatsapp }}
              </p>
              <p v-if="clienteDetalle.direccion">
                <i class="fa-solid fa-map-marker-alt me-1"></i>
                <strong>Dirección:</strong> {{ clienteDetalle.direccion }}
              </p>
            </div>
          </div>
          <hr>
          <h6>Membresías</h6>
          <div v-if="detalleMembresiaDisplay.badgeClass !== 'text-muted'">
            <span :class="['badge me-1', detalleMembresiaDisplay.badgeClass]">{{ detalleMembresiaDisplay.label }}</span>
            <span v-if="detalleMembresiaDisplay.subLabel" :class="['badge me-1', detalleMembresiaDisplay.subLabel === 'Por vencer' ? 'bg-warning text-dark' : 'bg-danger']">
              {{ detalleMembresiaDisplay.subLabel }}
            </span>
            <div v-if="detalleMembresiaDisplay.showVence && detalleMembresiaDisplay.fechaVence" class="mt-2">
              <strong>Próxima fecha de vencimiento:</strong> {{ formatFecha(detalleMembresiaDisplay.fechaVence) }}
            </div>
          </div>
          <p v-else class="text-muted">{{ detalleMembresiaDisplay.label }}</p>
        </div>
        <template #footer>
          <button @click="editarCliente(clienteDetalle!)" class="btn btn-sm btn-outline-primary me-1">
            <i class="fa-solid fa-edit me-1"></i>
            Editar Cliente
          </button>
          <button v-if="isSuperadmin" @click="eliminarCliente(clienteDetalle!)" class="btn btn-sm btn-outline-danger me-1">
            <i class="fa-solid fa-trash me-1"></i>
            Eliminar Cliente
          </button>
          <button type="button" class="btn btn-secondary" @click="showDetalleModal = false">Cerrar</button>
        </template>
      </GymModal>

      <!-- Modal de cliente (editar/crear) -->
      <GymModal v-model:show="showModal" :title="(clienteEditando ? 'Editar' : 'Nuevo') + ' Cliente'">
        <form id="formCliente" @submit.prevent="guardarCliente">
          <div class="mb-3">
            <label class="form-label">Nombre Completo *</label>
            <input v-model="formCliente.nombre_completo" type="text" class="form-control" required>
          </div>
          <div class="mb-3">
            <label class="form-label">Teléfono *</label>
            <input v-model="formCliente.telefono" type="tel" class="form-control" required>
          </div>
          <div class="mb-3">
            <label class="form-label">Email</label>
            <input v-model="formCliente.email" type="email" class="form-control">
          </div>
          <div class="mb-3">
            <label class="form-label">WhatsApp</label>
            <input v-model="formCliente.whatsapp" type="tel" class="form-control">
          </div>
          <div class="mb-3">
            <label class="form-label">Dirección</label>
            <textarea v-model="formCliente.direccion" class="form-control" rows="2"></textarea>
          </div>
          <div v-if="errorMessage" class="alert alert-danger">{{ errorMessage }}</div>
        </form>
        <template #footer>
          <button type="button" class="btn btn-secondary" @click="cerrarModal">Cancelar</button>
          <button type="submit" form="formCliente" class="btn btn-primary" :disabled="loading">
            <span v-if="loading" class="spinner-border spinner-border-sm me-1"></span>
            Guardar
          </button>
        </template>
      </GymModal>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useAuth } from '@/composables/useAuth';
import { useClientes } from '@/composables/useClientes';
import type { ClienteConMembresias } from '@/composables/useClientes';
import type { Cliente, ClienteForm } from '@/types/gym';
import GymModal from '@/components/GymModal.vue';
import FiltrosClientes from '@/components/clientes/FiltrosClientes.vue';
import TablaClientes from '@/components/clientes/TablaClientes.vue';
import TablaClientesMobile from '@/components/clientes/TablaClientesMobile.vue';
import { formatFecha } from '@/utils/dateFormatter';
import Swal from 'sweetalert2';

const { currentSucursalId, isSuperadmin } = useAuth();
const {
  clientes,
  sucursales,
  loadingData: loadingDataClientes,
  loadClientes: loadClientesFromComposable,
  loadSucursales,
  guardarCliente: guardarClienteFromComposable,
  eliminarCliente: eliminarClienteFromComposable
} = useClientes();

const showModal = ref(false);
const showDetalleModal = ref(false);
const clienteEditando = ref<Cliente | null>(null);
const clienteDetalle = ref<ClienteConMembresias | null>(null);
const loading = ref(false);
const errorMessage = ref('');
const busqueda = ref('');
const filtroSucursal = ref<number | null>(null);

const formCliente = ref<ClienteForm>({
  nombre_completo: '',
  telefono: '',
  email: '',
  whatsapp: '',
  direccion: ''
});

const clientesFiltrados = computed(() => {
  let filtrados = clientes.value;

  // Filtrar por búsqueda
  if (busqueda.value) {
    const busquedaLower = busqueda.value.toLowerCase();
    filtrados = filtrados.filter(c =>
      c.nombre_completo?.toLowerCase().includes(busquedaLower) ||
      c.telefono?.includes(busqueda.value) ||
      c.email?.toLowerCase().includes(busquedaLower) ||
      c.whatsapp?.includes(busqueda.value)
    );
  }

  return filtrados;
});

function normalizarFecha(fecha: unknown): string | null {
  if (!fecha) return null;
  try {
    if (typeof fecha === 'string') {
      const s = fecha.trim();
      if (s.includes('T')) return s.split('T')[0];
      if (s.includes(' ')) return s.split(' ')[0];
      if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
    }
    const d = new Date(fecha as string);
    if (!isNaN(d.getTime())) {
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }
  } catch (_) {}
  return null;
}

function getMembresiaDisplay(cliente: ClienteConMembresias | null): { label: string; badgeClass: string; subLabel?: string; showVence?: boolean; fechaVence?: string | null } {
  if (!cliente) return { label: 'Sin membresías', badgeClass: 'text-muted' };
  const estado = cliente.estado_membresia_display ?? null;
  if (estado === null) return { label: 'Sin membresías', badgeClass: 'text-muted' };
  if (estado === 'cancelada') return { label: 'Cancelada', badgeClass: 'bg-secondary' };
  if (estado === 'vencida') return { label: 'Vencida', badgeClass: 'bg-danger' };
  const n = cliente.membresias_activas ?? 0;
  const f = normalizarFecha(cliente.fecha_vencimiento_activa);
  let subLabel: string | undefined;
  if (f) {
    const hoy = new Date().toISOString().split('T')[0];
    const dias = Math.floor((new Date(f + 'T00:00:00').getTime() - new Date(hoy + 'T00:00:00').getTime()) / (1000 * 60 * 60 * 24));
    if (dias < 0) subLabel = 'Vencida';
    else if (dias <= 7) subLabel = 'Por vencer';
  }
  return {
    label: n > 0 ? `${n} activa(s)` : 'Activa',
    badgeClass: 'bg-success',
    subLabel,
    showVence: !!f,
    fechaVence: cliente.fecha_vencimiento_activa ?? null
  };
}

const detalleMembresiaDisplay = computed(() => getMembresiaDisplay(clienteDetalle.value));

watch(filtroSucursal, () => {
  loadClientes();
});

onMounted(async () => {
  const sucursalId = isSuperadmin.value ? (filtroSucursal.value || null) : currentSucursalId.value;
  await loadClientesFromComposable(sucursalId);
  if (isSuperadmin.value) {
    await loadSucursales();
  }
});

const loadClientes = async () => {
  const sucursalId = isSuperadmin.value ? (filtroSucursal.value || null) : currentSucursalId.value;
  await loadClientesFromComposable(sucursalId);
};

const abrirModalNuevo = () => {
  clienteEditando.value = null;
  formCliente.value = {
    nombre_completo: '',
    telefono: '',
    email: '',
    whatsapp: '',
    direccion: ''
  };
  errorMessage.value = '';
  showModal.value = true;
};

const verDetalleCliente = (cliente: Cliente) => {
  clienteDetalle.value = cliente;
  showDetalleModal.value = true;
};

const editarCliente = (cliente: Cliente) => {
  showDetalleModal.value = false;
  clienteEditando.value = cliente;
  formCliente.value = {
    nombre_completo: cliente.nombre_completo || '',
    telefono: cliente.telefono || '',
    email: cliente.email || '',
    whatsapp: cliente.whatsapp || '',
    direccion: cliente.direccion || ''
  };
  errorMessage.value = '';
  showModal.value = true;
};

const cerrarModal = () => {
  showModal.value = false;
  clienteEditando.value = null;
  formCliente.value = {
    nombre_completo: '',
    telefono: '',
    email: '',
    whatsapp: '',
    direccion: ''
  };
  errorMessage.value = '';
};

const guardarCliente = async () => {
  if (!currentSucursalId.value && !isSuperadmin.value) {
    errorMessage.value = 'Debes estar asignado a una sucursal';
    return;
  }

  loading.value = true;
  errorMessage.value = '';

  const sucursalId = currentSucursalId.value!;
  const result = await guardarClienteFromComposable(
    formCliente.value,
    sucursalId,
    clienteEditando.value?.id
  );

  if (result?.error) {
    errorMessage.value = result.error.message;
    loading.value = false;
    return;
  }

  if (result?.success) {
    cerrarModal();
    await loadClientes();
  }

  loading.value = false;
};

const eliminarCliente = async (cliente: Cliente) => {
  if (!isSuperadmin.value) {
    Swal.fire('Error', 'Solo el superadmin puede eliminar clientes', 'error');
    return;
  }

  const result = await eliminarClienteFromComposable(cliente);
  if (result?.success) {
    if (showDetalleModal.value && clienteDetalle.value?.id === cliente.id) {
      showDetalleModal.value = false;
    }
    await loadClientes();
  }
};

// formatFecha ahora viene de @/utils/dateFormatter
</script>
