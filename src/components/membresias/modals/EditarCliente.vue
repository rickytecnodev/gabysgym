<template>
  <form id="formClienteMembresias" @submit.prevent="$emit('submit')">
    <div class="mb-3">
      <label class="form-label">Nombre Completo *</label>
      <input v-model="form.nombre_completo" type="text" class="form-control" required>
    </div>
    <div class="mb-3">
      <label class="form-label">Teléfono *</label>
      <input v-model="form.telefono" type="tel" class="form-control" required>
    </div>
    <div class="mb-3">
      <label class="form-label">Email</label>
      <input v-model="form.email" type="email" class="form-control">
    </div>
    <div class="mb-3">
      <label class="form-label">WhatsApp</label>
      <input v-model="form.whatsapp" type="tel" class="form-control">
    </div>
    <div class="mb-3">
      <label class="form-label">Dirección</label>
      <textarea v-model="form.direccion" class="form-control" rows="2"></textarea>
    </div>
    <div v-if="errorMessage" class="alert alert-danger">{{ errorMessage }}</div>
  </form>
</template>

<script setup lang="ts">
defineProps<{
  form: {
    nombre_completo: string;
    telefono: string;
    email: string;
    whatsapp: string;
    direccion: string;
  };
  errorMessage: string;
}>();

defineEmits<{
  submit: [];
}>();
</script>
