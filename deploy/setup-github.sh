#!/bin/bash
#
# Script para configurar GitHub y hacer push inicial
# Ejecutar en tu máquina local
#

set -e

echo "🔧 ========================================"
echo "🔧   CONFIGURACIÓN DE GITHUB"
echo "🔧 ========================================"
echo ""

# Verificar si ya es un repo git
if [ -d .git ]; then
    echo "✅ Ya es un repositorio Git"
    REMOTE_URL=$(git remote get-url origin 2>/dev/null || echo "")
    
    if [ -n "$REMOTE_URL" ]; then
        echo "   Repositorio remoto: $REMOTE_URL"
        echo ""
        read -p "   ¿Quieres usar este repositorio? (y/n): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            echo ""
            echo "✅ Usando repositorio existente: $REMOTE_URL"
            echo ""
            echo "📤 Para hacer push:"
            echo "   git add ."
            echo "   git commit -m 'Deployment setup'"
            echo "   git push"
            exit 0
        fi
    fi
else
    echo "📦 Inicializando repositorio Git..."
    git init
fi

# Pedir URL del repositorio
echo ""
echo "📝 Ingresa la información del repositorio:"
read -p "   URL del repositorio GitHub (ej: https://github.com/usuario/repo.git): " REPO_URL

if [ -z "$REPO_URL" ]; then
    echo "❌ No se proporcionó URL. Abortando."
    exit 1
fi

# Configurar remote
echo ""
echo "🔗 Configurando repositorio remoto..."
git remote remove origin 2>/dev/null || true
git remote add origin "$REPO_URL"

# Verificar conexión
echo ""
echo "🔍 Verificando conexión con GitHub..."
if gh auth status &>/dev/null; then
    echo "   ✅ GitHub CLI autenticado"
else
    echo "   ⚠️  GitHub CLI no autenticado"
    echo "   Ejecuta: gh auth login"
fi

# Agregar archivos
echo ""
echo "📦 Agregando archivos..."
git add .

# Commit
echo ""
read -p "   Mensaje del commit (Enter para 'Deployment setup'): " COMMIT_MSG
COMMIT_MSG=${COMMIT_MSG:-"Deployment setup"}

git commit -m "$COMMIT_MSG" || {
    echo "⚠️  No hay cambios para commitear"
}

# Push
echo ""
echo "📤 Subiendo a GitHub..."
read -p "   ¿Hacer push ahora? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    # Detectar rama principal
    MAIN_BRANCH=$(git branch --show-current 2>/dev/null || echo "main")
    
    echo "   Haciendo push a $MAIN_BRANCH..."
    git push -u origin "$MAIN_BRANCH" || {
        echo "❌ Error haciendo push"
        echo "   Intenta manualmente: git push -u origin $MAIN_BRANCH"
        exit 1
    }
    
    echo ""
    echo "✅ Código subido a GitHub: $REPO_URL"
else
    echo ""
    echo "📝 Para hacer push manualmente:"
    echo "   git push -u origin main"
fi

echo ""
echo "✅ ========================================"
echo "✅   CONFIGURACIÓN COMPLETADA"
echo "✅ ========================================"
echo ""
echo "🚀 Próximos pasos en el servidor:"
echo ""
echo "   1. Conéctate: ssh root@173.249.205.142"
echo "   2. Ejecuta:"
echo "      cd /opt"
echo "      bash <(curl -s https://raw.githubusercontent.com/.../deploy-desde-github.sh) $REPO_URL"
echo ""
echo "   O descarga el script y ejecútalo:"
echo "      wget https://raw.githubusercontent.com/.../deploy-desde-github.sh"
echo "      bash deploy-desde-github.sh $REPO_URL"
echo ""

