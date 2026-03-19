# ClipAI Pro

Plataforma SaaS de generacion de videos con Inteligencia Artificial. Crea videos virales con voces IA, subtitulos animados y musica de fondo en minutos.

## Demo en Vivo

- **Frontend:** [https://clipai-pro.netlify.app](https://clipai-pro.netlify.app)
- **Backend API:** [https://clipai-pro.onrender.com](https://clipai-pro.onrender.com)

## Tech Stack

### Backend
- Python 3.12 / Django 4.2
- Django REST Framework
- JWT Authentication (SimpleJWT)
- SQLite (free tier) / PostgreSQL (produccion)
- Gunicorn + WhiteNoise
- Celery + Redis (procesamiento asincrono)

### Frontend
- React 18 + Vite
- TailwindCSS
- Zustand (state management)
- TanStack Query (React Query)
- React Router v6
- Lucide Icons

### Infraestructura
- **Backend:** Render.com (free tier)
- **Frontend:** Netlify (free tier)
- **Repositorio:** GitHub

## Estructura del Proyecto

```
clipai-pro/
├── backend/
│   ├── apps/
│   │   ├── users/          # Autenticacion, perfiles, creditos
│   │   ├── videos/         # Generacion y gestion de videos
│   │   ├── catalog/        # Estilos, voces, musica, planes
│   │   ├── payments/       # Pagos con Culqi, suscripciones
│   │   ├── social/         # Conexion con TikTok, YouTube, Instagram
│   │   └── affiliates/     # Programa de afiliados
│   ├── config/
│   │   ├── settings/       # base.py, development.py, production.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   ├── manage.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── api/            # Axios config y endpoints
│   │   ├── components/     # UI components, wizard, modals
│   │   ├── hooks/          # Custom hooks (useToast, etc.)
│   │   ├── pages/          # Landing, Dashboard, Pricing, etc.
│   │   └── store/          # Zustand stores
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## API Endpoints

### Publicos (sin auth)
| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| GET | `/api/catalog/plans/` | Listar planes disponibles |
| GET | `/api/catalog/styles/` | Listar estilos de video |
| GET | `/api/catalog/voices/` | Listar voces IA |
| GET | `/api/catalog/music/` | Listar musica de fondo |
| POST | `/api/auth/register/` | Registrar usuario |
| POST | `/api/auth/login/` | Iniciar sesion (JWT) |
| GET | `/api/health/` | Health check |

### Autenticados (requieren JWT)
| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| GET | `/api/auth/me/` | Perfil del usuario |
| GET | `/api/videos/` | Listar videos del usuario |
| POST | `/api/videos/generate/` | Generar video con IA |
| GET | `/api/payments/history/` | Historial de pagos |
| POST | `/api/payments/create-charge/` | Crear cargo (Culqi) |
| GET | `/api/social/accounts/` | Cuentas sociales conectadas |
| GET | `/api/affiliates/profile/` | Perfil de afiliado |

## Desarrollo Local

### Backend

```bash
cd backend

# Crear entorno virtual
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows

# Instalar dependencias
pip install -r requirements.txt

# Variables de entorno
export DATABASE_URL=sqlite:///db.sqlite3
export DJANGO_SETTINGS_MODULE=config.settings.development
export SECRET_KEY=tu-secret-key
export FIELD_ENCRYPTION_KEY=tu-fernet-key-base64

# Migraciones y servidor
python manage.py migrate
python manage.py runserver
```

### Frontend

```bash
cd frontend

# Instalar dependencias
npm install

# Variable de entorno
export VITE_API_URL=http://localhost:8000

# Servidor de desarrollo
npm run dev
```

## Despliegue

### Backend en Render

1. Crear Web Service conectado al repo de GitHub
2. **Build Command:** `cd backend && pip install -r requirements.txt && python manage.py migrate`
3. **Start Command:** `cd backend && gunicorn config.wsgi:application`
4. Variables de entorno requeridas:
   - `DJANGO_SETTINGS_MODULE=config.settings.production`
   - `SECRET_KEY` (generar una clave segura)
   - `FIELD_ENCRYPTION_KEY` (clave Fernet base64)
   - `ALLOWED_HOSTS=clipai-pro.onrender.com`
   - `CORS_ALLOWED_ORIGINS=https://clipai-pro.netlify.app`

### Frontend en Netlify

1. Conectar con el repo de GitHub o deploy manual
2. **Build Command:** `cd frontend && npm install && npm run build`
3. **Publish Directory:** `frontend/dist`
4. Variable de entorno:
   - `VITE_API_URL=https://clipai-pro.onrender.com`

## Funcionalidades

- Generacion de videos con IA (Prompt to Video, Sora 2, AI ASMR)
- 12 estilos visuales (Anime, Cartoon, Realista, Cyberpunk, etc.)
- 18 voces IA en multiples idiomas
- 18 tracks de musica de fondo
- Sistema de creditos con 4 planes de suscripcion
- Dashboard con estadisticas
- Publicacion directa a TikTok, YouTube e Instagram
- Programa de afiliados con comisiones
- Pagos seguros con Culqi (PEN)
- Autenticacion JWT con refresh tokens

## Licencia

Proyecto privado - Todos los derechos reservados.
