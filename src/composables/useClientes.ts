import { ref } from 'vue';
import { fetchClientes, createCliente, updateCliente, deleteCliente, fetchSucursales, fetchMembresias } from '@/services/gymApi';
import type { Cliente, ClienteForm, Sucursal } from '@/types/gym';
import Swal from 'sweetalert2';

interface ClienteConMembresias extends Cliente {
  membresias_activas?: number;
  fecha_vencimiento_activa?: string | null;
}

export function useClientes() {
  const clientes = ref<ClienteConMembresias[]>([]);
  const sucursales = ref<Sucursal[]>([]);
  const loading = ref(false);
  const loadingData = ref(true);

  const loadClientes = async (sucursalId: number | null) => {
    loadingData.value = true;
    try {
      const { data, error } = await fetchClientes(sucursalId);
      
      if (error) {
        Swal.fire('Error', error.message, 'error');
        return;
      }
      
      if (data) {
        const { data: membresias } = await fetchMembresias(sucursalId);
        
        clientes.value = data.map(cliente => {
          const membresiasDelCliente = membresias?.filter(m => 
            m.cliente_id === cliente.id && m.estado === 'activa'
          ) || [];
          
          const membresiaActiva = membresiasDelCliente.length > 0 
            ? membresiasDelCliente.sort((a, b) => 
                new Date(b.fecha_vencimiento).getTime() - new Date(a.fecha_vencimiento).getTime()
              )[0]
            : null;
          
          return {
            ...cliente,
            membresias_activas: membresiasDelCliente.length,
            fecha_vencimiento_activa: membresiaActiva?.fecha_vencimiento || null
          };
        });
      }
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

  const guardarCliente = async (formData: ClienteForm, sucursalId: number, clienteId?: number) => {
    loading.value = true;
    try {
      if (clienteId) {
        const { error } = await updateCliente(clienteId, formData);
        if (error) {
          return { error };
        }
        Swal.fire('Éxito', 'Cliente actualizado correctamente', 'success');
      } else {
        const { error } = await createCliente({ ...formData, sucursal_id: sucursalId });
        if (error) {
          return { error };
        }
        Swal.fire('Éxito', 'Cliente creado correctamente', 'success');
      }
      return { success: true };
    } catch (error: any) {
      return { error: { message: error.message || 'Error al guardar cliente' } };
    } finally {
      loading.value = false;
    }
  };

  const eliminarCliente = async (cliente: Cliente) => {
    const result = await Swal.fire({
      title: '¿Eliminar cliente?',
      text: `¿Estás seguro de eliminar a ${cliente.nombre_completo}? Esta acción no se puede deshacer y eliminará todas sus membresías asociadas.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#dc3545'
    });
    
    if (result.isConfirmed) {
      const { error } = await deleteCliente(cliente.id);
      
      if (error) {
        Swal.fire('Error', error.message, 'error');
        return { error };
      }
      
      Swal.fire('Éxito', 'Cliente eliminado correctamente', 'success');
      return { success: true };
    }
    return { cancelled: true };
  };

  return {
    clientes,
    sucursales,
    loading,
    loadingData,
    loadClientes,
    loadSucursales,
    guardarCliente,
    eliminarCliente
  };
}
