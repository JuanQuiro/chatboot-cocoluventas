#!/bin/bash

# Script de Organización Automática del Proyecto
# Mueve archivos a sus ubicaciones correctas

set -e

echo "🗂️  =============================================="
echo "🗂️   ORGANIZACIÓN AUTOMÁTICA DEL PROYECTO"
echo "🗂️  =============================================="
echo ""

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Crear estructura de carpetas
echo -e "${BLUE}📁 Creando estructura de carpetas...${NC}"
mkdir -p docs/{arquitectura,guias,implementacion,changelog,actualizacion}
mkdir -p legacy/{apps,scripts,python}
mkdir -p scripts/{catalogo,deployment,utils}
mkdir -p config/examples

echo -e "${GREEN}✅ Estructura creada${NC}"
echo ""

# Mover documentación de arquitectura
echo -e "${BLUE}📚 Organizando documentación de arquitectura...${NC}"
for file in ARQUITECTURA*.md ANALISIS*.md SISTEMA*.md; do
    if [ -f "$file" ]; then
        mv "$file" docs/arquitectura/ 2>/dev/null || true
        echo "  → $file → docs/arquitectura/"
    fi
done

# Mover guías y manuales
echo -e "${BLUE}📖 Organizando guías y manuales...${NC}"
for file in GUIA*.md INSTRUCCIONES*.md COMO*.md INICIO*.md INSTALACION*.md; do
    if [ -f "$file" ]; then
        mv "$file" docs/guias/ 2>/dev/null || true
        echo "  → $file → docs/guias/"
    fi
done

# Mover documentación de implementación
echo -e "${BLUE}🔧 Organizando documentación de implementación...${NC}"
for file in IMPLEMENTACION*.md MEJORAS*.md CORRECCIONES*.md FLUJOS*.md FLUJO*.md; do
    if [ -f "$file" ]; then
        mv "$file" docs/implementacion/ 2>/dev/null || true
        echo "  → $file → docs/implementacion/"
    fi
done

# Mover changelog y progreso
echo -e "${BLUE}📝 Organizando changelog...${NC}"
for file in CHANGELOG*.md PROGRESO*.md RESUMEN*.md TRABAJO*.md PERFECCION*.md; do
    if [ -f "$file" ]; then
        mv "$file" docs/changelog/ 2>/dev/null || true
        echo "  → $file → docs/changelog/"
    fi
done

# Mover documentación de actualización
echo -e "${BLUE}🔄 Organizando documentación de actualización...${NC}"
for file in ACTUALIZACION*.md CAMBIOS*.txt; do
    if [ -f "$file" ]; then
        mv "$file" docs/actualizacion/ 2>/dev/null || true
        echo "  → $file → docs/actualizacion/"
    fi
done

# Mover documentación específica
echo -e "${BLUE}📋 Organizando documentación específica...${NC}"
for file in ADAPTADORES*.md BUILDERBOT*.md BOTS*.md CATALOGO*.md DASHBOARD*.md; do
    if [ -f "$file" ]; then
        mv "$file" docs/arquitectura/ 2>/dev/null || true
        echo "  → $file → docs/arquitectura/"
    fi
done

# Mover deployment y DevOps
for file in DEPLOYMENT*.md AMBIENTES*.md PRODUCTION*.md; do
    if [ -f "$file" ]; then
        mv "$file" docs/guias/ 2>/dev/null || true
        echo "  → $file → docs/guias/"
    fi
done

# Mover documentación de seguridad y testing
for file in SEGURIDAD*.md TESTING*.md TESTS*.md; do
    if [ -f "$file" ]; then
        mv "$file" docs/implementacion/ 2>/dev/null || true
        echo "  → $file → docs/implementacion/"
    fi
done

# Mover documentación de permisos y roles
for file in PERMISOS*.md SUPER_ADMIN*.md MULTI_TENANT*.md; do
    if [ -f "$file" ]; then
        mv "$file" docs/arquitectura/ 2>/dev/null || true
        echo "  → $file → docs/arquitectura/"
    fi
done

# Mover aplicaciones legacy
echo ""
echo -e "${BLUE}🗄️  Moviendo aplicaciones legacy...${NC}"
for file in app-arquitectura-senior.js app-mejorado.js ecosystem.microservices.js; do
    if [ -f "$file" ]; then
        mv "$file" legacy/apps/ 2>/dev/null || true
        echo "  → $file → legacy/apps/"
    fi
done

# Mover scripts Python a legacy
echo -e "${BLUE}🐍 Moviendo scripts Python...${NC}"
for file in *.py; do
    if [ -f "$file" ] && [ "$file" != "REORGANIZAR_PROYECTO.py" ]; then
        # Scripts de catálogo van a scripts/catalogo
        if [[ "$file" == *"catalogo"* ]] || [[ "$file" == *"producto"* ]]; then
            mv "$file" scripts/catalogo/ 2>/dev/null || true
            echo "  → $file → scripts/catalogo/"
        else
            mv "$file" legacy/python/ 2>/dev/null || true
            echo "  → $file → legacy/python/"
        fi
    fi
done

# Mover scripts de shell
echo -e "${BLUE}📜 Organizando scripts de shell...${NC}"
for file in *.sh; do
    if [ -f "$file" ] && [ "$file" != "ORGANIZAR_PROYECTO.sh" ]; then
        # Scripts de catálogo
        if [[ "$file" == *"catalogo"* ]]; then
            mv "$file" scripts/catalogo/ 2>/dev/null || true
            echo "  → $file → scripts/catalogo/"
        # Scripts de logs
        elif [[ "$file" == *"log"* ]]; then
            mv "$file" scripts/utils/ 2>/dev/null || true
            echo "  → $file → scripts/utils/"
        # Otros scripts
        else
            mv "$file" scripts/utils/ 2>/dev/null || true
            echo "  → $file → scripts/utils/"
        fi
    fi
done

# Mover archivos de configuración de ejemplo
echo -e "${BLUE}⚙️  Organizando configuración...${NC}"
if [ -f ".env.example" ]; then
    cp .env.example config/examples/ 2>/dev/null || true
    echo "  → .env.example → config/examples/"
fi

# Mover test files legacy
echo -e "${BLUE}🧪 Moviendo archivos de test legacy...${NC}"
for file in test-*.js; do
    if [ -f "$file" ]; then
        mv "$file" legacy/apps/ 2>/dev/null || true
        echo "  → $file → legacy/apps/"
    fi
done

# Mover documentación restante a docs/
echo ""
echo -e "${BLUE}📄 Moviendo documentación restante...${NC}"
for file in *.md; do
    if [ -f "$file" ]; then
        # Mantener estos en la raíz
        if [[ "$file" == "README.md" ]] || [[ "$file" == "LICENSE" ]] || [[ "$file" == "CONTRIBUTING.md" ]]; then
            continue
        fi
        
        # Mover el resto a docs/
        mv "$file" docs/ 2>/dev/null || true
        echo "  → $file → docs/"
    fi
done

# Crear índice de documentación
echo ""
echo -e "${BLUE}📑 Creando índice de documentación...${NC}"
cat > docs/README.md << 'EOF'
# 📚 Documentación del Proyecto

Toda la documentación del proyecto está organizada en las siguientes carpetas:

## 📁 Estructura

### 🏗️ Arquitectura (`arquitectura/`)
Documentación técnica sobre la arquitectura del sistema:
- Análisis de arquitectura
- Sistemas y componentes
- Adaptadores y providers
- Base de datos y modelos
- Multi-tenant

### 📖 Guías (`guias/`)
Guías de uso, instalación y deployment:
- Guías de inicio rápido
- Instrucciones de instalación
- Guías de deployment
- Ambientes y configuración

### 🔧 Implementación (`implementacion/`)
Detalles de implementación y mejoras:
- Mejoras implementadas
- Correcciones aplicadas
- Flujos implementados
- Testing y validación

### 📝 Changelog (`changelog/`)
Historial de cambios y progreso:
- Changelog del proyecto
- Resúmenes de progreso
- Trabajo completado
- Perfección alcanzada

### 🔄 Actualización (`actualizacion/`)
Documentación de actualizaciones recientes:
- ACTUALIZACION_SISTEMA.md
- CAMBIOS_RESUMIDOS.txt
- Instrucciones de actualización

## 🔍 Cómo Encontrar lo que Necesitas

- **¿Empezando?** → Revisa `guias/`
- **¿Arquitectura técnica?** → Revisa `arquitectura/`
- **¿Qué cambió?** → Revisa `changelog/` y `actualizacion/`
- **¿Cómo implementar algo?** → Revisa `implementacion/`

## 📌 Documentos Principales

Los documentos más importantes están en la raíz del proyecto:
- `README.md` - Documentación principal
- `CONTRIBUTING.md` - Guía de contribución
- `LICENSE` - Licencia del proyecto

EOF

echo -e "${GREEN}✅ Índice creado en docs/README.md${NC}"

# Crear README para legacy
cat > legacy/README.md << 'EOF'
# 🗄️ Archivos Legacy

Esta carpeta contiene archivos que ya no se usan activamente pero se mantienen por referencia histórica.

## 📁 Contenido

### `apps/` - Aplicaciones Antiguas
- `app-arquitectura-senior.js` - Versión antigua de la app
- `app-mejorado.js` - Versión previa mejorada
- `test-*.js` - Tests antiguos

### `scripts/` - Scripts Antiguos
Scripts de shell que ya no se usan o fueron reemplazados.

### `python/` - Scripts Python Antiguos
Scripts Python que ya no se usan activamente.

## ⚠️ Nota Importante

Estos archivos **NO** deben usarse en producción. Solo se mantienen por:
- Referencia histórica
- Recuperación de código
- Comparación de implementaciones

Para desarrollo actual, usa los archivos en la raíz del proyecto.
EOF

# Crear README para scripts
cat > scripts/README.md << 'EOF'
# 📜 Scripts del Proyecto

Scripts utilitarios organizados por categoría.

## 📁 Carpetas

### `catalogo/` - Scripts de Catálogo
Scripts para gestión del catálogo de productos:
- Actualización de catálogo
- Verificación de productos
- Optimización de catálogo

### `deployment/` - Scripts de Deployment
Scripts para despliegue y producción (si existen).

### `utils/` - Utilidades Generales
Scripts de utilidad general:
- Ver logs
- Verificaciones
- Mantenimiento

## 🚀 Uso

Todos los scripts deben ejecutarse desde la raíz del proyecto:

```bash
bash scripts/utils/ver-logs.sh
```

EOF

echo ""
echo "🗂️  =============================================="
echo "✅  ORGANIZACIÓN COMPLETADA"
echo "🗂️  =============================================="
echo ""
echo "📊 Resumen:"
echo "  • Documentación organizada en docs/"
echo "  • Apps legacy movidas a legacy/apps/"
echo "  • Scripts organizados en scripts/"
echo "  • Índices creados en cada carpeta"
echo ""
echo "📖 Siguiente paso: Revisar docs/README.md para navegación"
echo ""
