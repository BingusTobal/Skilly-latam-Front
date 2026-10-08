# Skilly Latam — Frontend

Interfaz web de Skilly Latam (marketplace de servicios con precio fijo).

## Stack

- React 18 + Vite
- Tailwind CSS
- `react-router-dom`
- `axios`

## Requisitos

- Node.js 18+ y npm
- Backend de Skilly corriendo (por defecto en `http://localhost:8000`)

## Configuración

```bash
cp .env.example .env
npm install
```

`VITE_API_URL` apunta a la base de la API, por defecto `http://localhost:8000/api`.

## Desarrollo

```bash
npm run dev
```

La app queda disponible en `http://localhost:5173`.

## Build

```bash
npm run build
npm run preview
```

## Estructura

```
src/
├── api/            # axios + un archivo por recurso
├── context/        # AuthContext (JWT)
├── components/     # Navbar, ServicioCard, StatusBadge, Layout, RutaProtegida
├── lib/            # formateo de montos, estados y formatos
└── pages/
    ├── organizacion/   Home, Catalogo, DetalleServicio, LoginRegistro
    ├── profesional/    MisServicios, PublicarServicio
    └── admin/          RevisionServicios
```