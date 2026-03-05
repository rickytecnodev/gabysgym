<template>
  <div class="bg-light min-vh-100">
    <GymNavbar />
    <div class="container-fluid py-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h1 class="h3 mb-0">Productos</h1>
        <button @click="showModal = true" class="btn btn-primary">
          <i class="fa-solid fa-plus me-1"></i>
          Nuevo Producto
        </button>
      </div>

      <!-- Filtros -->
      <div class="card mb-4">
        <div class="card-body">
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
              <label class="form-label">Categoría</label>
              <select v-model="filtroCategoria" class="form-select">
                <option value="">Todas</option>
                <option value="suplementos">Suplementos</option>
                <option value="ropa">Ropa</option>
                <option value="accesorios">Accesorios</option>
                <option value="bebidas">Bebidas</option>
                <option value="otros">Otros</option>
              </select>
            </div>
            <div class="col-md-3">
              <label class="form-label">Estado</label>
              <select v-model="filtroEstado" class="form-select">
                <option value="">Todos</option>
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabla de productos -->
      <div class="card">
        <div class="card-body">
          <div class="table-responsive">
            <table class="table table-hover">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Categoría</th>
                  <th>Precio</th>
                  <th>Stock</th>
                  <th v-if="isSuperadmin">Sucursal</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="producto in productosFiltrados" :key="producto.id">
                  <td>{{ producto.nombre }}</td>
                  <td><span class="badge bg-secondary">{{ producto.categoria || 'N/A' }}</span></td>
                  <td>${{ producto.precio.toFixed(2) }}</td>
                  <td>
                    <span :class="producto.stock < 10 ? 'text-danger fw-bold' : ''">
                      {{ producto.stock }}
                    </span>
                  </td>
                  <td v-if="isSuperadmin">
                    {{ (producto.sucursal as any)?.nombre || 'N/A' }}
                  </td>
                  <td>
                    <span :class="producto.estado === 'activo' ? 'badge bg-success' : 'badge bg-secondary'">
                      {{ producto.estado }}
                    </span>
                  </td>
                  <td>
                    <button @click="editarProducto(producto)" class="btn btn-sm btn-outline-primary me-1">
                      <i class="fa-solid fa-edit"></i>
                    </button>
                    <button @click="eliminarProducto(producto.id)" class="btn btn-sm btn-outline-danger">
                      <i class="fa-solid fa-trash"></i>
                    </button>
                  </td>
                </tr>
                <tr v-if="productosFiltrados.length === 0">
                  <td :colspan="isSuperadmin ? 7 : 6" class="text-center text-muted">No hay productos</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Modal de producto -->
      <div v-if="showModal" class="modal show d-block" tabindex="-1" style="background-color: rgba(0,0,0,0.5)">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">{{ productoEditando ? 'Editar' : 'Nuevo' }} Producto</h5>
              <button type="button" class="btn-close" @click="cerrarModal"></button>
            </div>
            <div class="modal-body">
              <form @submit.prevent="guardarProducto">
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
import { fetchProductos, createProducto, updateProducto, deleteProducto, fetchSucursales } from '@/services/gymApi';
import { useAuth } from '@/composables/useAuth';
import type { Producto, ProductoForm, Sucursal } from '@/types/gym';
import Swal from 'sweetalert2';
import GymNavbar from '@/components/GymNavbar.vue';

const { currentSucursalId, isSuperadmin } = useAuth();

const productos = ref<Producto[]>([]);
const sucursales = ref<Sucursal[]>([]);
const showModal = ref(false);
const productoEditando = ref<Producto | null>(null);
const loading = ref(false);
const errorMessage = ref('');
const filtroCategoria = ref('');
const filtroEstado = ref('');
const filtroSucursal = ref<number | null>(null);
const sucursalSeleccionada = ref<number | null>(null);

const formProducto = ref<ProductoForm>({
  nombre: '',
  descripcion: '',
  precio: 0,
  stock: 0,
  categoria: '',
  estado: 'activo'
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

onMounted(() => {
  if (isSuperadmin.value) {
    loadSucursales();
  }
  loadProductos();
});

const loadSucursales = async () => {
  const { data } = await fetchSucursales();
  if (data) {
    sucursales.value = data;
  }
};

const loadProductos = async () => {
  const sucursalId = isSuperadmin.value 
    ? (filtroSucursal.value || null) 
    : currentSucursalId.value;
  
  const { data, error } = await fetchProductos(sucursalId);
  if (error) {
    Swal.fire('Error', error.message, 'error');
    return;
  }
  productos.value = data || [];
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

  try {
    const sucursalId = isSuperadmin.value 
      ? sucursalSeleccionada.value! 
      : currentSucursalId.value!;
    
    if (productoEditando.value) {
      const updateData: any = { ...formProducto.value };
      if (isSuperadmin.value) {
        updateData.sucursal_id = sucursalId;
      }
      const { error } = await updateProducto(productoEditando.value.id, updateData);
      if (error) {
        errorMessage.value = error.message;
        return;
      }
      Swal.fire('Éxito', 'Producto actualizado correctamente', 'success');
    } else {
      const { error } = await createProducto({
        ...formProducto.value,
        sucursal_id: sucursalId
      });
      if (error) {
        errorMessage.value = error.message;
        return;
      }
      Swal.fire('Éxito', 'Producto creado correctamente', 'success');
    }
    
    cerrarModal();
    loadProductos();
  } catch (error: any) {
    errorMessage.value = error.message || 'Error al guardar producto';
  } finally {
    loading.value = false;
  }
};

const eliminarProducto = async (id: number) => {
  const result = await Swal.fire({
    title: '¿Estás seguro?',
    text: 'Esta acción no se puede deshacer',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar'
  });

  if (result.isConfirmed) {
    const { error } = await deleteProducto(id);
    if (error) {
      Swal.fire('Error', error.message, 'error');
      return;
    }
    Swal.fire('Éxito', 'Producto eliminado correctamente', 'success');
    loadProductos();
  }
};
</script>

