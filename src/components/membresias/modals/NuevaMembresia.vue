<template>
  <form id="formMembresia" @submit.prevent="$emit('submit')">
    <div class="mb-3" v-if="isSuperadmin">
      <label class="form-label">Sucursal *</label>
      <select :value="sucursalId" class="form-select" required
        @change="$emit('update:sucursalId', ($event.target as HTMLSelectElement).value ? Number(($event.target as HTMLSelectElement).value) : null)">
        <option value="">Selecciona una sucursal</option>
        <option v-for="sucursal in sucursales" :key="sucursal.id" :value="sucursal.id">
          {{ sucursal.nombre }}
        </option>
      </select>
    </div>
    <div class="mb-3">
      <label class="form-label">Cliente *</label>
      <select v-model="form.cliente_id" class="form-select" required>
        <option value="">Selecciona un cliente</option>
        <option v-for="cliente in clientes" :key="cliente.id" :value="cliente.id">
          {{ cliente.nombre_completo }} - {{ cliente.telefono }}
        </option>
      </select>
    </div>
    <div class="mb-3">
      <label class="form-label">Tipo de Membresía *</label>
      <select v-model.number="form.tipo_membresia_id" class="form-select" required @change="$emit('change-tipo')">
        <option value="">Selecciona un tipo</option>
        <option v-for="tipo in tiposMembresia" :key="tipo.id" :value="tipo.id">
          {{ tipo.nombre }} - ${{ tipo.precio_mensual.toFixed(2) }}/mes
        </option>
      </select>
    </div>
    <div class="mb-3">
      <label class="form-label">Fecha de Inicio *</label>
      <input v-model="form.fecha_inicio" type="date" class="form-control" required>
    </div>
    <div class="mb-3">
      <label class="form-label">Fecha de Vencimiento *</label>
      <input v-model="form.fecha_vencimiento" type="date" class="form-control" required>
      <small class="text-muted">Se calcula automáticamente según el tipo, pero puedes editarla</small>
    </div>
    <div class="mb-3">
      <label class="form-label">Precio *</label>
      <input v-model.number="form.precio_mensual" type="number" step="0.01" class="form-control" required>
    </div>
    <div v-if="errorMessage" class="alert alert-danger">{{ errorMessage }}</div>
  </form>
</template>

<script setup lang="ts">
import type { MembresiaForm } from '@/types/gym';
import type { Sucursal, Cliente, TipoMembresia } from '@/types/gym';

defineProps<{
  form: MembresiaForm & { fecha_vencimiento?: string };
  sucursales: Sucursal[];
  clientes: Cliente[];
  tiposMembresia: TipoMembresia[];
  sucursalId: number | null;
  isSuperadmin: boolean;
  loading: boolean;
  errorMessage: string;
}>();

defineEmits<{
  submit: [];
  'change-tipo': [];
  'update:sucursalId': [value: number | null];
}>();
</script>
