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
    <div v-else class="gy-2">
      <div v-for="cliente in clientes" :key="cliente.id" @click="$emit('ver-detalle', cliente)">
        <div :class="['p-3 rounded-3 border bg-white mb-2 borde-izq-tarjeta', getBordeIzqClass(cliente)]" style="cursor: pointer;">
          <div class="d-flex justify-content-between align-items-start">
            <div class="flex-grow-1">
              <h6 class="mb-1 fw-bold">{{ cliente.nombre_completo }}</h6>
              <span class="small text-muted" v-if="cliente.email">
                <i class="fa-solid fa-envelope me-1"></i>
                {{ cliente.email }}
              </span>
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
              {{ (cliente.sucursal as any)?.nombre }}
            </small>
          </div>
          <div class="d-flex justify-content-between align-items-start">
            <div class="flex-grow-1">
              <div class="small text-muted">Membresías</div>
              <template v-if="getMembresiaDisplay(cliente).badgeClass !== 'text-muted'">
                <span :class="['badge me-1', getMembresiaDisplay(cliente).badgeClass]">{{ getMembresiaDisplay(cliente).label }}</span>
                <span v-if="getMembresiaDisplay(cliente).subLabel" :class="['badge me-1', getMembresiaDisplay(cliente).subLabel === 'Por vencer' ? 'bg-warning text-dark' : 'bg-danger']">
                  {{ getMembresiaDisplay(cliente).subLabel }}
                </span>
                <div v-if="getMembresiaDisplay(cliente).showVence && getMembresiaDisplay(cliente).fechaVence" class="small mt-1" :class="getVencimientoTextClass(getMembresiaDisplay(cliente).fechaVence!)">
                  Vence: {{ formatFecha(getMembresiaDisplay(cliente).fechaVence!) }}
                </div>
              </template>
              <span v-else class="text-muted small">{{ getMembresiaDisplay(cliente).label }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Cliente } from '@/types/gym';
import type { ClienteConMembresias } from '@/composables/useClientes';
import { formatFecha } from '@/utils/dateFormatter';

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

const normalizarFecha = (fecha: any): string | null => {
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
};

const getBordeIzqClass = (cliente: ClienteConMembresias): string => {
  const estado = cliente.estado_membresia_display ?? null;
  if (estado === 'vencida') return 'borde-izq-rojo';
  if (estado === 'cancelada' || estado === null) return 'borde-izq-gris';
  if (estado === 'activa') {
    const f = normalizarFecha(cliente.fecha_vencimiento_activa);
    if (!f) return 'borde-izq-verde';
    const hoy = new Date().toISOString().split('T')[0];
    const dias = Math.floor((new Date(f + 'T00:00:00').getTime() - new Date(hoy + 'T00:00:00').getTime()) / (1000 * 60 * 60 * 24));
    if (dias < 0) return 'borde-izq-rojo';
    if (dias <= 7) return 'borde-izq-amarillo';
    return 'borde-izq-verde';
  }
  return 'borde-izq-gris';
};

function getMembresiaDisplay(cliente: ClienteConMembresias): { label: string; badgeClass: string; subLabel?: string; showVence?: boolean; fechaVence?: string | null } {
  const estado = cliente.estado_membresia_display ?? null;
  if (estado === null) return { label: 'Sin membresías', badgeClass: 'text-muted' };
  if (estado === 'cancelada') return { label: 'Cancelada', badgeClass: 'bg-secondary' };
  if (estado === 'vencida') return { label: 'Vencida', badgeClass: 'bg-danger' };
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

const getVencimientoTextClass = (fecha: string): string => {
  const f = normalizarFecha(fecha);
  if (!f) return 'text-muted';
  const hoy = new Date().toISOString().split('T')[0];
  const dias = Math.floor((new Date(f + 'T00:00:00').getTime() - new Date(hoy + 'T00:00:00').getTime()) / (1000 * 60 * 60 * 24));
  if (dias < 0) return 'text-danger fw-bold';
  if (dias <= 7) return 'text-warning fw-bold';
  return 'text-muted';
};
</script>

<style scoped>
.borde-izq-tarjeta {
  border-left-width: 5px !important;
  border-left-style: solid !important;
  transition: transform 0.2s, box-shadow 0.2s;
}

.borde-izq-verde { border-left-color: var(--bs-success) !important; }
.borde-izq-amarillo { border-left-color: var(--bs-warning) !important; }
.borde-izq-rojo { border-left-color: var(--bs-danger) !important; }
.borde-izq-gris { border-left-color: var(--bs-secondary) !important; }

.borde-izq-tarjeta:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1) !important;
}
</style>
