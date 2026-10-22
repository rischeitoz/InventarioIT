# INSTRUCCIONES DE INSTALACIÓN Y DESPLIEGUE EN SERVIDOR IIS
## Sistema: HCP+ Inventario IT
### Entorno: Windows Server · Subruta: `/Inventario IT`
### Modo de Datos: Sin Base de Datos Externa (Persistencia Flat-File JSON en Disco)

---

## ÍNDICE
1. [Requisitos Previos del Sistema](#1-requisitos-previos-del-sistema)
2. [Estructura de Directorios](#2-estructura-de-directorios)
3. [Instalación Rápida con PowerShell (Recomendado)](#3-instalación-rápida-con-powershell-recomendado)
4. [Instalación Manual Paso a Paso en IIS](#4-instalación-manual-paso-a-paso-en-iis)
5. [Permisos NTFS Críticos (Carpeta Data)](#5-permisos-ntfs-críticos-carpeta-data)
6. [Compilación y Puesta en Marcha](#6-compilación-y-puesta-en-marcha)
7. [Configuración como Servicio de Windows (Autoinicio 24/7)](#7-configuración-como-servicio-de-windows-autoinicio-247)
8. [Comprobación y Verificación](#8-comprobación-y-verificación)
9. [Mantenimiento y Copias de Seguridad](#9-mantenimiento-y-copias-de-seguridad)
10. [Resolución de Problemas Comunes](#10-resolución-de-problemas-comunes)

---

## 1. Requisitos Previos del Sistema

Para desplegar la aplicación en Windows Server se requiere:

- **Sistema Operativo:** Windows Server 2016, 2019, 2022 o Windows 10/11 Pro (para pruebas).
- **Rol IIS:** Servidor web IIS instalado con herramientas de administración.
- **Node.js LTS:** Versión 18.x, 20.x o superior instalada desde [nodejs.org](https://nodejs.org).
- **Módulos Oficiales Gratuitos de Microsoft para IIS:**
  1. **IIS URL Rewrite Module 2.1:**  
     [https://www.iis.net/downloads/microsoft/url-rewrite](https://www.iis.net/downloads/microsoft/url-rewrite)
  2. **Application Request Routing (ARR) 3.0:**  
     [https://www.iis.net/downloads/microsoft/application-request-routing](https://www.iis.net/downloads/microsoft/application-request-routing)

---

## 2. Estructura de Directorios

La aplicación se alojará físicamente en:
```text
C:\inetpub\wwwroot\Inventario IT\
├── data\                          <-- Base de datos local (inventario-data.json)
├── public\                        <-- Activos estáticos
├── web.config                     <-- Reglas de IIS URL Rewrite y cabeceras
├── package.json
└── install-iis.ps1
```

La URL de acceso para los usuarios de la red local o dominio corporativo será:
```text
http://<nombre-o-ip-del-servidor>/Inventario IT/
```

---

## 3. Instalación Rápida con PowerShell (Recomendado)

Se incluye el script `install-iis.ps1` en la raíz del proyecto para automatizar toda la configuración de IIS:

1. Abre **PowerShell como Administrador** en el servidor.
2. Navega hasta la carpeta del proyecto:
   ```powershell
   cd "C:\inetpub\wwwroot\Inventario IT"
   ```
3. Ejecuta el script:
   ```powershell
   Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
   .\install-iis.ps1
   ```
El script creará automáticamente el Application Pool `InventarioITPool` (sin código administrado), la subruta `/Inventario IT` bajo `Default Web Site`, activará el Proxy ARR y aplicará los permisos NTFS necesarios sobre la carpeta `data`.

---

## 4. Instalación Manual Paso a Paso en IIS

Si prefieres realizar la configuración manualmente desde la interfaz gráfica del Administrador de IIS:

### 4.1. Habilitar la función Proxy en IIS
1. Abre el **Administrador de Internet Information Services (IIS)** (`inetmgr`).
2. En el panel izquierdo, haz clic sobre el nodo raíz (el nombre de tu servidor).
3. En el panel central, haz doble clic en **Application Request Routing Cache**.
4. En el panel derecho (*Acciones*), haz clic en **Server Proxy Settings...**.
5. Marca la casilla **Enable proxy**.
6. En el panel derecho, haz clic en **Apply**.

### 4.2. Crear el Application Pool dedicado
1. En el Administrador de IIS, en el panel izquierdo, haz clic derecho en **Grupos de aplicaciones** (Application Pools) > **Agregar grupo de aplicaciones...**.
2. Nombre: `InventarioITPool`
3. Versión de .NET CLR: Selecciona **Sin código administrado** (*No Managed Code*).
4. Modo de canalización: **Integrada** (*Integrated*).
5. Pulsa **Aceptar**.

### 4.3. Crear la Aplicación Web (Subruta)
1. En el panel izquierdo, despliega **Sitios** > **Default Web Site**.
2. Haz clic derecho en **Default Web Site** > **Agregar aplicación...** (*Add Application*).
3. Completa los campos:
   - **Alias:** `Inventario IT`
   - **Grupo de aplicaciones:** Pulsa *Seleccionar...* y escoge `InventarioITPool`.
   - **Ruta de acceso física:** `C:\inetpub\wwwroot\Inventario IT`
4. Pulsa **Aceptar**.

---

## 5. Permisos NTFS Críticos (Carpeta Data)

> ⚠️ **IMPRESCINDIBLE:** Dado que el sistema **no utiliza base de datos SQL**, todos los equipos, periféricos y movimientos se leen y escriben en el archivo `C:\inetpub\wwwroot\Inventario IT\data\inventario-data.json`. IIS debe tener permisos de escritura sobre dicha carpeta.

1. Abre el Explorador de Archivos de Windows.
2. Dirígete a: `C:\inetpub\wwwroot\Inventario IT`
3. Haz clic derecho en la carpeta **`data`** > **Propiedades**.
4. Ve a la pestaña **Seguridad** > haz clic en **Editar...**.
5. Haz clic en **Agregar...**.
6. En el cuadro de texto escribe:
   ```text
   IIS_IUSRS
   ```
7. Pulsa **Comprobar nombres** y luego **Aceptar**.
8. Marca la casilla **Control total** (o *Modificar*).
9. Repite el proceso para el usuario local `IUSR`.
10. Haz clic en **Aceptar** para guardar los cambios.

---

## 6. Compilación y Puesta en Marcha

En el servidor, abre la consola de comandos (`cmd.exe` o `PowerShell`) como Administrador:

```cmd
cd "C:\inetpub\wwwroot\Inventario IT"

:: 1. Instalar dependencias de producción
npm install

:: 2. Generar compilación optimizada de producción
npm run build

:: 3. Iniciar el servicio (prueba inicial en puerto 3000)
npm run start
```

---

## 7. Configuración como Servicio de Windows (Autoinicio 24/7)

Para que la aplicación arranque automáticamente al encender el servidor y funcione en segundo plano sin depender de una sesión de usuario abierta, utiliza **PM2**:

```cmd
:: 1. Instalar PM2 y su wrapper para servicios de Windows globalmente
npm install -g pm2
npm install -g pm2-windows-service

:: 2. Configurar el servicio en Windows (responder a los prompts por defecto)
pm2-service-install

:: 3. Iniciar la aplicación de inventario
cd "C:\inetpub\wwwroot\Inventario IT"
pm2 start npm --name "InventarioIT" -- run start

:: 4. Guardar la lista de procesos para que se restablezca tras reiniciar
pm2 save
```

*(Alternativa con NSSM: Puedes descargar [nssm.cc](https://nssm.cc), ejecutar `nssm install InventarioIT` y apuntar a `node.exe` con los argumentos `node_modules\next\dist\bin\next start` en el directorio de la aplicación).*

---

## 8. Comprobación y Verificación

1. Abre cualquier navegador web (Edge, Chrome, Firefox) e ingresa:
   ```text
   http://localhost/Inventario IT/
   ```
2. Desde otros puestos de trabajo en la red local:
   ```text
   http://NOMBRE-DEL-SERVIDOR/Inventario IT/
   http://192.168.X.X/Inventario IT/
   ```
3. Comprueba las funciones principales:
   - Panel de **Portátiles** (asignación, devolución, averías).
   - Panel de **Sobremesas** (entrega y repuestos).
   - Panel de **Periféricos** (incremento y decremento con `+` y `−`).
   - Formulario de **Nueva Ficha**: sube un informe de diagnóstico de **HCPToolKit**; el sistema debe rellenar automáticamente el Host, CPU, RAM, GPU y discos.

---

## 9. Mantenimiento y Copias de Seguridad

Dado que **no se requiere hacer backups de motores de base de datos**:
- **Copia de seguridad en un clic:** Puedes pulsar el botón *"Copia de Seguridad (JSON)"* en la barra lateral de la app para descargar `inventario_backup.json`.
- **Copia física en servidor:** Basta con copiar o incluir en tu copia de seguridad diaria de Windows Server el archivo:
  ```text
  C:\inetpub\wwwroot\Inventario IT\data\inventario-data.json
  ```
- **Migración a otro servidor:** Copiar la carpeta completa a otro servidor Windows con Node.js e IIS equivale a migrar el 100% de la aplicación con todos sus datos e historial.

---

## 10. Resolución de Problemas Comunes

| Síntoma | Causa Probable | Solución |
|---|---|---|
| **Error 502.3 Bad Gateway** | Node.js no está en ejecución en el puerto 3000 o ARR Proxy está deshabilitado. | Ejecuta `pm2 status` o `npm run start` y verifica que la opción *Enable proxy* esté marcada en ARR. |
| **Error 404 Not Found al acceder a la subruta** | Falta el módulo IIS URL Rewrite o la regla en `web.config`. | Instala el módulo *IIS URL Rewrite 2.1* y verifica que `web.config` esté en la raíz de `C:\inetpub\wwwroot\Inventario IT`. |
| **Error 404.11 URL_DOUBLE_ESCAPED** | La subruta contiene un espacio (`/Inventario IT/`). | Verifica que `web.config` contenga `<requestFiltering allowDoubleEscaping="true" />`. |
| **Los cambios no se guardan al reiniciar** | Falta de permisos NTFS en la carpeta `data`. | Sigue las instrucciones del [Paso 5](#5-permisos-ntfs-críticos-carpeta-data) para asignar permisos de Control Total a `IIS_IUSRS`. |
