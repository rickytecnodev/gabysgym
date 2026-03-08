<template>
  <div v-if="cliente">
    <div class="row mb-3">
      <div class="col-md-6">
        <h6>Información Personal</h6>
        <p><strong>Nombre:</strong> {{ cliente.nombre_completo }}</p>
        <p><strong>Email:</strong> {{ cliente.email || 'N/A' }}</p>
        <p v-if="isSuperadmin"><strong>Sucursal:</strong> {{ cliente.sucursal?.nombre || 'N/A' }}</p>
      </div>
      <div class="col-md-6">
        <h6>Contacto</h6>
        <p>
          <i class="fa-solid fa-phone me-1"></i>
          <strong>Teléfono:</strong> {{ cliente.telefono }}
        </p>
        <p v-if="cliente.whatsapp">
          <i class="fa-brands fa-whatsapp me-1 text-success"></i>
          <strong>WhatsApp:</strong> {{ cliente.whatsapp }}
        </p>
        <p v-if="cliente.direccion">
          <i class="fa-solid fa-map-marker-alt me-1"></i>
          <strong>Dirección:</strong> {{ cliente.direccion }}
        </p>
      </div>
    </div>
    <hr>
    <h6>Membresías</h6>
    <div v-if="detalleMembresiaDisplay.badgeClass !== 'text-muted'">
      <span :class="['badge me-1', detalleMembresiaDisplay.badgeClass]">{{ detalleMembresiaDisplay.label }}</span>
      <span v-if="detalleMembresiaDisplay.subLabel" :class="['badge me-1', detalleMembresiaDisplay.subLabel === 'Por vencer' ? 'bg-warning text-dark' : 'bg-danger']">
        {{ detalleMembresiaDisplay.subLabel }}
      </span>
      <div v-if="detalleMembresiaDisplay.showVence && detalleMembresiaDisplay.fechaVence" class="mt-2">
        <strong>Próxima fecha de vencimiento:</strong> {{ formatFecha(detalleMembresiaDisplay.fechaVence) }}
      </div>
    </div>
    <p v-else class="text-muted">{{ detalleMembresiaDisplay.label }}</p>
  </div>
</template>

<script setup lang="ts">
import type { Cliente } from '@/types/gym';
import { formatFecha } from '@/utils/dateFormatter';

defineProps<{
  cliente: Cliente | null;
  isSuperadmin: boolean;
  detalleMembresiaDisplay: {
    label: string;
    badgeClass: string;
    subLabel?: string;
    showVence?: boolean;
    fechaVence?: string;
  };
}>();

defineEmits<{
  editar: [c: Cliente];
  eliminar: [c: Cliente];
}>();
</script>
