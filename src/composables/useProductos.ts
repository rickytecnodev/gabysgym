import { ref } from 'vue';
import { fetchProductos, createProducto, updateProducto, deleteProducto, fetchSucursales } from '@/services/gymApi';
import type { Producto, ProductoForm, Sucursal } from '@/types/gym';
import Swal from 'sweetalert2';

export function useProductos() {
  const productos = ref<Producto[]>([]);
  const sucursales = ref<Sucursal[]>([]);
  const loading = ref(false);
  const loadingData = ref(false);

  const loadProductos = async (sucursalId: number | null) => {
    loadingData.value = true;
    try {
      const { data, error } = await fetchProductos(sucursalId);
      if (error) {
        Swal.fire('Error', error.message, 'error');
        return;
      }
      productos.value = data || [];
    } finally {
      loadingData.value = false;
    }
  };

  const loadSucursales = async () => {
    const { data } = await fetchSucursales();
    if (data) {
      sucursales.value = data;
    }
  };

  const guardarProducto = async (formData: ProductoForm, sucursalId: number, productoId?: number) => {
    loading.value = true;
    try {
      if (productoId) {
        const { error } = await updateProducto(productoId, { ...formData, sucursal_id: sucursalId });
        if (error) {
          return { error };
        }
        Swal.fire('Éxito', 'Producto actualizado correctamente', 'success');
      } else {
        const { error } = await createProducto({ ...formData, sucursal_id: sucursalId });
        if (error) {
          return { error };
        }
        Swal.fire('Éxito', 'Producto creado correctamente', 'success');
      }
      return { success: true };
    } catch (error: any) {
      return { error: { message: error.message || 'Error al guardar producto' } };
    } finally {
      loading.value = false;
    }
  };

  const eliminarProducto = async (id: number) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      const { error } = await deleteProducto(id);
      if (error) {
        Swal.fire('Error', error.message, 'error');
        return { error };
      }
      Swal.fire('Éxito', 'Producto eliminado correctamente', 'success');
      return { success: true };
    }
    return { cancelled: true };
  };

  return {
    productos,
    sucursales,
    loading,
    loadingData,
    loadProductos,
    loadSucursales,
    guardarProducto,
    eliminarProducto
  };
}
