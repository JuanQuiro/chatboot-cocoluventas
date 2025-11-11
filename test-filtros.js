/**
 * Script de prueba para verificar filtros de precios
 */

import filtrosCatalogoService from './src/services/filtros-catalogo.service.js';
import catalogoCompletoService from './src/services/catalogo-completo.service.js';

console.log('🧪 PRUEBAS DE FILTROS DE CATÁLOGO');
console.log('=' + '='.repeat(70));
console.log();

// Esperar a que el catálogo se cargue
setTimeout(() => {
    const consultas = [
        'mayor de 30 dolares',
        'menor de 100 mil',
        'entre 50 y 150 mil',
        'oro barato',
        'plata caro',
        'anillos menor de 80 mil',
        'productos premium',
        'oro mayor de 200 mil'
    ];

    consultas.forEach(consulta => {
        console.log(`\n📝 Consulta: "${consulta}"`);
        console.log('-'.repeat(70));
        
        const busqueda = filtrosCatalogoService.buscarConFiltros(consulta);
        
        console.log(`✅ Encontrados: ${busqueda.total} productos`);
        console.log(`📋 Filtros aplicados:`);
        
        if (busqueda.filtros.precioMin) {
            console.log(`   💰 Precio mínimo: $${busqueda.filtros.precioMin.toLocaleString('es-CO')} COP`);
        }
        if (busqueda.filtros.precioMax) {
            console.log(`   💰 Precio máximo: $${busqueda.filtros.precioMax.toLocaleString('es-CO')} COP`);
        }
        if (busqueda.filtros.material) {
            console.log(`   ✨ Material: ${busqueda.filtros.material}`);
        }
        if (busqueda.filtros.categoria) {
            console.log(`   📦 Categoría: ${busqueda.filtros.categoria}`);
        }
        
        if (busqueda.resultados.length > 0) {
            console.log(`\n   📄 Ejemplos (primeros 3):`);
            busqueda.resultados.slice(0, 3).forEach(p => {
                console.log(`      • Pág ${p.page}: ${p.name} - ${p.price_text}`);
            });
        }
    });

    console.log('\n' + '='.repeat(71));
    console.log('✅ Pruebas completadas');
    
    // Estadísticas del catálogo
    const stats = catalogoCompletoService.getEstadisticas();
    console.log('\n📊 ESTADÍSTICAS DEL CATÁLOGO:');
    console.log(`   Total productos: ${stats.total}`);
    console.log(`   Con precio: ${stats.conPrecio}`);
    console.log(`   Con keywords: ${stats.conKeywords}`);
    
    process.exit(0);
}, 1000);
