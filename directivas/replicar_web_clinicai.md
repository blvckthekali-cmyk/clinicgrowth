# Directiva: Replicar Web Clinic AI Growth

## Objetivo
Analizar y descargar completamente la página web `https://clinicaigrowth.ngjiyv.easypanel.host/` (incluyendo su contenido devuelto por la red: HTML, JS, CSS e Imágenes), y adaptar los enlaces internos para que funcionen perfectamente desde un servidor HTTP local estático.

## Entradas
- URL Objetivo: `https://clinicaigrowth.ngjiyv.easypanel.host/`
- Entorno de Ejecución: Python 3 con librerías nativas (`urllib.request`, `re`, `os`).

## Salidas
- Carpeta `public/` contendrá el archivo `index.html`.
- Carpeta `public/assets/` contendrá todos los archivos `.js`, `.css` y las imágenes o fuentes descubiertas.

## Lógica y Pasos a Seguir
1. **Petición HTML Inicial:** Descarga el código fuente principal de la URL objetivo.
2. **Extracción de Referencias (Paso 1):** Dentro del HTML, busca todos los enlaces relativos `href="/..."` y `src="/..."` (ej. `/assets/index-...js`).
3. **Descarga de Assets:**
   - Construye la URL completa agregando el dominio base.
   - Crea los directorios equivalentes en `public/`.
   - Descarga el archivo respetando la estructura (ej. `public/assets/...`).
4. **Reemplazo de Rutas:** Modifica el documento HTML principal (`index.html`) para que apunte a rutas relativas sin barra inicial (ej. `src="assets/index-...js"`) o dejarlos en `/assets` y servir el directorio `public` como raíz.
5. **Detección Recursiva en CSS y JS:**
   - Escanea el texto de los CSS y JS en búsqueda de nuevas rutas como `"/assets/..."` o `'/assets/...'`.
   - Si existen y no se han descargado, descárgalos iterativamente.

## Trampas Conocidas y Restricciones (Casos Borde)
- **Problema:** En sitios React/Vite, las imágenes a veces se cargan vía JavaScript (`new URL('/assets/img.jpg', import.meta.url)` o como cadenas `"/assets/..."`).
- **Restricción:** El script debe usar Regex para cazar coincidencias con el patrón `["']/assets/[a-zA-Z0-9_\-\.]+["']` tanto en el `.js` como en el `.css` para asegurar la descarga de imágenes dinámicas.
- **Archivos Binarios (Imágenes/Fuentes):** Descárgalos siempre en binario (`wb`). No intentes parsearlos con codificación UTF-8.
- **Idempotencia:** Si el archivo ya existe en la ruta local, no lo vuelvas a descargar a menos que sea necesario.
- **Agentes de Usuario:** Configura un User-Agent de navegador moderno (`Mozilla/5.0...`) para evitar el bloqueo del host.
