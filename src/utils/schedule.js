/**
 * Utilidades para manejo de horarios
 */

/**
 * Verificar si estamos en horario de atención
 * @returns {boolean} true si estamos en horario de atención
 */
export const isBusinessHours = () => {
    try {
        const now = new Date();
        const currentDay = now.getDay(); // 0 = Domingo, 1 = Lunes, ..., 6 = Sábado
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();
        
        // Días de atención (por defecto lunes a viernes: 1-5)
        const businessDays = process.env.BUSINESS_DAYS 
            ? process.env.BUSINESS_DAYS.split(',').map(d => parseInt(d))
            : [1, 2, 3, 4, 5];
        
        // Verificar si es un día de atención
        if (!businessDays.includes(currentDay)) {
            return false;
        }
        
        // Horario de inicio
        const [startHour, startMinute] = (process.env.BUSINESS_HOURS_START || '09:00')
            .split(':').map(n => parseInt(n));
        
        // Horario de fin
        const [endHour, endMinute] = (process.env.BUSINESS_HOURS_END || '18:00')
            .split(':').map(n => parseInt(n));
        
        // Convertir a minutos desde medianoche para comparar
        const currentMinutes = currentHour * 60 + currentMinute;
        const startMinutes = startHour * 60 + startMinute;
        const endMinutes = endHour * 60 + endMinute;
        
        return currentMinutes >= startMinutes && currentMinutes < endMinutes;
    } catch (error) {
        console.error('Error al verificar horario:', error);
        return true; // Por defecto asumimos que está abierto
    }
};

/**
 * Obtener el próximo día de atención
 * @returns {string} Mensaje con el próximo día de atención
 */
export const getNextBusinessDay = () => {
    try {
        const now = new Date();
        const currentDay = now.getDay();
        
        const businessDays = process.env.BUSINESS_DAYS 
            ? process.env.BUSINESS_DAYS.split(',').map(d => parseInt(d))
            : [1, 2, 3, 4, 5];
        
        const daysOfWeek = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        
        // Buscar el próximo día de atención
        for (let i = 1; i <= 7; i++) {
            const nextDay = (currentDay + i) % 7;
            if (businessDays.includes(nextDay)) {
                const startTime = process.env.BUSINESS_HOURS_START || '09:00';
                
                if (i === 1) {
                    return `Mañana (${daysOfWeek[nextDay]}) a las ${startTime}`;
                } else if (i === 2) {
                    return `${daysOfWeek[nextDay]} a las ${startTime}`;
                } else {
                    return `${daysOfWeek[nextDay]} a las ${startTime}`;
                }
            }
        }
        
        return 'Próximamente';
    } catch (error) {
        console.error('Error al obtener próximo día:', error);
        return 'Próximamente';
    }
};

/**
 * Formatear horario de atención
 * @returns {string} Horario formateado
 */
export const getBusinessHoursFormatted = () => {
    try {
        const start = process.env.BUSINESS_HOURS_START || '09:00';
        const end = process.env.BUSINESS_HOURS_END || '18:00';
        
        const businessDays = process.env.BUSINESS_DAYS 
            ? process.env.BUSINESS_DAYS.split(',').map(d => parseInt(d))
            : [1, 2, 3, 4, 5];
        
        const daysOfWeek = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        
        const dayNames = businessDays.map(d => daysOfWeek[d]);
        
        let daysText;
        if (businessDays.length === 5 && businessDays.every(d => d >= 1 && d <= 5)) {
            daysText = 'Lunes a Viernes';
        } else if (businessDays.length === 1) {
            daysText = dayNames[0];
        } else {
            daysText = dayNames.join(', ');
        }
        
        return `${daysText}: ${start} - ${end}`;
    } catch (error) {
        console.error('Error al formatear horario:', error);
        return 'Lunes a Viernes: 09:00 - 18:00';
    }
};

/**
 * Verificar si una fecha específica es día de atención
 * @param {Date} date - Fecha a verificar
 * @returns {boolean} true si es día de atención
 */
export const isBusinessDay = (date) => {
    try {
        const day = date.getDay();
        
        const businessDays = process.env.BUSINESS_DAYS 
            ? process.env.BUSINESS_DAYS.split(',').map(d => parseInt(d))
            : [1, 2, 3, 4, 5];
        
        return businessDays.includes(day);
    } catch (error) {
        console.error('Error al verificar día:', error);
        return false;
    }
};
