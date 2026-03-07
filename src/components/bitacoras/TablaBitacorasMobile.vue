<template>

    <div v-if="loading" class="text-center py-4">
      <div class="spinner-border spinner-border-sm text-primary" role="status">
        <span class="visually-hidden">Cargando...</span>
      </div>
    </div>
    <div v-else-if="bitacoras.length === 0" class="text-center text-muted py-4">
      No hay bitácoras registradas
    </div>
    <div v-else class="gy-2">
      <div v-for="bitacora in bitacoras" :key="bitacora.id" class="p-3 rounded-3 border bg-white mb-2">
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
        <p class="mb-2">{{ bitacora.descripcion }}</p>
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

