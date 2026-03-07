<template>
    <div v-if="loading" class="text-center py-4">
      <div class="spinner-border spinner-border-sm text-primary" role="status">
        <span class="visually-hidden">Cargando...</span>
      </div>
    </div>
    <div v-else-if="usuarios.length === 0" class="text-center text-muted py-4">
      No hay usuarios
    </div>
    <div v-else class="gy-2">
      <div v-for="usuario in usuarios" :key="usuario.id" :class="['p-3 rounded-3 border bg-white mb-2 borde-izq-tarjeta', usuario.activo ? 'borde-izq-verde' : 'borde-izq-gris']">
        <div class="d-flex justify-content-between align-items-start">
          <div class="flex-grow-1">
            <h6 class="mb-1 fw-bold">{{ usuario.nombre_completo }}</h6>
            <div class="small text-muted mb-2">
              <div><i class="fa-solid fa-user me-1"></i>{{ usuario.username }}</div>
              <div v-if="usuario.email" class="mt-1">
                <i class="fa-solid fa-envelope me-1"></i>{{ usuario.email }}
              </div>
              <div v-if="usuario.telefono" class="mt-1">
                <i class="fa-solid fa-phone me-1"></i>{{ usuario.telefono }}
              </div>
            </div>
          </div>
          <div class="d-flex flex-wrap gap-2 justify-content-end">
            <span v-if="usuario.rol === 'superadmin'" class="badge bg-danger">Superadmin</span>
            <span v-if="usuario.sucursal" class="badge bg-info">
              <i class="fa-solid fa-building me-1"></i>
              {{ usuario.sucursal.nombre }}
            </span>
          </div>
        </div>
        <div class="mt-2 pt-2 border-top d-flex justify-content-between align-items-center">
          <div class="d-flex gap-1">
            <button @click="$emit('editar', usuario)" class="btn btn-sm btn-outline-primary" title="Editar">
              <i class="fa-solid fa-edit"></i>
            </button>
            <button @click="$emit('eliminar', usuario)" class="btn btn-sm btn-outline-danger" title="Eliminar">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
</template>

<script setup lang="ts">
import type { Empleado } from '@/types/gym';

defineProps<{
  usuarios: Empleado[];
  loading?: boolean;
}>();

defineEmits<{
  'editar': [usuario: Empleado];
  'eliminar': [usuario: Empleado];
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
