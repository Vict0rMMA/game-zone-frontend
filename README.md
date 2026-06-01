# Inventario Frontend

Interfaz web para el Sistema de Gestión de Inventario. Construida con **Next.js 14 + TypeScript + Tailwind CSS**.

## Stack

- Next.js 14 (App Router) + TypeScript
- Axios (cliente HTTP centralizado con interceptores)
- Tailwind CSS
- react-hot-toast para notificaciones

## Estructura

```
src/
├── types/        # Interfaces TypeScript
├── services/     # Cliente Axios + servicios por recurso
├── hooks/        # Lógica reutilizable (useProducts, useCategories)
├── contexts/     # AuthContext con persistencia de sesión
├── components/
│   ├── ui/       # Button, Input, Modal, LoadingSpinner
│   ├── layout/   # Header, Sidebar
│   └── forms/    # ProductForm
└── app/
    ├── (auth)/   # login, register
    └── (dashboard)/ # dashboard, products, categories, admin
```

## Setup local

```bash
# 1. Instalar dependencias
npm install

# 2. Copiar variables de entorno
cp .env.example .env.local
# Completar NEXT_PUBLIC_API_URL

# 3. Ejecutar en desarrollo
npm run dev
```

## Variables de entorno

| Variable | Descripción |
|---|---|
| `NEXT_PUBLIC_API_URL` | URL base del backend (ej. `http://localhost:4000/api/v1`) |

## Vistas

| Ruta | Acceso | Descripción |
|---|---|---|
| `/login` | Público | Iniciar sesión |
| `/register` | Público | Crear cuenta |
| `/dashboard` | Autenticado | Resumen con estadísticas |
| `/products` | Autenticado | Listado con búsqueda y paginación |
| `/products/new` | Admin | Crear producto |
| `/products/:id/edit` | Admin | Editar producto |
| `/categories` | Autenticado | Gestión de categorías |
| `/admin` | Admin | Panel de administración |

## Despliegue (Vercel)

1. Conectar repo en [vercel.com](https://vercel.com)
2. Agregar variable de entorno `NEXT_PUBLIC_API_URL` apuntando al backend desplegado
3. Deploy automático en cada push a main
