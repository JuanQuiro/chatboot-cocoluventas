#!/bin/bash
#
# Script para conectarse rápidamente al VPS
#

VPS_IP="173.249.205.142"
VPS_USER="root"

echo "🔌 Conectándose a $VPS_USER@$VPS_IP..."
echo "   Contraseña: a9psHSvLyrKock45yE2F"
echo ""

# Aceptar automáticamente la nueva clave SSH (solo para este servidor)
ssh -o StrictHostKeyChecking=accept-new "$VPS_USER@$VPS_IP"

