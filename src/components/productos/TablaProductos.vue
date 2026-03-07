<template>
  <div class="p-3 rounded-3 border bg-white">
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
            <tr v-for="producto in productos" :key="producto.id">
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
                <button @click="$emit('editar', producto)" class="btn btn-sm btn-outline-primary me-1">
                  <i class="fa-solid fa-edit"></i>
                </button>
                <button v-if="isSuperadmin" @click="$emit('eliminar', producto.id)"
                  class="btn btn-sm btn-outline-danger">
                  <i class="fa-solid fa-trash"></i>
                </button>
              </td>
            </tr>
            <tr v-if="loading">
              <td :colspan="isSuperadmin ? 7 : 6" class="text-center py-4">
                <div class="spinner-border spinner-border-sm text-primary me-2" role="status">
                  <span class="visually-hidden">Cargando...</span>
                </div>
                Cargando productos...
              </td>
            </tr>
            <tr v-else-if="productos.length === 0">
              <td :colspan="isSuperadmin ? 7 : 6" class="text-center text-muted">No hay productos</td>
            </tr>
          </tbody>
        </table>
      </div>
  </div>
</template>

<script setup lang="ts">
import type { Producto } from '@/types/gym';

defineProps<{
  productos: Producto[];
  isSuperadmin: boolean;
  loading?: boolean;
}>();

defineEmits<{
  'editar': [producto: Producto];
  'eliminar': [id: number];
}>();
</script>
