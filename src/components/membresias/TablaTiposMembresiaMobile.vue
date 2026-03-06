<template>
  <div>
    <div v-if="loading" class="text-center py-4">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Cargando...</span>
      </div>
    </div>
    <div v-else-if="tiposMembresia.length === 0" class="text-center text-muted py-4">
      No hay tipos de membresías
    </div>
    <div v-else class="row g-3">
      <div v-for="tipo in tiposMembresia" :key="tipo.id" class="col-12">
        <div class="card h-100 shadow-sm">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start mb-2">
              <div class="flex-grow-1">
                <h6 class="card-title mb-1 fw-bold">{{ tipo.nombre }}</h6>
                <p class="card-text text-muted small mb-2">{{ tipo.descripcion || 'Sin descripción' }}</p>
              </div>
              <span :class="tipo.activa ? 'badge bg-success' : 'badge bg-secondary'">
                {{ tipo.activa ? 'Activa' : 'Inactiva' }}
              </span>
            </div>
            <div class="row g-2 mb-2">
              <div class="col-6">
                <div class="small text-muted">Precio Mensual</div>
                <div class="fw-bold text-primary">${{ tipo.precio_mensual.toFixed(2) }}</div>
              </div>
              <div class="col-6">
                <div class="small text-muted">Duración</div>
                <div class="fw-bold">{{ tipo.duracion_dias }} días</div>
              </div>
            </div>
            <div class="d-flex gap-1 mt-2 pt-2 border-top">
              <button @click="$emit('editar', tipo)" class="btn btn-sm btn-outline-primary" title="Editar">
                <i class="fa-solid fa-edit"></i>
              </button>
              <button 
                v-if="isSuperadmin"
                @click="$emit('eliminar', tipo.id)" 
                class="btn btn-sm btn-outline-danger"
                title="Eliminar"
              >
                <i class="fa-solid fa-trash"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TipoMembresia } from '@/types/gym';

defineProps<{
  tiposMembresia: TipoMembresia[];
  isSuperadmin: boolean;
  loading?: boolean;
}>();

defineEmits<{
  'editar': [tipo: TipoMembresia];
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
