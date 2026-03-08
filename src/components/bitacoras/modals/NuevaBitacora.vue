<template>
  <form id="formBitacora" @submit.prevent="$emit('submit')">
    <div class="mb-3">
      <label class="form-label">Fecha *</label>
      <input v-model="form.fecha" type="date" class="form-control" required disabled
        title="La fecha no se puede editar. Se usa la fecha actual automáticamente.">
      <small class="text-muted">La fecha se establece automáticamente con la fecha actual y no se puede modificar.</small>
    </div>
    <div class="mb-3">
      <label class="form-label">Tipo *</label>
      <select v-model="form.tipo" class="form-select" required>
        <option value="nota">Nota</option>
        <option value="incidente">Incidente</option>
        <option value="observacion">Observación</option>
      </select>
    </div>
    <div class="mb-3">
      <label class="form-label">Descripción *</label>
      <textarea v-model="form.descripcion" class="form-control" rows="4" required
        placeholder="Describe el incidente, nota u observación..."></textarea>
    </div>
    <div v-if="errorMessage" class="alert alert-danger">{{ errorMessage }}</div>
  </form>
</template>

<script setup lang="ts">
import type { BitacoraDiaForm } from '@/types/gym';

defineProps<{
  form: BitacoraDiaForm;
  errorMessage: string;
}>();

defineEmits<{
  submit: [];
}>();
</script>
