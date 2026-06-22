FROM python:3.11-slim

# Configuramos variables de entorno para que Python y uv no generen archivos innecesarios
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Instalamos uv en el sistema base
RUN pip install --no-cache-dir uv

# Copiamos primero SOLO los archivos de configuración de dependencias.
# Esto aprovecha el caché de Docker: si no cambias tus librerías, 
# Docker se saltará este paso en futuras compilaciones y será rapidísimo.
COPY pyproject.toml uv.lock ./

# Sincronizamos las dependencias. 
# --no-dev: Evita instalar librerías de pruebas (como pytest) en producción.
# --frozen: Asegura que se respete estrictamente lo que dicta uv.lock.
RUN uv sync --no-dev --frozen

# Ahora copiamos el resto del código de tu API
COPY . .

# Exponemos el puerto
EXPOSE 8000

# Usamos 'uv run' para que el servidor se ejecute garantizadamente 
# dentro del entorno virtual (.venv) que 'uv sync' acaba de crear.
CMD ["uv", "run", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]