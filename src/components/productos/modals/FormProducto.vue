<template>
  <form id="formProducto" @submit.prevent="$emit('submit')">
    <div v-if="isSuperadmin" class="mb-3">
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
      <label class="form-label">Nombre *</label>
      <input v-model="form.nombre" type="text" class="form-control" required>
    </div>
    <div class="mb-3">
      <label class="form-label">Descripción</label>
      <textarea v-model="form.descripcion" class="form-control" rows="2"></textarea>
    </div>
    <div class="row">
      <div class="col-md-6 mb-3">
        <label class="form-label">Precio *</label>
        <input v-model.number="form.precio" type="number" step="0.01" class="form-control" required>
      </div>
      <div class="col-md-6 mb-3">
        <label class="form-label">Stock *</label>
        <input v-model.number="form.stock" type="number" class="form-control" required>
      </div>
    </div>
    <div class="row">
      <div class="col-md-6 mb-3">
        <label class="form-label">Categoría</label>
        <select v-model="form.categoria" class="form-select">
          <option value="">Selecciona...</option>
          <option value="suplementos">Suplementos</option>
          <option value="ropa">Ropa</option>
          <option value="accesorios">Accesorios</option>
          <option value="bebidas">Bebidas</option>
          <option value="otros">Otros</option>
        </select>
      </div>
      <div class="col-md-6 mb-3">
        <label class="form-label">Estado *</label>
        <select v-model="form.estado" class="form-select" required>
          <option value="activo">Activo</option>
          <option value="inactivo">Inactivo</option>
        </select>
      </div>
    </div>
    <div v-if="errorMessage" class="alert alert-danger">{{ errorMessage }}</div>
  </form>
</template>

<script setup lang="ts">
import type { ProductoForm, Sucursal } from '@/types/gym';

defineProps<{
  form: ProductoForm;
  sucursales: Sucursal[];
  sucursalId: number | null;
  isSuperadmin: boolean;
  errorMessage: string;
}>();

defineEmits<{
  submit: [];
  'update:sucursalId': [v: number | null];
}>();
</script>
