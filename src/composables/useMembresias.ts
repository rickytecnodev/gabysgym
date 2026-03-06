import { ref } from 'vue';
import { 
  fetchMembresias, 
  createMembresia, 
  updateMembresiaEstado,
  fetchClientes,
  fetchTiposMembresia,
  fetchPagosMembresia,
  createPagoMembresia,
  updateMembresiaFechas,
  fetchSucursales,
  deleteMembresia,
  updateCliente
} from '@/services/gymApi';
import { supabase } from '@/utils/supabase';
import type { Membresia, Cliente, TipoMembresia, MembresiaForm, PagoMembresia, Sucursal } from '@/types/gym';
import Swal from 'sweetalert2';

export function useMembresias() {
  const membresias = ref<Membresia[]>([]);
  const clientes = ref<Cliente[]>([]);
  const tiposMembresia = ref<TipoMembresia[]>([]);
  const pagosMembresia = ref<PagoMembresia[]>([]);
  const sucursales = ref<Sucursal[]>([]);
  const loading = ref(false);
  const loadingData = ref(false);

  // Función helper para normalizar fechas
  const normalizarFecha = (fecha: any): string | null => {
    if (!fecha) return null;
    
    try {
      if (typeof fecha === 'string') {
        const fechaStr = fecha.trim();
        if (fechaStr.includes('T')) {
          return fechaStr.split('T')[0];
        } else if (fechaStr.includes(' ')) {
          return fechaStr.split(' ')[0];
        } else if (/^\d{4}-\d{2}-\d{2}$/.test(fechaStr)) {
          return fechaStr;
        }
      }
      
      const fechaObj = new Date(fecha);
      if (!isNaN(fechaObj.getTime())) {
        const año = fechaObj.getFullYear();
        const mes = String(fechaObj.getMonth() + 1).padStart(2, '0');
        const dia = String(fechaObj.getDate()).padStart(2, '0');
        return `${año}-${mes}-${dia}`;
      }
    } catch (e) {
      console.error('Error al normalizar fecha:', fecha, e);
    }
    
    return null;
  };

  const loadMembresias = async (sucursalId: number | null, estado?: string, clienteId?: number) => {
    loadingData.value = true;
    try {
      const { data, error } = await fetchMembresias(sucursalId, estado, clienteId);
      if (error) {
        Swal.fire('Error', error.message, 'error');
        return;
      }
      membresias.value = data || [];
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

  const loadClientes = async (sucursalId: number | null) => {
    const { data } = await fetchClientes(sucursalId);
    if (data) {
      clientes.value = data;
    }
  };

  const loadTiposMembresia = async () => {
    const { data } = await fetchTiposMembresia();
    if (data) {
      tiposMembresia.value = data;
    }
  };

  const loadPagosMembresia = async (membresiaId: number) => {
    const { data } = await fetchPagosMembresia(membresiaId);
    if (data) {
      pagosMembresia.value = data;
    }
  };

  const actualizarEstados = async (mostrarMensaje = true) => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    for (const membresia of membresias.value) {
      if (membresia.estado === 'activa') {
        const fechaVencimiento = new Date(membresia.fecha_vencimiento);
        fechaVencimiento.setHours(0, 0, 0, 0);
        
        if (fechaVencimiento < hoy) {
          await updateMembresiaEstado(membresia.id, 'vencida');
        }
      }
    }

    if (mostrarMensaje) {
      Swal.fire('Éxito', 'Estados actualizados', 'success');
    }
  };

  const guardarMembresia = async (
    formData: MembresiaForm & { fecha_vencimiento?: string },
    sucursalId: number,
    fechaVencimiento: string
  ) => {
    loading.value = true;
    try {
      const tipoMembresiaId = formData.tipo_membresia_id === -1 
        ? (tiposMembresia.value.length > 0 ? tiposMembresia.value[0].id : null)
        : formData.tipo_membresia_id;

      if (!tipoMembresiaId) {
        return { error: 'Error: no hay tipos de membresía disponibles' };
      }

      const { error } = await createMembresia({
        cliente_id: formData.cliente_id,
        tipo_membresia_id: tipoMembresiaId,
        fecha_inicio: formData.fecha_inicio,
        precio_mensual: formData.precio_mensual,
        fecha_vencimiento: fechaVencimiento,
        sucursal_id: sucursalId
      });

      if (error) {
        return { error };
      }

      Swal.fire('Éxito', 'Membresía creada correctamente', 'success');
      return { success: true };
    } catch (error: any) {
      return { error: { message: error.message || 'Error al guardar membresía' } };
    } finally {
      loading.value = false;
    }
  };

  const guardarPago = async (
    formPago: any,
    membresia: Membresia,
    tiposMembresiaList: TipoMembresia[],
    empleadoId: number,
    extenderVencimiento: boolean
  ) => {
    loading.value = true;
    try {
      const { error: pagoError } = await createPagoMembresia({
        ...formPago,
        empleado_id: empleadoId
      });

      if (pagoError) {
        return { error: pagoError };
      }

      const debeExtender = membresia.estado === 'vencida' || 
                           membresia.estado === 'cancelada' || 
                           extenderVencimiento;
      
      if (debeExtender && membresia.tipo_membresia) {
        const tipoMembresia = tiposMembresiaList.find(t => t.id === membresia.tipo_membresia_id);
        if (tipoMembresia) {
          let nuevaFechaVencimiento: Date;
          
          if (membresia.estado === 'vencida' || membresia.estado === 'cancelada') {
            nuevaFechaVencimiento = new Date();
            nuevaFechaVencimiento.setDate(nuevaFechaVencimiento.getDate() + tipoMembresia.duracion_dias);
          } else {
            const fechaVencimientoActual = new Date(membresia.fecha_vencimiento);
            nuevaFechaVencimiento = new Date(fechaVencimientoActual);
            nuevaFechaVencimiento.setDate(nuevaFechaVencimiento.getDate() + tipoMembresia.duracion_dias);
          }
          
          const nuevoEstado = 'activa';
          await updateMembresiaEstado(membresia.id, nuevoEstado);
          
          await supabase
            .from('membresias')
            .update({ 
              fecha_vencimiento: nuevaFechaVencimiento.toISOString().split('T')[0],
              estado: nuevoEstado
            })
            .eq('id', membresia.id);
        }
      } else if (membresia.estado === 'vencida' || membresia.estado === 'cancelada') {
        await updateMembresiaEstado(membresia.id, 'activa');
      }

      Swal.fire('Éxito', 'Pago registrado correctamente', 'success');
      return { success: true };
    } catch (error: any) {
      return { error: { message: error.message || 'Error al registrar pago' } };
    } finally {
      loading.value = false;
    }
  };

  const guardarFechas = async (
    membresiaId: number,
    fechaInicio: string,
    fechaVencimiento: string,
    estadoActual: string
  ) => {
    loading.value = true;
    try {
      const fechaVenc = new Date(fechaVencimiento);
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      fechaVenc.setHours(0, 0, 0, 0);
      
      let nuevoEstado: 'activa' | 'vencida' | 'cancelada' | null = null;

      if (fechaVenc < hoy) {
        if (estadoActual !== 'cancelada') {
          nuevoEstado = 'vencida';
        }
      } else {
        if (estadoActual === 'cancelada' || estadoActual === 'vencida') {
          nuevoEstado = 'activa';
        } else if (estadoActual === 'activa') {
          nuevoEstado = 'activa';
        }
      }

      const { error } = await updateMembresiaFechas(membresiaId, fechaInicio, fechaVencimiento);

      if (error) {
        return { error };
      }

      if (nuevoEstado && nuevoEstado !== estadoActual) {
        await updateMembresiaEstado(membresiaId, nuevoEstado);
      }

      const mensajeEstado = nuevoEstado && nuevoEstado !== estadoActual 
        ? (nuevoEstado === 'vencida' ? ' y marcada como vencida' : ' y reactivada')
        : '';
      
      Swal.fire('Éxito', 'Fechas actualizadas correctamente' + mensajeEstado, 'success');
      return { success: true };
    } catch (error: any) {
      return { error: { message: error.message || 'Error al actualizar fechas' } };
    } finally {
      loading.value = false;
    }
  };

  const guardarCliente = async (clienteId: number, formData: any) => {
    loading.value = true;
    try {
      const { error } = await updateCliente(clienteId, formData);
      
      if (error) {
        return { error };
      }
      
      Swal.fire('Éxito', 'Cliente actualizado correctamente', 'success');
      return { success: true };
    } catch (error: any) {
      return { error: { message: error.message || 'Error al actualizar cliente' } };
    } finally {
      loading.value = false;
    }
  };

  const cancelarMembresia = async (id: number) => {
    const result = await Swal.fire({
      title: '¿Cancelar membresía?',
      text: 'La membresía se marcará como cancelada',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, cancelar',
      cancelButtonText: 'No'
    });

    if (result.isConfirmed) {
      const { error } = await updateMembresiaEstado(id, 'cancelada');
      if (error) {
        Swal.fire('Error', error.message, 'error');
        return { error };
      }
      Swal.fire('Éxito', 'Membresía cancelada', 'success');
      return { success: true };
    }
    return { cancelled: true };
  };

  const reactivarMembresia = async (membresia: Membresia) => {
    const hoy = new Date();
    const fechaVencimiento = new Date(membresia.fecha_vencimiento);
    
    let mensaje = '¿Reactivar esta membresía?';
    if (fechaVencimiento < hoy) {
      mensaje = 'La membresía está vencida. ¿Deseas reactivarla? Se recomienda registrar un pago para extender la fecha de vencimiento.';
    }
    
    const result = await Swal.fire({
      title: '¿Reactivar membresía?',
      text: mensaje,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, reactivar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#28a745'
    });

    if (result.isConfirmed) {
      const { error } = await updateMembresiaEstado(membresia.id, 'activa');
      if (error) {
        Swal.fire('Error', error.message, 'error');
        return { error };
      }
      Swal.fire('Éxito', 'Membresía reactivada correctamente', 'success');
      return { success: true };
    }
    return { cancelled: true };
  };

  const eliminarMembresia = async (membresia: Membresia) => {
    const result = await Swal.fire({
      title: '¿Eliminar membresía?',
      text: `¿Estás seguro de eliminar esta membresía de ${membresia.cliente?.nombre_completo}? Esta acción no se puede deshacer y eliminará todos los pagos asociados.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#dc3545'
    });
    
    if (result.isConfirmed) {
      const { error } = await deleteMembresia(membresia.id);
      
      if (error) {
        Swal.fire('Error', error.message, 'error');
        return { error };
      }
      
      Swal.fire('Éxito', 'Membresía eliminada correctamente', 'success');
      return { success: true };
    }
    return { cancelled: true };
  };

  return {
    membresias,
    clientes,
    tiposMembresia,
    pagosMembresia,
    sucursales,
    loading,
    loadingData,
    normalizarFecha,
    loadMembresias,
    loadSucursales,
    loadClientes,
    loadTiposMembresia,
    loadPagosMembresia,
    actualizarEstados,
    guardarMembresia,
    guardarPago,
    guardarFechas,
    guardarCliente,
    cancelarMembresia,
    reactivarMembresia,
    eliminarMembresia
  };
}
