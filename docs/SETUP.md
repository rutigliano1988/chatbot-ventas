# Configuracion Inicial

## Requisitos
- Node.js v18+
- PostgreSQL 14+
- Cuenta Meta for Developers (WhatsApp)
- Cuenta Google Cloud (Calendar API)
- Cuenta SendGrid (emails)

## Paso 1: Clonar el repositorio
git clone https://github.com/rutigliano1988/chatbot-ventas.git
cd chatbot-ventas

## Paso 2: Configurar el Backend
cd backend
cp .env.example .env
(Edita .env con tus credenciales)
npm install
npm run dev

## Paso 3: Configurar el Frontend
cd frontend
cp .env.example .env
npm install
npm start

## Paso 4: WhatsApp Business API
1. Entra a developers.facebook.com
2. Crea una app de tipo Negocios
3. Anade producto: WhatsApp
4. Copia el Token y Phone Number ID al .env

## Paso 5: Google Calendar
1. Entra a console.cloud.google.com
2. Crea un proyecto nuevo
3. Activa Google Calendar API
4. Crea credenciales OAuth 2.0
5. Copia Client ID y Secret al .env
