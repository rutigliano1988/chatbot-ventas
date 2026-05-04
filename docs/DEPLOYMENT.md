# Guia de Despliegue

## Backend en Railway
1. Crea cuenta en railway.app
2. Conecta tu repositorio de GitHub
3. Selecciona la carpeta /backend
4. Agrega las variables del .env en la seccion de Variables
5. Railway detecta Node.js automaticamente y hace el deploy

## Frontend en Vercel
1. Crea cuenta en vercel.com
2. Importa tu repositorio de GitHub
3. Selecciona la carpeta /frontend
4. Agrega REACT_APP_API_URL con la URL de Railway
5. Deploy automatico en cada push

## Base de Datos en Supabase
1. Crea cuenta en supabase.com
2. Crea un nuevo proyecto
3. Copia la cadena de conexion PostgreSQL
4. Pega en la variable DB_* del .env de Railway
