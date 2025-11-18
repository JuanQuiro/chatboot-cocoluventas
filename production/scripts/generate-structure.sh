#!/bin/bash

# Script para generar estructura completa de Clean Architecture
# Ejecutar: chmod +x scripts/generate-structure.sh && ./scripts/generate-structure.sh

echo "🏗️  Generando estructura de Clean Architecture..."

# Crear directorios principales
mkdir -p src-ts/{domain,application,infrastructure,presentation,shared}

# Domain Layer
echo "📦 Creando Domain Layer..."
mkdir -p src-ts/domain/{sellers,analytics,orders,products,support}
mkdir -p src-ts/domain/sellers/{entities,value-objects,repositories,events,exceptions}
mkdir -p src-ts/domain/analytics/{entities,value-objects,repositories,events}
mkdir -p src-ts/domain/orders/{entities,value-objects,repositories,events,exceptions}
mkdir -p src-ts/domain/products/{entities,value-objects,repositories}
mkdir -p src-ts/domain/support/{entities,value-objects,repositories,events}

# Application Layer
echo "📋 Creando Application Layer..."
mkdir -p src-ts/application/{sellers,analytics,orders,products,support}
mkdir -p src-ts/application/sellers/{commands,queries,handlers,dto,services}
mkdir -p src-ts/application/analytics/{commands,queries,handlers,dto}
mkdir -p src-ts/application/orders/{commands,queries,handlers,dto}
mkdir -p src-ts/application/products/{commands,queries,handlers,dto}
mkdir -p src-ts/application/support/{commands,queries,handlers,dto}

# Infrastructure Layer
echo "🔧 Creando Infrastructure Layer..."
mkdir -p src-ts/infrastructure/{persistence,messaging,external,config}
mkdir -p src-ts/infrastructure/persistence/{memory,mongodb,schemas,mappers}
mkdir -p src-ts/infrastructure/messaging/{events,rabbitmq}
mkdir -p src-ts/infrastructure/external/{whatsapp,builderbot}

# Presentation Layer
echo "🎨 Creando Presentation Layer..."
mkdir -p src-ts/presentation/http/{sellers,analytics,orders,products,chatbot,support}
mkdir -p src-ts/presentation/http/sellers/{controllers,dto,guards,middleware}
mkdir -p src-ts/presentation/http/analytics/{controllers,dto}
mkdir -p src-ts/presentation/http/orders/{controllers,dto}
mkdir -p src-ts/presentation/http/products/{controllers,dto}
mkdir -p src-ts/presentation/http/chatbot/{controllers,dto}

# Shared
echo "🔗 Creando Shared..."
mkdir -p src-ts/shared/{domain,infrastructure,utils}
mkdir -p src-ts/shared/domain/{events,exceptions,value-objects}
mkdir -p src-ts/shared/infrastructure/{decorators,filters,interceptors,pipes}

# Test directories
echo "🧪 Creando estructura de tests..."
mkdir -p test/{unit,integration,e2e}
mkdir -p test/unit/{domain,application,infrastructure}
mkdir -p test/integration/{repositories,services}
mkdir -p test/e2e/{sellers,orders,analytics}

echo "✅ Estructura creada exitosamente!"
echo ""
echo "📁 Estructura generada:"
tree src-ts -L 3 -d || ls -R src-ts
