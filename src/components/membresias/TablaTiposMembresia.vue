<template>
  <div class="card">
    <div class="card-body">
      <div class="table-responsive">
        <table class="table table-hover">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Descripción</th>
              <th>Precio Mensual</th>
              <th>Duración (días)</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="tipo in tiposMembresia" :key="tipo.id">
              <td>{{ tipo.nombre }}</td>
              <td>{{ tipo.descripcion || 'N/A' }}</td>
              <td>${{ tipo.precio_mensual.toFixed(2) }}</td>
              <td>{{ tipo.duracion_dias }}</td>
              <td>
                <span :class="tipo.activa ? 'badge bg-success' : 'badge bg-secondary'">
                  {{ tipo.activa ? 'Activa' : 'Inactiva' }}
                </span>
              </td>
              <td>
                <button @click="$emit('editar', tipo)" class="btn btn-sm btn-outline-primary me-1">
                  <i class="fa-solid fa-edit"></i>
                </button>
                <button 
                  v-if="isSuperadmin"
                  @click="$emit('eliminar', tipo.id)" 
                  class="btn btn-sm btn-outline-danger"
                >
                  <i class="fa-solid fa-trash"></i>
                </button>
              </td>
            </tr>
            <tr v-if="loading">
              <td colspan="6" class="text-center py-4">
                <div class="spinner-border spinner-border-sm text-primary me-2" role="status">
                  <span class="visually-hidden">Cargando...</span>
                </div>
                Cargando tipos de membresías...
              </td>
            </tr>
            <tr v-else-if="tiposMembresia.length === 0">
              <td colspan="6" class="text-center text-muted">No hay tipos de membresías</td>
            </tr>
          </tbody>
        </table>
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
