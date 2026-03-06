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
      <FiltrosProductos
        v-model:filtro-sucursal="filtroSucursal"
        v-model:filtro-categoria="filtroCategoria"
        v-model:filtro-estado="filtroEstado"
        :sucursales="sucursales"
        :is-superadmin="isSuperadmin"
      />

      <!-- Tabla de productos -->
      <TablaProductos
        :productos="productosFiltrados"
        :is-superadmin="isSuperadmin"
        :loading="loadingData"
        @editar="editarProducto"
        @eliminar="eliminarProducto"
      />

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
import { useAuth } from '@/composables/useAuth';
import { useProductos } from '@/composables/useProductos';
import type { Producto, ProductoForm } from '@/types/gym';
import GymNavbar from '@/components/GymNavbar.vue';
import FiltrosProductos from '@/components/productos/FiltrosProductos.vue';
import TablaProductos from '@/components/productos/TablaProductos.vue';

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

onMounted(async () => {
  if (isSuperadmin.value) {
    await loadSucursales();
  }
  await loadProductos();
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
  const result = await eliminarProductoFromComposable(id);
  if (result?.success) {
    await loadProductos();
  }
};
</script>

