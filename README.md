# ChatBot Ventas - MVP Fase 1

ChatBot de atención al cliente para comercios locales con sistema de reservas.

## Stack Técnico
- **Backend:** Node.js + Express.js
- **Canal:** WhatsApp Business API (Meta)
- **Reservas:** Google Calendar API
- **Base de datos:** PostgreSQL
- **Frontend:** React.js
- **Email:** SendGrid
- **Hosting:** Railway (backend) + Vercel (frontend)

## Estructura del Proyecto

```
chatbot-ventas/
├── backend/        → Motor del chatbot
├── frontend/       → Dashboard del dueño
└── docs/           → Documentación
```

## Primeros pasos

1. Clona el repositorio
2. Copia `.env.example` a `.env` y rellena los datos
3. Instala dependencias: `npm install`
4. Inicia en desarrollo: `npm run dev`

## Documentación
- [Configuración inicial](docs/SETUP.md)
- [APIs disponibles](docs/API.md)
- [Despliegue](docs/DEPLOYMENT.md)
