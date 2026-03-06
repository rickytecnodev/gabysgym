/**
 * Formatea una fecha al formato DD/MMM/YYYY (ej: 10/Jul/2026)
 * @param fecha - Fecha en formato string, Date o cualquier formato válido
 * @returns Fecha formateada como "10/Jul/2026"
 */
export function formatFecha(fecha: string | Date | null | undefined): string {
  if (!fecha) return '';
  
  try {
    let fechaStr: string;
    
    // Convertir a string si es Date
    if (fecha instanceof Date) {
      fechaStr = fecha.toISOString();
    } else {
      fechaStr = fecha;
    }
    
    // Extraer solo la parte de fecha (YYYY-MM-DD) sin considerar zona horaria
    let fechaParte: string;
    if (fechaStr.includes('T')) {
      fechaParte = fechaStr.split('T')[0];
    } else if (fechaStr.includes(' ')) {
      fechaParte = fechaStr.split(' ')[0];
    } else {
      fechaParte = fechaStr;
    }
    
    // Validar formato YYYY-MM-DD
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fechaParte)) {
      return '';
    }
    
    // Parsear directamente sin usar Date para evitar problemas de zona horaria
    const [año, mes, dia] = fechaParte.split('-').map(Number);
    
    // Validar que los valores sean válidos
    if (isNaN(año) || isNaN(mes) || isNaN(dia) || mes < 1 || mes > 12 || dia < 1 || dia > 31) {
      return '';
    }
    
    // Meses abreviados en español
    const meses = [
      'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
      'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
    ];
    
    return `${dia}/${meses[mes - 1]}/${año}`;
  } catch (error) {
    console.error('Error al formatear fecha:', fecha, error);
    return '';
  }
}

/**
 * Convierte una fecha al formato YYYY-MM-DD para inputs de tipo date
 * @param fecha - Fecha en cualquier formato
 * @returns Fecha en formato YYYY-MM-DD o string vacío
 */
export function formatFechaInput(fecha: string | Date | null | undefined): string {
  if (!fecha) return '';
  
  try {
    let fechaObj: Date;
    
    if (typeof fecha === 'string') {
      if (fecha.includes('T')) {
        fechaObj = new Date(fecha.split('T')[0] + 'T00:00:00');
      } else if (fecha.includes(' ')) {
        fechaObj = new Date(fecha.split(' ')[0] + 'T00:00:00');
      } else {
        fechaObj = new Date(fecha + 'T00:00:00');
      }
    } else {
      fechaObj = new Date(fecha);
    }
    
    if (isNaN(fechaObj.getTime())) {
      return '';
    }
    
    const año = fechaObj.getFullYear();
    const mes = String(fechaObj.getMonth() + 1).padStart(2, '0');
    const dia = String(fechaObj.getDate()).padStart(2, '0');
    
    return `${año}-${mes}-${dia}`;
  } catch (error) {
    console.error('Error al formatear fecha para input:', fecha, error);
    return '';
  }
}

/**
 * Obtiene la fecha actual en formato YYYY-MM-DD usando la zona horaria local
 * @returns Fecha actual en formato YYYY-MM-DD
 */
export function getFechaActualLocal(): string {
  const hoy = new Date();
  const año = hoy.getFullYear();
  const mes = String(hoy.getMonth() + 1).padStart(2, '0');
  const dia = String(hoy.getDate()).padStart(2, '0');
  return `${año}-${mes}-${dia}`;
}

/**
 * Obtiene la fecha y hora actual en formato ISO usando la zona horaria local
 * @returns Fecha y hora actual en formato YYYY-MM-DDTHH:MM:SS
 */
export function getFechaHoraActualLocal(): string {
  const ahora = new Date();
  const año = ahora.getFullYear();
  const mes = String(ahora.getMonth() + 1).padStart(2, '0');
  const dia = String(ahora.getDate()).padStart(2, '0');
  const horas = String(ahora.getHours()).padStart(2, '0');
  const minutos = String(ahora.getMinutes()).padStart(2, '0');
  const segundos = String(ahora.getSeconds()).padStart(2, '0');
  return `${año}-${mes}-${dia}T${horas}:${minutos}:${segundos}`;
}

/**
 * Formatea el mes pagado de formato YYYY-MM a formato MMM/YYYY (ej: Jul/2026)
 * @param mesPagado - Mes pagado en formato YYYY-MM (ej: "2026-07")
 * @returns Mes formateado como "Jul/2026" o string vacío
 */
export function formatMesPagado(mesPagado: string | null | undefined): string {
  if (!mesPagado) return '';
  
  try {
    // El formato esperado es YYYY-MM
    const partes = mesPagado.split('-');
    if (partes.length !== 2) {
      return mesPagado; // Retornar el valor original si no tiene el formato esperado
    }
    
    const año = partes[0];
    const mesNum = parseInt(partes[1], 10);
    
    if (isNaN(mesNum) || mesNum < 1 || mesNum > 12) {
      return mesPagado; // Retornar el valor original si el mes no es válido
    }
    
    // Meses abreviados en español
    const meses = [
      'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
      'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
    ];
    
    return `${meses[mesNum - 1]}/${año}`;
  } catch (error) {
    console.error('Error al formatear mes pagado:', mesPagado, error);
    return mesPagado || '';
  }
}
