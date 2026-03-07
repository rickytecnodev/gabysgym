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
    <div v-else class="gy-2">
      <div v-for="tipo in tiposMembresia" :key="tipo.id">
        <div :class="['p-3 rounded-3 border bg-white mb-2 shadow-sm borde-izq-tarjeta', tipo.activa ? 'borde-izq-verde' : 'borde-izq-gris']">
          <div class="d-flex justify-content-between align-items-start">
            <div class="flex-grow-1">
              <h6 class="card-title mb-1 fw-bold">{{ tipo.nombre }}</h6>
              <p v-if="tipo.descripcion" class="small text-muted mb-2 mb-0">{{ tipo.descripcion }}</p>
            </div>
            <div class="d-flex">
              <span :class="tipo.activa ? 'badge bg-success' : 'badge bg-secondary'">
                {{ tipo.activa ? 'Activa' : 'Inactiva' }}
              </span>
            </div>
          </div>
          <div class="d-flex justify-content-between align-items-start">
            <div class="flex-grow-1">
              <div class="small text-muted">Precio Mensual</div>
              <div class="fw-bold">${{ tipo.precio_mensual.toFixed(2) }}</div>
            </div>
            <div class="text-end">
              <div class="small text-muted">Duración</div>
              <div class="fw-bold">{{ tipo.duracion_dias }} días</div>
            </div>
          </div>
          <div class="mt-2 pt-2 border-top d-flex justify-content-between align-items-center">
            <div class="d-flex gap-1">
              <button @click="$emit('editar', tipo)" class="btn btn-sm btn-outline-primary" title="Editar">
                <i class="fa-solid fa-edit"></i>
              </button>
              <button v-if="isSuperadmin" @click="$emit('eliminar', tipo.id)" class="btn btn-sm btn-outline-danger"
                title="Eliminar">
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
.borde-izq-tarjeta {
  border-left-width: 5px !important;
  border-left-style: solid !important;
  transition: transform 0.2s, box-shadow 0.2s;
}

.borde-izq-verde { border-left-color: var(--bs-success) !important; }
.borde-izq-gris { border-left-color: var(--bs-secondary) !important; }

.borde-izq-tarjeta:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1) !important;
}
</style>
