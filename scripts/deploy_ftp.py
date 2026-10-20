import os
import sys
from ftplib import FTP, error_perm

def upload_dir(ftp, local_dir, remote_dir=""):
    for item in os.listdir(local_dir):
        local_path = os.path.join(local_dir, item)
        remote_path = f"{remote_dir}/{item}".strip("/") if remote_dir else item
        
        if os.path.isdir(local_path):
            try:
                ftp.mkd(remote_path)
                print(f"📁 Directorio creado: {remote_path}")
            except error_perm:
                pass  # El directorio ya existe
            upload_dir(ftp, local_path, remote_path)
        else:
            with open(local_path, "rb") as f:
                ftp.storbinary(f"STOR {remote_path}", f)
                print(f"⬆️ Archivo subido: {remote_path}")

def main():
    host = os.environ.get("FTP_HOST", "").strip()
    user = os.environ.get("FTP_USER", "").strip()
    password = os.environ.get("FTP_PASSWORD", "").strip()
    local_dist = os.environ.get("LOCAL_DIST", "dist")

    if not host or not user or not password:
        print("❌ Faltan credenciales FTP (FTP_HOST, FTP_USER, FTP_PASSWORD)")
        sys.exit(1)

    # Limpiar prefijos de protocolo o puertos si los hay
    host = host.split("://")[-1].split("/")[0].split(":")[0]

    print(f"🚀 Conectando por FTP a {host} con usuario {user}...")
    ftp = FTP(timeout=60)
    ftp.connect(host, 21)
    ftp.login(user, password)
    ftp.set_pasv(True)

    pwd = ftp.pwd()
    print(f"📂 Directorio raíz remoto detectado: {pwd}")
    
    files_in_root = []
    try:
        files_in_root = ftp.nlst()
        print(f"📋 Contenido actual en el servidor: {files_in_root}")
    except Exception as e:
        print(f"⚠️ No se pudo listar el directorio: {e}")

    # Si Hostinger tiene el placeholder default.php, lo eliminamos para que mande index.html
    for placeholder in ["default.php", "index.php~"]:
        if placeholder in files_in_root:
            try:
                ftp.delete(placeholder)
                print(f"🗑️ Eliminado archivo placeholder de Hostinger: {placeholder}")
            except Exception as e:
                print(f"⚠️ No se pudo eliminar {placeholder}: {e}")

    # Si hay una carpeta accidental 'public_html' creada adentro de public_html
    # Subiremos directamente al directorio actual (pwd)
    print(f"📦 Subiendo archivos compilados desde {local_dist} a la raíz del hosting...")
    upload_dir(ftp, local_dist, "")
    
    ftp.quit()
    print("✨ ¡Despliegue FTP completado con éxito!")

if __name__ == "__main__":
    main()
