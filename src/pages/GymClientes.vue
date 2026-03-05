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
      <div class="card mb-4">
        <div class="card-body">
          <div class="row g-3">
            <div class="col-md-4" v-if="isSuperadmin">
              <label class="form-label">Sucursal</label>
              <select v-model="filtroSucursal" class="form-select">
                <option value="">Todas</option>
                <option v-for="sucursal in sucursales" :key="sucursal.id" :value="sucursal.id">
                  {{ sucursal.nombre }}
                </option>
              </select>
            </div>
            <div class="col-md-4">
              <label class="form-label">Buscar</label>
              <input 
                v-model="busqueda" 
                type="text" 
                class="form-control" 
                placeholder="Nombre, teléfono o email..."
                @input="filtrarClientes"
              >
            </div>
          </div>
        </div>
      </div>

      <!-- Tabla de clientes -->
      <div class="card">
        <div class="card-body">
          <div class="table-responsive">
            <table class="table table-hover">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th v-if="isSuperadmin">Sucursal</th>
                  <th>Membresías</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr 
                  v-for="cliente in clientesFiltrados" 
                  :key="cliente.id"
                  @click="verDetalleCliente(cliente)"
                  style="cursor: pointer;"
                >
                  <td>
                    <div class="fw-bold">{{ cliente.nombre_completo }}</div>
                    <small class="text-muted" v-if="cliente.email">{{ cliente.email }}</small>
                  </td>
                  <td v-if="isSuperadmin">
                    {{ cliente.sucursal?.nombre || 'N/A' }}
                  </td>
                  <td>
                    <div v-if="cliente.membresias_activas > 0">
                      <span class="badge bg-success me-1">
                        {{ cliente.membresias_activas }} activa(s)
                      </span>
                      <div v-if="cliente.fecha_vencimiento_activa" class="small text-muted mt-1">
                        Vence: {{ formatFecha(cliente.fecha_vencimiento_activa) }}
                      </div>
                    </div>
                    <span v-else class="text-muted">Sin membresías</span>
                  </td>
                  <td @click.stop>
                    <button @click="editarCliente(cliente)" class="btn btn-sm btn-outline-primary me-1" title="Editar">
                      <i class="fa-solid fa-edit"></i>
                    </button>
                    <button @click="eliminarCliente(cliente)" class="btn btn-sm btn-outline-danger" title="Eliminar">
                      <i class="fa-solid fa-trash"></i>
                    </button>
                  </td>
                </tr>
                <tr v-if="clientesFiltrados.length === 0">
                  <td :colspan="isSuperadmin ? 4 : 3" class="text-center text-muted">No hay clientes</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

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
                <div v-if="clienteDetalle.membresias_activas > 0">
                  <span class="badge bg-success me-1">
                    {{ clienteDetalle.membresias_activas }} activa(s)
                  </span>
                  <div v-if="clienteDetalle.fecha_vencimiento_activa" class="mt-2">
                    <strong>Próxima fecha de vencimiento:</strong> {{ formatFecha(clienteDetalle.fecha_vencimiento_activa) }}
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
import { fetchClientes, createCliente, updateCliente, deleteCliente, fetchSucursales, fetchMembresias } from '@/services/gymApi';
import { useAuth } from '@/composables/useAuth';
import type { Cliente, ClienteForm, Sucursal } from '@/types/gym';
import Swal from 'sweetalert2';
import GymNavbar from '@/components/GymNavbar.vue';

const { currentSucursalId, isSuperadmin } = useAuth();

const clientes = ref<Cliente[]>([]);
const sucursales = ref<Sucursal[]>([]);
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

// Watchers para hacer los filtros reactivos
watch(filtroSucursal, () => {
  loadClientes();
});

onMounted(() => {
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

const loadClientes = async () => {
  const sucursalId = isSuperadmin.value ? (filtroSucursal.value || null) : currentSucursalId.value;
  const { data, error } = await fetchClientes(sucursalId);
  
  if (error) {
    Swal.fire('Error', error.message, 'error');
    return;
  }
  
  if (data) {
    // Cargar membresías para contar las activas por cliente
    const { data: membresias } = await fetchMembresias(sucursalId);
    
    clientes.value = data.map(cliente => {
      const membresiasDelCliente = membresias?.filter(m => 
        m.cliente_id === cliente.id && m.estado === 'activa'
      ) || [];
      
      // Obtener la fecha de vencimiento de la membresía activa más reciente
      const membresiaActiva = membresiasDelCliente.length > 0 
        ? membresiasDelCliente.sort((a, b) => 
            new Date(b.fecha_vencimiento).getTime() - new Date(a.fecha_vencimiento).getTime()
          )[0]
        : null;
      
      return {
        ...cliente,
        membresias_activas: membresiasDelCliente.length,
        fecha_vencimiento_activa: membresiaActiva?.fecha_vencimiento || null
      };
    });
  }
};

const filtrarClientes = () => {
  // El filtrado se hace automáticamente con el computed
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

  try {
    if (clienteEditando.value) {
      // Editar cliente existente
      const { error } = await updateCliente(clienteEditando.value.id, formCliente.value);
      
      if (error) {
        errorMessage.value = error.message;
        return;
      }
      
      Swal.fire('Éxito', 'Cliente actualizado correctamente', 'success');
    } else {
      // Crear nuevo cliente
      const { error } = await createCliente({
        ...formCliente.value,
        sucursal_id: currentSucursalId.value!
      });
      
      if (error) {
        errorMessage.value = error.message;
        return;
      }
      
      Swal.fire('Éxito', 'Cliente creado correctamente', 'success');
    }
    
    cerrarModal();
    loadClientes();
  } catch (error: any) {
    errorMessage.value = error.message || 'Error al guardar cliente';
  } finally {
    loading.value = false;
  }
};

const eliminarCliente = async (cliente: Cliente) => {
  const result = await Swal.fire({
    title: '¿Eliminar cliente?',
    text: `¿Estás seguro de eliminar a ${cliente.nombre_completo}? Esta acción no se puede deshacer y eliminará todas sus membresías asociadas.`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#dc3545'
  });
  
  if (result.isConfirmed) {
    const { error } = await deleteCliente(cliente.id);
    
    if (error) {
      Swal.fire('Error', error.message, 'error');
      return;
    }
    
    Swal.fire('Éxito', 'Cliente eliminado correctamente', 'success');
    
    // Cerrar el modal de detalle si está abierto
    if (showDetalleModal.value && clienteDetalle.value?.id === cliente.id) {
      showDetalleModal.value = false;
    }
    
    loadClientes();
  }
};

const formatFecha = (fecha: string) => {
  return new Date(fecha).toLocaleDateString('es-MX');
};
</script>
