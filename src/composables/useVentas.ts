import { ref } from 'vue';
import { 
  fetchVentas, 
  createVenta, 
  updateVentaEstado,
  fetchProductos,
  fetchClientes,
  fetchSucursales,
  fetchPagosMembresiaConFiltros
} from '@/services/gymApi';
import type { Venta, Producto, Cliente, VentaForm, Sucursal, PagoMembresia } from '@/types/gym';
import Swal from 'sweetalert2';

export function useVentas() {
  const ventas = ref<Venta[]>([]);
  const pagosMembresia = ref<PagoMembresia[]>([]);
  const productosDisponibles = ref<Producto[]>([]);
  const clientes = ref<Cliente[]>([]);
  const sucursales = ref<Sucursal[]>([]);
  const loading = ref(false);
  const loadingData = ref(false);

  const loadVentas = async (
    sucursalId: number | null,
    fechaDesde?: string,
    fechaHasta?: string
  ) => {
    loadingData.value = true;
    try {
      const { data, error } = await fetchVentas(
        sucursalId,
        undefined,
        fechaDesde,
        fechaHasta
      );
      if (error) {
        Swal.fire('Error', error.message, 'error');
        return;
      }
      ventas.value = data || [];
    } finally {
      loadingData.value = false;
    }
  };

  const loadPagosMembresia = async (
    sucursalId: number | null,
    fechaDesde?: string,
    fechaHasta?: string
  ) => {
    try {
      const { data, error } = await fetchPagosMembresiaConFiltros(
        sucursalId,
        undefined,
        fechaDesde,
        fechaHasta
      );
      if (error) {
        console.error('Error al cargar pagos de membresías:', error);
        return;
      }
      pagosMembresia.value = data || [];
    } finally {
      // El loadingData se maneja en loadVentas que se llama junto con esta función
    }
  };

  const loadProductos = async (sucursalId: number | null) => {
    const { data } = await fetchProductos(sucursalId);
    if (data) {
      productosDisponibles.value = data.filter(p => p.estado === 'activo');
    }
  };

  const loadClientes = async (sucursalId: number | null) => {
    const { data } = await fetchClientes(sucursalId);
    if (data) {
      clientes.value = data;
    }
  };

  const loadSucursales = async () => {
    const { data } = await fetchSucursales();
    if (data) {
      sucursales.value = data;
    }
  };

  const guardarVenta = async (
    formData: VentaForm,
    sucursalId: number,
    empleadoId: number
  ) => {
    loading.value = true;
    try {
      const { error } = await createVenta({
        ...formData,
        sucursal_id: sucursalId,
        empleado_id: empleadoId
      });

      if (error) {
        return { error };
      }

      Swal.fire('Éxito', 'Venta registrada correctamente', 'success');
      return { success: true };
    } catch (error: any) {
      return { error: { message: error.message || 'Error al guardar venta' } };
    } finally {
      loading.value = false;
    }
  };

  const marcarPagado = async (ventaId: number) => {
    const result = await Swal.fire({
      title: '¿Marcar como pagado?',
      text: `¿Estás seguro de marcar la venta #${ventaId} como pagada?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, marcar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#28a745'
    });

    if (result.isConfirmed) {
      const { error } = await updateVentaEstado(ventaId, 'pagado');
      if (error) {
        Swal.fire('Error', error.message, 'error');
        return { error };
      }
      Swal.fire('Éxito', 'Venta marcada como pagada', 'success');
      return { success: true };
    }
    return { cancelled: true };
  };

  return {
    ventas,
    pagosMembresia,
    productosDisponibles,
    clientes,
    sucursales,
    loading,
    loadingData,
    loadVentas,
    loadPagosMembresia,
    loadProductos,
    loadClientes,
    loadSucursales,
    guardarVenta,
    marcarPagado
  };
}
