<template>
  <div class="p-3 rounded-3 border bg-white">
    <div v-if="loading" class="text-center py-4">
      <div class="spinner-border spinner-border-sm text-primary" role="status">
        <span class="visually-hidden">Cargando...</span>
      </div>
    </div>
    <div v-else-if="usuarios.length === 0" class="text-center text-muted py-4">
      No hay usuarios
    </div>
    <div v-else class="table-responsive">
      <table class="table table-hover mb-0">
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Nombre Completo</th>
              <th>Email</th>
              <th>Teléfono</th>
              <th>Rol</th>
              <th>Sucursal</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="usuario in usuarios" :key="usuario.id">
              <td>{{ usuario.username }}</td>
              <td>{{ usuario.nombre_completo }}</td>
              <td>{{ usuario.email || 'N/A' }}</td>
              <td>{{ usuario.telefono || 'N/A' }}</td>
              <td>
                <span :class="usuario.rol === 'superadmin' ? 'badge bg-danger' : 'badge bg-primary'">
                  {{ usuario.rol === 'superadmin' ? 'Superadmin' : 'Empleado' }}
                </span>
              </td>
              <td>{{ usuario.sucursal?.nombre || 'N/A' }}</td>
              <td>
                <span :class="usuario.activo ? 'badge bg-success' : 'badge bg-secondary'">
                  {{ usuario.activo ? 'Activo' : 'Inactivo' }}
                </span>
              </td>
              <td>
                <button @click="$emit('editar', usuario)" class="btn btn-sm btn-outline-primary me-1">
                  <i class="fa-solid fa-edit"></i>
                </button>
                <button @click="$emit('eliminar', usuario)" class="btn btn-sm btn-outline-danger">
                  <i class="fa-solid fa-trash"></i>
                </button>
              </td>
            </tr>
          </tbody>
      </table>
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
