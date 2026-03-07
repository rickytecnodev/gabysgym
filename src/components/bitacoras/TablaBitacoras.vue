<template>
  <div class="p-3 rounded-3 border bg-white">
    <div v-if="loading" class="text-center py-4">
        <div class="spinner-border spinner-border-sm text-primary" role="status">
          <span class="visually-hidden">Cargando...</span>
        </div>
      </div>
      <div v-else-if="bitacoras.length === 0" class="text-center text-muted py-4">
        No hay bitácoras registradas
      </div>
      <div v-else class="table-responsive">
        <table class="table table-hover mb-0">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Tipo</th>
              <th>Descripción</th>
              <th v-if="isSuperadmin">Empleado</th>
              <th v-if="isSuperadmin">Sucursal</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="bitacora in bitacoras" :key="bitacora.id">
              <td>{{ formatFecha(bitacora.fecha) }}</td>
              <td>
                <span :class="getBadgeClass(bitacora.tipo)" class="badge">
                  {{ getTipoLabel(bitacora.tipo) }}
                </span>
              </td>
              <td>{{ bitacora.descripcion }}</td>
              <td v-if="isSuperadmin">
                {{ bitacora.empleado?.nombre_completo || 'N/A' }}
              </td>
              <td v-if="isSuperadmin">
                {{ bitacora.empleado?.sucursal?.nombre || 'N/A' }}
              </td>
            </tr>
          </tbody>
        </table>
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
