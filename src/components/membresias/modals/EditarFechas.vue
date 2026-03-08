<template>
  <form id="formFechas" @submit.prevent="$emit('submit')">
    <div v-if="membresia" class="mb-3">
      <p><strong>Cliente:</strong> {{ membresia.cliente?.nombre_completo }}</p>
      <p><strong>Tipo:</strong> {{ membresia.tipo_membresia?.nombre }}</p>
    </div>
    <div class="mb-3">
      <label class="form-label">Fecha Inicio *</label>
      <input v-model="form.fecha_inicio" type="date" class="form-control" required>
    </div>
    <div class="mb-3">
      <label class="form-label">Fecha Vencimiento *</label>
      <input v-model="form.fecha_vencimiento" type="date" class="form-control" required>
    </div>
    <div v-if="errorMessage" class="alert alert-danger">{{ errorMessage }}</div>
  </form>
</template>

<script setup lang="ts">
import type { Membresia } from '@/types/gym';

defineProps<{
  form: { fecha_inicio: string; fecha_vencimiento: string };
  membresia: Membresia | null;
  errorMessage: string;
}>();

defineEmits<{
  submit: [];
}>();
</script>
