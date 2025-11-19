#!/bin/bash

echo "🔍 Verificando configuración de Cloudinary..."
echo ""

# Verificar si existe .env.local
if [ ! -f .env.local ]; then
    echo "❌ El archivo .env.local NO existe"
    echo "✅ Solución: Copia .env.local.example a .env.local"
    echo "   cp .env.local.example .env.local"
    exit 1
fi

echo "✅ Archivo .env.local encontrado"
echo ""

# Variables requeridas
VARS_REQUIRED=(
    "NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME"
    "NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET"
    "CLOUDINARY_API_KEY"
    "CLOUDINARY_API_SECRET"
)

echo "📋 Verificando variables de entorno:"
echo ""

ALL_PRESENT=true

for VAR in "${VARS_REQUIRED[@]}"; do
    if grep -q "^${VAR}=" .env.local && ! grep -q "^${VAR}=your_" .env.local && ! grep -q "^${VAR}=$" .env.local; then
        VALUE=$(grep "^${VAR}=" .env.local | cut -d'=' -f2)
        if [ -n "$VALUE" ]; then
            echo "✅ $VAR está configurado"
        else
            echo "❌ $VAR está vacío"
            ALL_PRESENT=false
        fi
    else
        echo "❌ $VAR NO está configurado o tiene valor por defecto"
        ALL_PRESENT=false
    fi
done

echo ""

if [ "$ALL_PRESENT" = true ]; then
    echo "✅ ¡Todas las variables de Cloudinary están configuradas!"
    echo ""
    echo "🚀 Próximos pasos:"
    echo "   1. Verifica que el upload preset existe en Cloudinary"
    echo "   2. Asegúrate de que esté en modo 'Unsigned'"
    echo "   3. Reinicia el servidor: npm run dev"
else
    echo "❌ Faltan variables de configuración"
    echo ""
    echo "📖 Solución:"
    echo "   1. Lee CLOUDINARY_FIX.md"
    echo "   2. Configura las variables faltantes en .env.local"
    echo "   3. Ejecuta este script nuevamente"
fi

echo ""
echo "📖 Documentación:"
echo "   - CLOUDINARY_FIX.md - Solución rápida"
echo "   - CLOUDINARY_SETUP.md - Documentación completa"
