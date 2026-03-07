<template>
  <div class="bg-light min-vh-100">
    <div class="container-fluid py-2">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h1 class="h3 mb-0">Productos</h1>
        <button v-if="tabActivo === 'productos'" @click="showModal = true" class="btn btn-primary">
          <i class="fa-solid fa-plus me-1"></i>
          Nuevo Producto
        </button>
        <button v-else @click="showModalTipoMembresia = true" class="btn btn-primary">
          <i class="fa-solid fa-plus me-1"></i>
          Nuevo Tipo de Membresía
        </button>
      </div>

      <!-- Tabs y contenido -->
      <TabsProductos :tab-activo="tabActivo" @cambiar-tab="tabActivo = $event">
        <template #productos>
          <!-- Filtros -->
          <FiltrosProductos v-model:filtro-sucursal="filtroSucursal" v-model:filtro-categoria="filtroCategoria"
            v-model:filtro-estado="filtroEstado" :sucursales="sucursales" :is-superadmin="isSuperadmin" />

          <!-- Tabla de productos (Desktop) -->
          <div class="d-none d-md-block">
            <TablaProductos :productos="productosFiltrados" :is-superadmin="isSuperadmin" :loading="loadingData"
              @editar="editarProducto" @eliminar="eliminarProducto" />
          </div>

          <!-- Vista móvil de productos (Mobile) -->
          <div class="d-block d-md-none">
            <TablaProductosMobile :productos="productosFiltrados" :is-superadmin="isSuperadmin" :loading="loadingData"
              @editar="editarProducto" @eliminar="eliminarProducto" />
          </div>
        </template>
        <template #tipos-membresias>
          <!-- Tabla de tipos de membresías (Desktop) -->
          <div class="d-none d-md-block">
            <TablaTiposMembresia :tipos-membresia="tiposMembresia" :is-superadmin="isSuperadmin"
              :loading="loadingTiposMembresia" @editar="editarTipoMembresia" @eliminar="eliminarTipoMembresia" />
          </div>

          <!-- Vista móvil de tipos de membresías (Mobile) -->
          <div class="d-block d-md-none">
            <TablaTiposMembresiaMobile :tipos-membresia="tiposMembresia" :is-superadmin="isSuperadmin"
              :loading="loadingTiposMembresia" @editar="editarTipoMembresia" @eliminar="eliminarTipoMembresia" />
          </div>
        </template>
      </TabsProductos>

      <!-- Modal de producto -->
      <GymModal v-model:show="showModal" :title="(productoEditando ? 'Editar' : 'Nuevo') + ' Producto'">
        <form id="formProducto" @submit.prevent="guardarProducto">
          <div v-if="isSuperadmin" class="mb-3">
            <label class="form-label">Sucursal *</label>
            <select v-model="sucursalSeleccionada" class="form-select" required>
              <option value="">Selecciona una sucursal</option>
              <option v-for="sucursal in sucursales" :key="sucursal.id" :value="sucursal.id">
                {{ sucursal.nombre }}
              </option>
            </select>
          </div>
          <div class="mb-3">
            <label class="form-label">Nombre *</label>
            <input v-model="formProducto.nombre" type="text" class="form-control" required>
          </div>
          <div class="mb-3">
            <label class="form-label">Descripción</label>
            <textarea v-model="formProducto.descripcion" class="form-control" rows="2"></textarea>
          </div>
          <div class="row">
            <div class="col-md-6 mb-3">
              <label class="form-label">Precio *</label>
              <input v-model.number="formProducto.precio" type="number" step="0.01" class="form-control" required>
            </div>
            <div class="col-md-6 mb-3">
              <label class="form-label">Stock *</label>
              <input v-model.number="formProducto.stock" type="number" class="form-control" required>
            </div>
          </div>
          <div class="row">
            <div class="col-md-6 mb-3">
              <label class="form-label">Categoría</label>
              <select v-model="formProducto.categoria" class="form-select">
                <option value="">Selecciona...</option>
                <option value="suplementos">Suplementos</option>
                <option value="ropa">Ropa</option>
                <option value="accesorios">Accesorios</option>
                <option value="bebidas">Bebidas</option>
                <option value="otros">Otros</option>
              </select>
            </div>
            <div class="col-md-6 mb-3">
              <label class="form-label">Estado *</label>
              <select v-model="formProducto.estado" class="form-select" required>
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
              </select>
            </div>
          </div>
          <div v-if="errorMessage" class="alert alert-danger">{{ errorMessage }}</div>
        </form>
        <template #footer>
          <button type="button" class="btn btn-secondary" @click="cerrarModal">Cancelar</button>
          <button type="submit" form="formProducto" class="btn btn-primary" :disabled="loading">
            <span v-if="loading" class="spinner-border spinner-border-sm me-1"></span>
            Guardar
          </button>
        </template>
      </GymModal>

      <!-- Modal de tipo de membresía -->
      <GymModal v-model:show="showModalTipoMembresia" :title="(tipoMembresiaEditando ? 'Editar' : 'Nuevo') + ' Tipo de Membresía'">
        <form id="formTipoMembresia" @submit.prevent="guardarTipoMembresia">
          <div class="mb-3">
            <label class="form-label">Nombre *</label>
            <input v-model="formTipoMembresia.nombre" type="text" class="form-control" required>
          </div>
          <div class="mb-3">
            <label class="form-label">Descripción</label>
            <textarea v-model="formTipoMembresia.descripcion" class="form-control" rows="2"></textarea>
          </div>
          <div class="row">
            <div class="col-md-6 mb-3">
              <label class="form-label">Precio Mensual *</label>
              <input v-model.number="formTipoMembresia.precio_mensual" type="number" step="0.01" class="form-control" required>
            </div>
            <div class="col-md-6 mb-3">
              <label class="form-label">Duración (días) *</label>
              <input v-model.number="formTipoMembresia.duracion_dias" type="number" class="form-control" required>
            </div>
          </div>
          <div class="mb-3">
            <label class="form-label">Estado *</label>
            <select v-model="formTipoMembresia.activa" class="form-select" required>
              <option :value="true">Activa</option>
              <option :value="false">Inactiva</option>
            </select>
          </div>
          <div v-if="errorMessageTipoMembresia" class="alert alert-danger">{{ errorMessageTipoMembresia }}</div>
        </form>
        <template #footer>
          <button type="button" class="btn btn-secondary" @click="cerrarModalTipoMembresia">Cancelar</button>
          <button type="submit" form="formTipoMembresia" class="btn btn-primary" :disabled="loadingTipoMembresia">
            <span v-if="loadingTipoMembresia" class="spinner-border spinner-border-sm me-1"></span>
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
import { useProductos } from '@/composables/useProductos';
import {
  fetchTiposMembresia,
  createTipoMembresia,
  updateTipoMembresia,
  deleteTipoMembresia
} from '@/services/gymApi';
import type { Producto, ProductoForm, TipoMembresia } from '@/types/gym';
import GymModal from '@/components/GymModal.vue';
import FiltrosProductos from '@/components/productos/FiltrosProductos.vue';
import TablaProductos from '@/components/productos/TablaProductos.vue';
import TablaProductosMobile from '@/components/productos/TablaProductosMobile.vue';
import TabsProductos from '@/components/productos/TabsProductos.vue';
import TablaTiposMembresia from '@/components/membresias/TablaTiposMembresia.vue';
import TablaTiposMembresiaMobile from '@/components/membresias/TablaTiposMembresiaMobile.vue';
import Swal from 'sweetalert2';

const { currentSucursalId, isSuperadmin } = useAuth();
const {
  productos,
  sucursales,
  loadingData,
  loadProductos: loadProductosFromComposable,
  loadSucursales,
  guardarProducto: guardarProductoFromComposable,
  eliminarProducto: eliminarProductoFromComposable
} = useProductos();

const tabActivo = ref<'productos' | 'tipos-membresias'>('productos');
const showModal = ref(false);
const showModalTipoMembresia = ref(false);
const productoEditando = ref<Producto | null>(null);
const tipoMembresiaEditando = ref<TipoMembresia | null>(null);
const loading = ref(false);
const loadingTipoMembresia = ref(false);
const loadingTiposMembresia = ref(true);
const errorMessage = ref('');
const errorMessageTipoMembresia = ref('');
const filtroCategoria = ref('');
const filtroEstado = ref('');
const filtroSucursal = ref<number | null>(null);
const sucursalSeleccionada = ref<number | null>(null);
const tiposMembresia = ref<TipoMembresia[]>([]);

const formProducto = ref<ProductoForm>({
  nombre: '',
  descripcion: '',
  precio: 0,
  stock: 0,
  categoria: '',
  estado: 'activo'
});

const formTipoMembresia = ref({
  nombre: '',
  descripcion: '',
  precio_mensual: 0,
  duracion_dias: 30,
  activa: true
});

const productosFiltrados = computed(() => {
  let filtrados = productos.value;
  if (filtroSucursal.value) {
    filtrados = filtrados.filter(p => p.sucursal_id === filtroSucursal.value);
  }
  if (filtroCategoria.value) {
    filtrados = filtrados.filter(p => p.categoria === filtroCategoria.value);
  }
  if (filtroEstado.value) {
    filtrados = filtrados.filter(p => p.estado === filtroEstado.value);
  }
  return filtrados;
});

// Watchers para hacer los filtros reactivos
watch([filtroCategoria, filtroEstado, filtroSucursal], () => {
  // El filtrado se hace en el computed, no necesitamos recargar
});

watch(filtroSucursal, () => {
  loadProductos();
});

onMounted(async () => {
  if (isSuperadmin.value) {
    await loadSucursales();
  }
  await loadProductos();
  await loadTiposMembresia();
});

const loadProductos = async () => {
  const sucursalId = isSuperadmin.value
    ? (filtroSucursal.value || null)
    : currentSucursalId.value;

  await loadProductosFromComposable(sucursalId);
};

const editarProducto = (producto: Producto) => {
  productoEditando.value = producto;
  formProducto.value = {
    nombre: producto.nombre,
    descripcion: producto.descripcion || '',
    precio: producto.precio,
    stock: producto.stock,
    categoria: producto.categoria || '',
    estado: producto.estado
  };
  if (isSuperadmin.value) {
    sucursalSeleccionada.value = producto.sucursal_id;
  }
  showModal.value = true;
};

const cerrarModal = () => {
  showModal.value = false;
  productoEditando.value = null;
  formProducto.value = {
    nombre: '',
    descripcion: '',
    precio: 0,
    stock: 0,
    categoria: '',
    estado: 'activo'
  };
  if (isSuperadmin.value) {
    sucursalSeleccionada.value = null;
  }
  errorMessage.value = '';
};

const guardarProducto = async () => {
  if (isSuperadmin.value) {
    if (!sucursalSeleccionada.value) {
      errorMessage.value = 'Debes seleccionar una sucursal';
      return;
    }
  } else {
    if (!currentSucursalId.value) {
      errorMessage.value = 'Debes estar asignado a una sucursal';
      return;
    }
  }

  loading.value = true;
  errorMessage.value = '';

  const sucursalId = isSuperadmin.value
    ? sucursalSeleccionada.value!
    : currentSucursalId.value!;

  const result = await guardarProductoFromComposable(
    formProducto.value,
    sucursalId,
    productoEditando.value?.id
  );

  if (result?.error) {
    errorMessage.value = result.error.message;
    loading.value = false;
    return;
  }

  if (result?.success) {
    cerrarModal();
    await loadProductos();
  }

  loading.value = false;
};

const eliminarProducto = async (id: number) => {
  if (!isSuperadmin.value) {
    Swal.fire('Error', 'Solo el superadmin puede eliminar productos', 'error');
    return;
  }
  const result = await eliminarProductoFromComposable(id);
  if (result?.success) {
    await loadProductos();
  }
};

// Funciones para tipos de membresías
const loadTiposMembresia = async () => {
  loadingTiposMembresia.value = true;
  const { data, error } = await fetchTiposMembresia();
  if (error) {
    Swal.fire('Error', error.message, 'error');
  } else if (data) {
    tiposMembresia.value = data;
  }
  loadingTiposMembresia.value = false;
};

const editarTipoMembresia = (tipo: TipoMembresia) => {
  tipoMembresiaEditando.value = tipo;
  formTipoMembresia.value = {
    nombre: tipo.nombre,
    descripcion: tipo.descripcion || '',
    precio_mensual: tipo.precio_mensual,
    duracion_dias: tipo.duracion_dias,
    activa: tipo.activa
  };
  showModalTipoMembresia.value = true;
};

const cerrarModalTipoMembresia = () => {
  showModalTipoMembresia.value = false;
  tipoMembresiaEditando.value = null;
  formTipoMembresia.value = {
    nombre: '',
    descripcion: '',
    precio_mensual: 0,
    duracion_dias: 30,
    activa: true
  };
  errorMessageTipoMembresia.value = '';
};

const guardarTipoMembresia = async () => {
  loadingTipoMembresia.value = true;
  errorMessageTipoMembresia.value = '';

  try {
    let result;
    if (tipoMembresiaEditando.value) {
      result = await updateTipoMembresia(tipoMembresiaEditando.value.id, formTipoMembresia.value);
    } else {
      result = await createTipoMembresia(formTipoMembresia.value);
    }

    if (result.error) {
      errorMessageTipoMembresia.value = result.error.message;
      loadingTipoMembresia.value = false;
      return;
    }

    Swal.fire('Éxito', `Tipo de membresía ${tipoMembresiaEditando.value ? 'actualizado' : 'creado'} correctamente`, 'success');
    cerrarModalTipoMembresia();
    await loadTiposMembresia();
  } catch (error: any) {
    errorMessageTipoMembresia.value = error.message || 'Error al guardar tipo de membresía';
  } finally {
    loadingTipoMembresia.value = false;
  }
};

const eliminarTipoMembresia = async (id: number) => {
  if (!isSuperadmin.value) {
    Swal.fire('Error', 'Solo el superadmin puede eliminar tipos de membresías', 'error');
    return;
  }

  const result = await Swal.fire({
    title: '¿Estás seguro?',
    text: 'Esta acción no se puede deshacer',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar'
  });

  if (result.isConfirmed) {
    const { error } = await deleteTipoMembresia(id);
    if (error) {
      Swal.fire('Error', error.message, 'error');
    } else {
      Swal.fire('Éxito', 'Tipo de membresía eliminado correctamente', 'success');
      await loadTiposMembresia();
    }
  }
};
</script>
