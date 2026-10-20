#!/usr/bin/env bash
set -e

echo "📂 [1/7] Buscando carpeta del CRM en el VPS..."
CRM_DIR=""
for d in /var/www/cmr /var/www/CMR /root/CMR /root/cmr /home/*/CMR /home/*/cmr "/root/GESTION AG/CMR" /var/www/*; do
  if [ -d "$d" ] && [ -d "$d/.git" ]; then
    CRM_DIR="$d"
    break
  fi
done

if [ -z "$CRM_DIR" ]; then
  echo "❌ ERROR: No se encontró la carpeta git del CRM en el VPS."
  exit 1
fi

cd "$CRM_DIR"
echo "📂 Trabajando en: $(pwd)"
echo "🔄 Actualizando repositorio con git pull..."
git pull origin main

# 1. Dependencias Backend
echo "📦 [2/7] Instalando dependencias de backend..."
npm install --include=dev

# 2. Compilar Frontend
if [ -d "frontend" ]; then
  echo "🔨 [3/7] Compilando frontend SPA..."
  cd frontend
  npm install --include=dev
  npm run build
  cd ..
  echo "✅ Frontend compilado exitosamente."

  # Analizar configuración de Nginx
  echo "🔍 [4/7] Analizando configuración de Nginx y webroots..."
  if [ -d "/etc/nginx" ]; then
    echo "--- Sitios activos en Nginx: ---"
    grep -rnE "crm\.metodoai\.tech|server_name|root|proxy_pass" /etc/nginx/sites-enabled/ /etc/nginx/conf.d/ 2>/dev/null || true
  fi

  # Localizar el bundle antiguo (DrHkMuzz) de crm.metodoai.tech y sobreescribir su carpeta
  echo "🔍 Buscando carpetas con el bundle antiguo de crm.metodoai.tech (DrHkMuzz)..."
  find /var/www /usr/share/nginx /home /root /etc -name "*DrHkMuzz*" 2>/dev/null | while read -r old_file; do
    if [ -n "$old_file" ]; then
      assets_dir=$(dirname "$old_file")
      site_root=$(dirname "$assets_dir")
      echo "🎯 Encontrado bundle antiguo en $site_root. Sincronizando frontend/dist..."
      cp -rf frontend/dist/* "$site_root/"
    fi
  done

  # Sincronizar a todos los webroots detectados en Nginx
  if [ -d "/etc/nginx" ]; then
    for conf_root in $(grep -rhs "root " /etc/nginx/sites-enabled/ /etc/nginx/conf.d/ 2>/dev/null | awk '{print $2}' | tr -d ';'); do
      case "$conf_root" in
        *node_modules*) ;;
        *)
          if [ -d "$conf_root" ]; then
            echo "📋 Sincronizando frontend a root de Nginx: $conf_root..."
            cp -rf frontend/dist/* "$conf_root/" 2>/dev/null || true
          fi
          ;;
      esac
    done
  fi

  # Sincronizar a rutas webroot estándar conocidas
  for webroot in /var/www/html /var/www/crm /var/www/crm-ia /var/www/crm.metodoai.tech /var/www/crm-ia.metodoai.tech /var/www/cmr/dist /var/www/crm/dist /usr/share/nginx/html; do
    if [ -d "$webroot" ]; then
      echo "📋 Sincronizando frontend a $webroot..."
      cp -rf frontend/dist/* "$webroot/" 2>/dev/null || true
    fi
  done
fi

# 3. Compilar Backend
echo "🔨 [5/7] Compilando backend..."
npm run build || true

# 4. Auto-recuperación y reinicio de procesos
echo "🔄 [6/7] Reiniciando procesos en PM2 y Systemd..."

# PM2
if command -v pm2 > /dev/null 2>&1; then
  echo "📋 Estado actual de PM2:"
  pm2 list || true

  # Proceso CRM Backend (Port 3005)
  if ! pm2 describe crm > /dev/null 2>&1 && ! pm2 describe crm-backend > /dev/null 2>&1 && ! pm2 describe CRM_IA > /dev/null 2>&1 && ! pm2 describe crm_ia > /dev/null 2>&1; then
    echo "🚀 Iniciando CRM Backend en PM2..."
    pm2 start "npx tsx src/index.ts" --name "crm"
  else
    echo "🔄 Reiniciando CRM Backend en PM2..."
    pm2 restart crm --update-env || pm2 restart CRM_IA --update-env || pm2 start "npx tsx src/index.ts" --name "crm" || true
  fi

  # Proceso CRM MCP Server (Port 3002)
  if ! pm2 describe crm-mcp > /dev/null 2>&1; then
    echo "🚀 Iniciando CRM MCP Server en PM2..."
    pm2 start "npx tsx src/mcp/http-server.ts" --name "crm-mcp"
  else
    echo "🔄 Reiniciando CRM MCP Server en PM2..."
    pm2 restart crm-mcp --update-env || pm2 start "npx tsx src/mcp/http-server.ts" --name "crm-mcp" || true
  fi

  pm2 save || true
  echo "📋 Estado de PM2 tras reinicio:"
  pm2 list || true
fi

# Systemd
for svc in crm crm_ia CRM_IA crm-ia crm-backend crm-mcp; do
  if systemctl list-unit-files "$svc.service" 2>/dev/null | grep -q "$svc"; then
    echo "🔄 Servicio systemd $svc detectado. Limpiando estado y reiniciando..."
    systemctl reset-failed "$svc" 2>/dev/null || true
    systemctl restart "$svc" 2>/dev/null || true
    systemctl status "$svc" --no-pager -l 2>/dev/null || true
  fi
done

# 5. Comprobar salud de los puertos
echo "🔍 Verificando respuesta de los servidores locales..."
sleep 4

if curl -s -f "http://127.0.0.1:3005/health" > /dev/null 2>&1 || curl -s -f "http://127.0.0.1:3005/api/health" > /dev/null 2>&1; then
  echo "✅ Backend & MCP respondiendo OK en http://127.0.0.1:3005"
else
  echo "⚠️ Alerta: El backend no respondió en puerto 3005."
fi

if curl -s -f "http://127.0.0.1:3002/health" > /dev/null 2>&1; then
  echo "✅ Servidor MCP dedicado respondiendo OK en http://127.0.0.1:3002/health"
else
  echo "⚠️ Alerta: El servidor MCP no respondió en puerto 3002."
fi

# 6. Limpiar caché y recargar Nginx
echo "🔄 [7/7] Limpiando caché y recargando Nginx..."
rm -rf /var/cache/nginx/* 2>/dev/null || true
if command -v nginx > /dev/null 2>&1; then
  nginx -t && (systemctl reload nginx || systemctl restart nginx) || echo "⚠️ Revisa la configuración de Nginx"
fi

# 7. Diagnóstico final de bundle servido
echo "🔍 Verificando bundles finales:"
echo "- Nginx crm.metodoai.tech:"
curl -s -k -H "Host: crm.metodoai.tech" https://127.0.0.1/ 2>/dev/null | grep -o 'assets/[^"]*' || curl -s -H "Host: crm.metodoai.tech" http://127.0.0.1/ 2>/dev/null | grep -o 'assets/[^"]*' || echo "N/A"
echo "- Backend 3005:"
curl -s http://127.0.0.1:3005/ 2>/dev/null | grep -o 'assets/[^"]*' || echo "N/A"

echo "✨ ¡Despliegue y verificación completados exitosamente!"
