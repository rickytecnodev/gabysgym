<template>
  <div>
    <div v-if="loading" class="text-center py-4">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Cargando...</span>
      </div>
    </div>
    <div v-else-if="clientes.length === 0" class="text-center text-muted py-4">
      No hay clientes
    </div>
    <div v-else class="row g-3">
      <div v-for="cliente in clientes" :key="cliente.id" class="col-12">
        <div class="card h-100 shadow-sm" @click="$emit('ver-detalle', cliente)" style="cursor: pointer;">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start mb-2">
              <div class="flex-grow-1">
                <h6 class="card-title mb-1 fw-bold">{{ cliente.nombre_completo }}</h6>
                <small class="text-muted" v-if="cliente.email">
                  <i class="fa-solid fa-envelope me-1"></i>
                  {{ cliente.email }}
                </small>
              </div>
              <div class="d-flex gap-1" @click.stop>
                <button @click.stop="$emit('editar', cliente)" class="btn btn-sm btn-outline-primary" title="Editar">
                  <i class="fa-solid fa-edit"></i>
                </button>
                <button 
                  v-if="isSuperadmin"
                  @click.stop="$emit('eliminar', cliente)" 
                  class="btn btn-sm btn-outline-danger" 
                  title="Eliminar"
                >
                  <i class="fa-solid fa-trash"></i>
                </button>
              </div>
            </div>
            <div v-if="isSuperadmin && cliente.sucursal" class="mb-2">
              <small class="text-muted">
                <i class="fa-solid fa-building me-1"></i>
                {{ cliente.sucursal.nombre }}
              </small>
            </div>
            <div v-if="cliente.membresias_activas && cliente.membresias_activas > 0">
              <span class="badge bg-success me-1">
                {{ cliente.membresias_activas }} activa(s)
              </span>
              <div v-if="cliente.fecha_vencimiento_activa" class="small text-muted mt-1">
                Vence: {{ formatFecha(cliente.fecha_vencimiento_activa) }}
              </div>
            </div>
            <span v-else class="text-muted small">Sin membresías</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Cliente } from '@/types/gym';
import { formatFecha } from '@/utils/dateFormatter';

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
