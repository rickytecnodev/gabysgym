<template>
  <div>
    <div v-if="loading" class="text-center py-4">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Cargando...</span>
      </div>
    </div>
    <div v-else-if="productos.length === 0" class="text-center text-muted py-4">
      No hay productos
    </div>
    <div v-else class="row g-3">
      <div v-for="producto in productos" :key="producto.id" class="col-12">
        <div class="card h-100 shadow-sm">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start mb-2">
              <div class="flex-grow-1">
                <h6 class="card-title mb-1 fw-bold">{{ producto.nombre }}</h6>
                <span class="badge bg-secondary mb-2">{{ producto.categoria || 'N/A' }}</span>
              </div>
              <div class="d-flex gap-1">
                <button @click="$emit('editar', producto)" class="btn btn-sm btn-outline-primary" title="Editar">
                  <i class="fa-solid fa-edit"></i>
                </button>
                <button 
                  v-if="isSuperadmin"
                  @click="$emit('eliminar', producto.id)" 
                  class="btn btn-sm btn-outline-danger"
                  title="Eliminar"
                >
                  <i class="fa-solid fa-trash"></i>
                </button>
              </div>
            </div>
            <div class="row g-2">
              <div class="col-6">
                <div class="small text-muted">Precio</div>
                <div class="fw-bold">${{ producto.precio.toFixed(2) }}</div>
              </div>
              <div class="col-6">
                <div class="small text-muted">Stock</div>
                <div :class="producto.stock < 10 ? 'text-danger fw-bold' : 'fw-bold'">
                  {{ producto.stock }}
                </div>
              </div>
            </div>
            <div class="mt-2 pt-2 border-top d-flex justify-content-between align-items-center">
              <span :class="producto.estado === 'activo' ? 'badge bg-success' : 'badge bg-secondary'">
                {{ producto.estado }}
              </span>
              <span v-if="isSuperadmin && producto.sucursal" class="small text-muted">
                <i class="fa-solid fa-building me-1"></i>
                {{ (producto.sucursal as any)?.nombre }}
              </span>
            </div>
          </div>
        </div>
      </div>
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

<style scoped>
.card {
  transition: transform 0.2s, box-shadow 0.2s;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1) !important;
}
</style>
