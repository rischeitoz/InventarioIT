# Guía Rápida de Despliegue en IIS (Windows Server)
## Aplicación: HCP+ Inventario IT — Subruta: `/Inventario IT`
### Arquitectura: Sin Base de Datos Externa (Flat-File JSON en Disco Local)

Esta guía explica paso a paso cómo desplegar la aplicación en un servidor **Windows Server** con **Internet Information Services (IIS)** bajo la subruta:
```
http://<ip-o-dominio-del-servidor>/Inventario IT/
```

---

## 1. Prerrequisitos en Windows Server

1. **Windows Server** (2016, 2019, 2022 o Windows 10/11 Pro).
2. **Rol de IIS (Web Server)** instalado.
3. **Node.js LTS (v18, v20 o superior)** instalado desde [nodejs.org](https://nodejs.org).
4. **Módulos Oficiales de IIS (gratuitos de Microsoft):**
   - **IIS URL Rewrite Module 2.1:** [Descargar de Microsoft](https://www.iis.net/downloads/microsoft/url-rewrite)
   - **Application Request Routing (ARR) 3.0:** [Descargar de Microsoft](https://www.iis.net/downloads/microsoft/application-request-routing)

---

## 2. Método Rápido Automatizado (PowerShell)

Hemos incluido un script automatizado `install-iis.ps1` en la raíz del proyecto.

1. Abre **PowerShell como Administrador** en el servidor.
2. Navega hasta la carpeta del proyecto y ejecuta:
   ```powershell
   Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
   .\install-iis.ps1
   ```
3. El script automáticamente:
   - Crea el directorio `C:\inetpub\wwwroot\Inventario IT` y `...\data`.
   - Asigna los permisos NTFS de lectura/escritura a `IIS_IUSRS` y `IUSR`.
   - Crea el Application Pool dedicado `InventarioITPool` (sin código administrado).
   - Registra la aplicación en IIS bajo `Default Web Site/Inventario IT`.
   - Habilita la función de proxy inverso en ARR.

---

## 3. Método Manual Paso a Paso

Si prefieres realizar la configuración manualmente desde la consola gráfica de IIS:

### Paso 1: Copiar los archivos de la aplicación
Copia los archivos del proyecto en la carpeta:
```
C:\inetpub\wwwroot\Inventario IT
```
Asegúrate de que dentro exista la subcarpeta:
```
C:\inetpub\wwwroot\Inventario IT\data
```

### Paso 2: Asignar permisos NTFS a la carpeta `data`
Dado que la aplicación **no usa bases de datos** (SQL Server, MySQL, etc.), guarda toda la información en `C:\inetpub\wwwroot\Inventario IT\data\inventario-data.json`.
1. Clic derecho en la carpeta `data` > **Propiedades** > pestaña **Seguridad** > **Editar**.
2. Haz clic en **Agregar**, escribe `IIS_IUSRS` y pulsa **Comprobar nombres**.
3. Marca la casilla **Control total** o **Modificar**.
4. Haz lo mismo para el usuario `IUSR`.
5. Pulsa **Aceptar**.

### Paso 3: Habilitar Proxy en IIS (ARR)
1. Abre el **Administrador de IIS** (`inetmgr`).
2. En el panel izquierdo, haz clic en el nombre del servidor (nodo raíz).
3. En el panel central, abre **Application Request Routing Cache**.
4. En el panel derecho (*Acciones*), haz clic en **Server Proxy Settings...**.
5. Marca la casilla **Enable proxy** y pulsa **Apply**.

### Paso 4: Crear la Aplicación en IIS
1. En el Administrador de IIS, despliega **Sitios** > **Default Web Site**.
2. Clic derecho en **Default Web Site** > **Agregar aplicación...** (Add Application).
3. Configura:
   - **Alias:** `Inventario IT`
   - **Grupo de aplicaciones (Application Pool):** Crea uno nuevo llamado `InventarioITPool` con la versión de .NET en *"Sin código administrado"* (No Managed Code).
   - **Ruta de acceso física:** `C:\inetpub\wwwroot\Inventario IT`
4. Pulsa **Aceptar**.

---

## 4. Compilar y Ejecutar la Aplicación

En el servidor, abre una ventana de comandos en `C:\inetpub\wwwroot\Inventario IT`:

1. Instala dependencias y compila:
   ```cmd
   npm install
   npm run build
   ```

2. Para que la aplicación se inicie automáticamente como un servicio de fondo en Windows (incluso tras reiniciar el servidor), puedes utilizar **PM2** o **NSSM**:

### Opción A: Usando PM2 (Recomendada)
```cmd
npm install -g pm2
npm install -g pm2-windows-service

pm2 start npm --name "InventarioIT" -- run start
pm2 save
```

### Opción B: Ejecución directa para pruebas
```cmd
npm run start
```
*(Escuchará en `http://localhost:3000` y el servidor IIS lo publicará automáticamente en `http://<tu-servidor>/Inventario IT/`)*.

---

## 5. Verificación

Abre tu navegador e ingresa a:
```
http://localhost/Inventario IT/
```
o desde cualquier ordenador de la red corporativa:
```
http://NOMBRE-DEL-SERVIDOR/Inventario IT/
```

Verás la aplicación funcionando al 100% con su panel de portátiles, sobremesas, periféricos, historial y el lector de diagnósticos PDF de HCPToolKit.

---

## 6. Copias de Seguridad (Backup)
Dado que **no hay bases de datos externas**, hacer una copia de seguridad es tan sencillo como:
- Descargar el archivo `inventario_backup.json` directamente desde la interfaz web (botón *Configuración IIS & Backup*).
- O copiar directamente el archivo físico del servidor:
  `C:\inetpub\wwwroot\Inventario IT\data\inventario-data.json`.
