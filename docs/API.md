# Documentacion de la API

## Base URL
http://localhost:3000

## Endpoints

### Webhook WhatsApp
POST /webhook - Recibe mensajes entrantes
GET /webhook  - Verificacion del webhook (Meta)

### Reservas
GET    /reservas        - Lista todas las reservas
POST   /reservas        - Crea una reserva nueva
PUT    /reservas/:id    - Actualiza una reserva
DELETE /reservas/:id    - Cancela una reserva

### Consultas
GET  /consultas               - Lista consultas sin respuesta
POST /consultas/:id/responder - Responde a un cliente por WhatsApp

### Negocio
GET /negocio - Obtiene configuracion
PUT /negocio - Actualiza datos del negocio

### Autenticacion
GET /auth/google          - Inicia login con Google
GET /auth/google/callback - Callback de OAuth
