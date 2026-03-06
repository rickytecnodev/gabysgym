<template>
  <div>
    <div v-if="loading" class="text-center py-4">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Cargando...</span>
      </div>
    </div>
    <div v-else-if="bitacoras.length === 0" class="text-center text-muted py-4">
      No hay bitácoras registradas
    </div>
    <div v-else class="row g-3">
      <div v-for="bitacora in bitacoras" :key="bitacora.id" class="col-12">
        <div class="card h-100 shadow-sm">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start mb-2">
              <div>
                <span :class="getBadgeClass(bitacora.tipo)" class="badge mb-2">
                  {{ getTipoLabel(bitacora.tipo) }}
                </span>
                <div class="text-muted small">
                  <i class="fa-solid fa-calendar me-1"></i>
                  {{ formatFecha(bitacora.fecha) }}
                </div>
              </div>
            </div>
            <p class="card-text mb-2">{{ bitacora.descripcion }}</p>
            <div v-if="isSuperadmin" class="mt-2 pt-2 border-top">
              <div class="small text-muted">
                <div v-if="bitacora.empleado">
                  <i class="fa-solid fa-user me-1"></i>
                  {{ bitacora.empleado.nombre_completo || 'N/A' }}
                </div>
                <div v-if="bitacora.empleado?.sucursal" class="mt-1">
                  <i class="fa-solid fa-building me-1"></i>
                  {{ bitacora.empleado.sucursal.nombre }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { BitacoraDia } from '@/types/gym';
import { formatFecha } from '@/utils/dateFormatter';

defineProps<{
  bitacoras: BitacoraDia[];
  isSuperadmin: boolean;
  loading?: boolean;
}>();

const getTipoLabel = (tipo: string) => {
  const labels: Record<string, string> = {
    'nota': 'Nota',
    'incidente': 'Incidente',
    'observacion': 'Observación'
  };
  return labels[tipo] || tipo;
};

const getBadgeClass = (tipo: string) => {
  const classes: Record<string, string> = {
    'nota': 'bg-info',
    'incidente': 'bg-danger',
    'observacion': 'bg-warning'
  };
  return classes[tipo] || 'bg-secondary';
};
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
