<template>
  <div class="bg-light min-vh-100">
    <GymNavbar />
    <div class="container-fluid py-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h1 class="h3 mb-0">Clientes</h1>
        <button @click="abrirModalNuevo" class="btn btn-primary">
          <i class="fa-solid fa-plus me-1"></i>
          Nuevo Cliente
        </button>
      </div>

      <!-- Filtros -->
      <FiltrosClientes
        v-model:filtro-sucursal="filtroSucursal"
        v-model:busqueda="busqueda"
        :sucursales="sucursales"
        :is-superadmin="isSuperadmin"
      />

      <!-- Tabla de clientes -->
      <TablaClientes
        :clientes="clientesFiltrados"
        :is-superadmin="isSuperadmin"
        :loading="loadingDataClientes"
        @ver-detalle="verDetalleCliente"
        @editar="editarCliente"
        @eliminar="eliminarCliente"
      />

      <!-- Modal de detalle de cliente -->
      <div v-if="showDetalleModal" class="modal show d-block" tabindex="-1" style="background-color: rgba(0,0,0,0.5)">
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Detalle de Cliente</h5>
              <button type="button" class="btn-close" @click="showDetalleModal = false"></button>
            </div>
            <div class="modal-body">
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
                <div v-if="(clienteDetalle as any).membresias_activas && (clienteDetalle as any).membresias_activas > 0">
                  <span class="badge bg-success me-1">
                    {{ (clienteDetalle as any).membresias_activas }} activa(s)
                  </span>
                  <div v-if="(clienteDetalle as any).fecha_vencimiento_activa" class="mt-2">
                    <strong>Próxima fecha de vencimiento:</strong> {{ formatFecha((clienteDetalle as any).fecha_vencimiento_activa) }}
                  </div>
                </div>
                <p v-else class="text-muted">Sin membresías activas</p>
              </div>
            </div>
            <div class="modal-footer">
              <button @click="editarCliente(clienteDetalle!)" class="btn btn-sm btn-outline-primary me-1">
                <i class="fa-solid fa-edit me-1"></i>
                Editar Cliente
              </button>
              <button @click="eliminarCliente(clienteDetalle!)" class="btn btn-sm btn-outline-danger me-1">
                <i class="fa-solid fa-trash me-1"></i>
                Eliminar Cliente
              </button>
              <button type="button" class="btn btn-secondary" @click="showDetalleModal = false">Cerrar</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal de cliente (editar/crear) -->
      <div v-if="showModal" class="modal show d-block" tabindex="-1" style="background-color: rgba(0,0,0,0.5)">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">{{ clienteEditando ? 'Editar' : 'Nuevo' }} Cliente</h5>
              <button type="button" class="btn-close" @click="cerrarModal"></button>
            </div>
            <div class="modal-body">
              <form @submit.prevent="guardarCliente">
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
                <div class="modal-footer">
                  <button type="button" class="btn btn-secondary" @click="cerrarModal">Cancelar</button>
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
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useAuth } from '@/composables/useAuth';
import { useClientes } from '@/composables/useClientes';
import type { Cliente, ClienteForm } from '@/types/gym';
import GymNavbar from '@/components/GymNavbar.vue';
import FiltrosClientes from '@/components/clientes/FiltrosClientes.vue';
import TablaClientes from '@/components/clientes/TablaClientes.vue';

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
const clienteDetalle = ref<Cliente | null>(null);
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
  const result = await eliminarClienteFromComposable(cliente);
  if (result?.success) {
    if (showDetalleModal.value && clienteDetalle.value?.id === cliente.id) {
      showDetalleModal.value = false;
    }
    await loadClientes();
  }
};

const formatFecha = (fecha: string) => {
  return new Date(fecha).toLocaleDateString('es-MX');
};

// El componente TablaClientes ya tiene formatFecha, pero lo mantenemos aquí para el modal de detalle
</script>
