import { ref } from 'vue';
import { getReporteVentas, getReporteMembresias, fetchSucursales } from '@/services/gymApi';
import { supabase } from '@/utils/supabase';
import type { ReporteVentas, ReporteMembresias, Empleado, Sucursal } from '@/types/gym';

export function useReportes() {
  const reporteVentas = ref<ReporteVentas[]>([]);
  const reporteMembresias = ref<ReporteMembresias | null>(null);
  const empleados = ref<Empleado[]>([]);
  const sucursales = ref<Sucursal[]>([]);
  const loadingData = ref(true);

  const loadSucursales = async () => {
    const { data } = await fetchSucursales();
    if (data) {
      sucursales.value = data;
    }
  };

  const cargarEmpleados = async (sucursalId?: number | null) => {
    let query = supabase
      .from('empleados')
      .select('id, nombre_completo, sucursal_id')
      .eq('activo', true)
      .neq('rol', 'superadmin')
      .order('nombre_completo');
    
    if (sucursalId) {
      query = query.eq('sucursal_id', sucursalId);
    }
    
    const { data } = await query;
    
    if (data) {
      empleados.value = data as Empleado[];
    }
  };

  const cargarReportes = async (
    fechaDesde: string,
    fechaHasta: string,
    sucursalId?: number | null,
    empleadoId?: number | null
  ) => {
    if (!fechaDesde || !fechaHasta) {
      return;
    }

    loadingData.value = true;
    try {
      const { data: ventasData, error: reporteVentasError } = await getReporteVentas(
        fechaDesde,
        fechaHasta,
        sucursalId || undefined,
        empleadoId || undefined
      );

      if (reporteVentasError) {
        console.error('Error al cargar reporte de ventas:', reporteVentasError);
      } else if (ventasData) {
        reporteVentas.value = ventasData;
      }

      const { data: membresiasData, error: membresiasError } = await getReporteMembresias(
        sucursalId || undefined
      );

      if (membresiasError) {
        console.error('Error al cargar reporte de membresías:', membresiasError);
      } else if (membresiasData) {
        reporteMembresias.value = membresiasData;
      }
    } finally {
      loadingData.value = false;
    }
  };

  return {
    reporteVentas,
    reporteMembresias,
    empleados,
    sucursales,
    loadingData,
    loadSucursales,
    cargarEmpleados,
    cargarReportes
  };
}
