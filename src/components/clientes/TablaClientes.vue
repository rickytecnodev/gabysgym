<template>
  <div class="card">
    <div class="card-body">
      <div class="table-responsive">
        <table class="table table-hover">
          <thead>
            <tr>
              <th>Nombre</th>
              <th v-if="isSuperadmin">Sucursal</th>
              <th>Membresías</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr 
              v-for="cliente in clientes" 
              :key="cliente.id"
              @click="$emit('ver-detalle', cliente)"
              style="cursor: pointer;"
            >
              <td>
                <div class="fw-bold">{{ cliente.nombre_completo }}</div>
                <small class="text-muted" v-if="cliente.email">{{ cliente.email }}</small>
              </td>
              <td v-if="isSuperadmin">
                {{ cliente.sucursal?.nombre || 'N/A' }}
              </td>
              <td>
                <div v-if="cliente.membresias_activas && cliente.membresias_activas > 0">
                  <span class="badge bg-success me-1">
                    {{ cliente.membresias_activas }} activa(s)
                  </span>
                  <div v-if="cliente.fecha_vencimiento_activa" class="small text-muted mt-1">
                    Vence: {{ formatFecha(cliente.fecha_vencimiento_activa) }}
                  </div>
                </div>
                <span v-else class="text-muted">Sin membresías</span>
              </td>
              <td @click.stop>
                <button @click="$emit('editar', cliente)" class="btn btn-sm btn-outline-primary me-1" title="Editar">
                  <i class="fa-solid fa-edit"></i>
                </button>
                <button @click="$emit('eliminar', cliente)" class="btn btn-sm btn-outline-danger" title="Eliminar">
                  <i class="fa-solid fa-trash"></i>
                </button>
              </td>
            </tr>
            <tr v-if="loading">
              <td :colspan="isSuperadmin ? 4 : 3" class="text-center py-4">
                <div class="spinner-border spinner-border-sm text-primary me-2" role="status">
                  <span class="visually-hidden">Cargando...</span>
                </div>
                Cargando clientes...
              </td>
            </tr>
            <tr v-else-if="clientes.length === 0">
              <td :colspan="isSuperadmin ? 4 : 3" class="text-center text-muted">No hay clientes</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Cliente } from '@/types/gym';

interface ClienteConMembresias extends Cliente {
  membresias_activas?: number;
  fecha_vencimiento_activa?: string | null;
}

defineProps<{
  clientes: ClienteConMembresias[];
  isSuperadmin: boolean;
  loading?: boolean;
}>();

defineEmits<{
  'ver-detalle': [cliente: Cliente];
  'editar': [cliente: Cliente];
  'eliminar': [cliente: Cliente];
}>();

const formatFecha = (fecha: string) => {
  return new Date(fecha).toLocaleDateString('es-MX');
};
</script>
