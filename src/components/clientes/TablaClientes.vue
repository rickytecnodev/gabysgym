<template>
  <div class="p-3 rounded-3 border bg-white">
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
                <template v-if="membresiaDisplay[cliente.id]">
                  <template v-if="membresiaDisplay[cliente.id].badgeClass !== 'text-muted'">
                    <span :class="['badge me-1', membresiaDisplay[cliente.id].badgeClass]">
                      {{ membresiaDisplay[cliente.id].label }}
                    </span>
                    <span v-if="membresiaDisplay[cliente.id].subLabel" :class="['badge me-1', membresiaDisplay[cliente.id].subLabel === 'Por vencer' ? 'bg-warning text-dark' : 'bg-danger']">
                      {{ membresiaDisplay[cliente.id].subLabel }}
                    </span>
                    <div v-if="membresiaDisplay[cliente.id].showVence && membresiaDisplay[cliente.id].fechaVence" class="small text-muted mt-1">
                      Vence: {{ formatFecha(membresiaDisplay[cliente.id].fechaVence!) }}
                    </div>
                  </template>
                  <span v-else class="text-muted">{{ membresiaDisplay[cliente.id].label }}</span>
                </template>
              </td>
              <td @click.stop>
                <button @click="$emit('editar', cliente)" class="btn btn-sm btn-outline-primary me-1" title="Editar">
                  <i class="fa-solid fa-edit"></i>
                </button>
                <button 
                  v-if="isSuperadmin"
                  @click="$emit('eliminar', cliente)" 
                  class="btn btn-sm btn-outline-danger" 
                  title="Eliminar"
                >
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
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Cliente } from '@/types/gym';
import type { ClienteConMembresias } from '@/composables/useClientes';
import { formatFecha } from '@/utils/dateFormatter';

const props = defineProps<{
  clientes: ClienteConMembresias[];
  isSuperadmin: boolean;
  loading?: boolean;
}>();

defineEmits<{
  'ver-detalle': [cliente: Cliente];
  'editar': [cliente: Cliente];
  'eliminar': [cliente: Cliente];
}>();

const membresiaDisplay = computed(() => {
  const record: Record<number, ReturnType<typeof getMembresiaDisplay>> = {};
  for (const c of props.clientes) {
    record[c.id] = getMembresiaDisplay(c);
  }
  return record;
});

function normalizarFecha(fecha: any): string | null {
  if (!fecha) return null;
  try {
    if (typeof fecha === 'string') {
      const s = fecha.trim();
      if (s.includes('T')) return s.split('T')[0];
      if (s.includes(' ')) return s.split(' ')[0];
      if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
    }
    const d = new Date(fecha);
    if (!isNaN(d.getTime())) {
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }
  } catch (_) {}
  return null;
}

function getMembresiaDisplay(cliente: ClienteConMembresias): { label: string; badgeClass: string; subLabel?: string; showVence?: boolean; fechaVence?: string | null } {
  const estado = cliente.estado_membresia_display ?? null;
  if (estado === null) {
    return { label: 'Sin membresías', badgeClass: 'text-muted' };
  }
  if (estado === 'cancelada') {
    return { label: 'Cancelada', badgeClass: 'bg-secondary' };
  }
  if (estado === 'vencida') {
    return { label: 'Vencida', badgeClass: 'bg-danger' };
  }
  // activa
  const n = cliente.membresias_activas ?? 0;
  const f = normalizarFecha(cliente.fecha_vencimiento_activa);
  let subLabel: string | undefined;
  if (f) {
    const hoy = new Date().toISOString().split('T')[0];
    const dias = Math.floor((new Date(f + 'T00:00:00').getTime() - new Date(hoy + 'T00:00:00').getTime()) / (1000 * 60 * 60 * 24));
    if (dias < 0) subLabel = 'Vencida';
    else if (dias <= 7) subLabel = 'Por vencer';
  }
  return {
    label: n > 0 ? `${n} activa(s)` : 'Activa',
    badgeClass: 'bg-success',
    subLabel,
    showVence: !!f,
    fechaVence: cliente.fecha_vencimiento_activa ?? null
  };
}
</script>
