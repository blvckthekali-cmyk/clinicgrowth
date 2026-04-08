import os
import re
import urllib.request
import urllib.error
from urllib.parse import urljoin, urlparse

# URL objetivo
BASE_URL = "https://clinicaigrowth.ngjiyv.easypanel.host/"
TARGET_DOMAIN = urlparse(BASE_URL).netloc
PUBLIC_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "public")

USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"

def ensure_dir(file_path):
    directory = os.path.dirname(file_path)
    if directory and not os.path.exists(directory):
        os.makedirs(directory)

def download_file(url, local_path, is_binary=False):
    if os.path.exists(local_path):
        print(f"Ya existe: {local_path} (Idempotencia - Saltando descarga)")
        if not is_binary:
            try:
                with open(local_path, 'r', encoding='utf-8') as f:
                    return f.read()
            except UnicodeDecodeError:
                pass # Si falla al leer como texto, no lo devolvemos
        return None

    print(f"Descargando: {url}")
    req = urllib.request.Request(url, headers={'User-Agent': USER_AGENT})
    try:
        with urllib.request.urlopen(req) as response:
            content = response.read()
            ensure_dir(local_path)
            mode = 'wb' if is_binary else 'w'
            
            if is_binary:
                with open(local_path, mode) as f:
                    f.write(content)
            else:
                text_content = content.decode('utf-8', errors='ignore')
                with open(local_path, mode, encoding='utf-8') as f:
                    f.write(text_content)
                return text_content
            return True
    except urllib.error.URLError as e:
        print(f"Error al descargar {url}: {e}")
        return None
    except Exception as e:
        print(f"Excepcion inesperada al descargar {url}: {e}")
        return None

def extract_assets_from_html(html_content):
    # Buscar href="..." y src="..."
    assets = []
    
    # Patrones para buscar rutas. Consideramos comillas dobles o simples.
    # Excluímos enlaces que empiezan por http, # o mailto:
    href_pattern = r'href=["\'](/[^"\']+)["\']'
    src_pattern = r'src=["\'](/[^"\']+)["\']'
    
    hrefs = re.findall(href_pattern, html_content)
    srcs = re.findall(src_pattern, html_content)
    
    assets.extend(hrefs)
    assets.extend(srcs)
    
    # Eliminar duplicados
    return list(set(assets))

def extract_assets_from_css_js(content):
    # Buscar patrones como '/assets/nombre.ext'
    # Esta regex busca comillas, luego una barra, luego assets, y luego caracteres de nombre de archivo
    pattern = r'["\'](/assets/[a-zA-Z0-9_\-\.\/]+)["\']'
    matches = re.findall(pattern, content)
    return list(set(matches))


def process_url(url, local_ruta, is_index=False):
    content = download_file(url, local_ruta, is_binary=False)
    
    if not content:
        # Quizas falló o es texto ya procesado sin devolver
        if os.path.exists(local_ruta) and local_ruta.endswith(('.html', '.js', '.css')):
            try:
                with open(local_ruta, 'r', encoding='utf-8') as f:
                    content = f.read()
            except:
                pass
                
    if not content:
        return []

    # Reemplazar rutas absolutas por relativas para el entorno local
    # Cambiamos href="/assets/..." por href="assets/..." (solo en la raíz para index.html simplificado)
    if is_index:
        content_modified = re.sub(r'href=["\'](/assets/[^"\']+)["\']', lambda m: f'href="{m.group(1)[1:]}"', content)
        content_modified = re.sub(r'src=["\'](/assets/[^"\']+)["\']', lambda m: f'src="{m.group(1)[1:]}"', content_modified)
        
        with open(local_ruta, 'w', encoding='utf-8') as f:
            f.write(content_modified)

    discovered_assets = []
    
    if local_ruta.endswith('.html') or is_index:
        discovered_assets = extract_assets_from_html(content)
    elif local_ruta.endswith(('.css', '.js')):
        discovered_assets = extract_assets_from_css_js(content)

    return discovered_assets


def main():
    print("Iniciando scraping y clonacion...")
    ensure_dir(PUBLIC_DIR)
    
    # 1. Descargar pagina principal
    index_path = os.path.join(PUBLIC_DIR, "index.html")
    assets_to_download = process_url(BASE_URL, index_path, is_index=True)
    
    # Cola de procesamiento
    queue = list(assets_to_download)
    processed = set()
    
    while queue:
        asset_path = queue.pop(0)
        
        # Saltamos rutas que no correspondan (ej. dominios externos si se colaron)
        if not asset_path.startswith('/'):
            continue
            
        if asset_path in processed:
            continue
            
        processed.add(asset_path)
        
        url = urljoin(BASE_URL, asset_path)
        
        # Eliminar posible barra inicial para construir la ruta local correctamente
        local_rel_path = asset_path.lstrip('/')
        local_abs_path = os.path.join(PUBLIC_DIR, local_rel_path)
        
        # Determinar si es binario (imágenes, fuentes)
        is_binary = not asset_path.endswith(('.html', '.css', '.js', '.json', '.txt', '.svg'))
        
        if is_binary:
            download_file(url, local_abs_path, is_binary=True)
        else:
            new_assets = process_url(url, local_abs_path)
            for new_asset in new_assets:
                if new_asset not in processed and new_asset not in queue:
                    queue.append(new_asset)
                    
    print("\nProceso finalizado. Puedes encontrar la web en /public")

if __name__ == "__main__":
    main()
