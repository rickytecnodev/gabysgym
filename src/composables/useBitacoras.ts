import { ref } from 'vue';
import { fetchBitacorasDia, createBitacoraDia } from '@/services/gymApi';
import type { BitacoraDia, BitacoraDiaForm } from '@/types/gym';
import Swal from 'sweetalert2';

export function useBitacoras() {
  const bitacoras = ref<BitacoraDia[]>([]);
  const loading = ref(false);
  const loadingData = ref(false);

  const loadBitacoras = async (
    empleadoId?: number | null,
    fechaDesde?: string | null,
    fechaHasta?: string | null,
    sucursalId?: number | null
  ) => {
    loadingData.value = true;
    try {
      const { data, error } = await fetchBitacorasDia(empleadoId, fechaDesde, fechaHasta, sucursalId);
      if (error) {
        Swal.fire('Error', error.message, 'error');
        return;
      }
      bitacoras.value = data || [];
    } finally {
      loadingData.value = false;
    }
  };

  const guardarBitacora = async (
    empleadoId: number,
    payload: BitacoraDiaForm
  ): Promise<{ success: boolean; error?: { message: string } }> => {
    loading.value = true;
    try {
      const { data, error } = await createBitacoraDia(empleadoId, payload);
      if (error) {
        Swal.fire('Error', error.message, 'error');
        return { success: false, error };
      }
      
      // Agregar la nueva bitácora al inicio del array
      if (data) {
        bitacoras.value.unshift(data);
      }
      
      Swal.fire('Éxito', 'Bitácora registrada correctamente', 'success');
      return { success: true };
    } finally {
      loading.value = false;
    }
  };

  return {
    bitacoras,
    loading,
    loadingData,
    loadBitacoras,
    guardarBitacora
  };
}
