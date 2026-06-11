Xepelin Growth Engineer — Lead Enrichment Pipeline

Demo: https://graceful-energy-production-ecc9.up.railway.app
API: https://xepelin-growth-engineer-production.up.railway.app/api
Repo: https://github.com/luisolguin-dev/xepelin-growth-engineer


Prerequisitos


Node.js 18+
Docker Desktop



Levantar localmente

1. Clonar el repo

git clone https://github.com/luisolguin-dev/xepelin-growth-engineer.git

cd xepelin-growth-engineer

2. Crear .env en la raíz del proyecto

Crear el archivo xepelin-growth-engineer/.env con:

DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=xepelin_growth

Este archivo es leído por docker-compose.yml para crear la base de datos PostgreSQL.

3. Levantar PostgreSQL y Redis

docker compose up -d

4. Configurar variables de entorno de la API

 Crear .env en la carpeta api

Crear el archivo xepelin-growth-engineer/api/.env con:

DB_HOST=localhost
DB_PORT=5433
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=xepelin_growth

REDIS_HOST=localhost
REDIS_PORT=6379


PORT=3000
FRONTEND_URL=http://localhost:3001

ANTHROPIC_API_KEY=      

5. Iniciar la API

cd api
npm install
npm run start:dev

5. Configurar variables de entorno del frontend

Crear web/.env.local:

NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=    # clerk.com
CLERK_SECRET_KEY=                     # clerk.com

6. Iniciar el frontend

cd web
npm install
npm run dev

La API corre en http://localhost:3000/api y el frontend en http://localhost:3001.


Probar el pipeline

Enviar el Anexo A completo desde Postman o curl:

POST http://localhost:3000/api/batches
Content-Type: application/json

json{
  "name": "Outbound MX - Batch demo Q1",
  "segment": "pyme_servicios",
  "ownerEmail": "sdr.demo@xepelin.com",
  "webhookUrl": "https://webhook.site/your-uuid",
  "leads": [
    { "legalId": "76.123.456-7", "legalName": "Comercializadora Andes SpA", "website": "https://comercializadoraandes.cl" },
    { "legalId": "MAGE920101AB1", "legalName": "Manufacturas Aguila SA de CV", "website": "https://manufacturasaguila.mx" },
    { "legalId": "77.987.654-3", "legalName": "Servicios Logisticos del Sur Ltda", "website": "https://logisticadelsur.cl" },
    { "legalId": "TINP880515XY2", "legalName": "Tecnologia Integral del Norte", "website": "http://tinorte.com.mx" },
    { "legalId": "76.555.111-9", "legalName": "Importadora Pacifico SA", "website": "https://importadorapacifico.cl" },
    { "legalId": "GRTE010203QW3", "legalName": "Grupo Textil del Este", "website": "https://grupotextileste.mx" },
    { "legalId": "77.444.222-K", "legalName": "Constructora Cordillera SpA", "website": "not-a-valid-url" },
    { "legalId": "AGME950707RT4", "legalName": "Agroexportadora Mediterraneo", "website": "https://agromediterraneo.mx" },
    { "legalId": "76.123.456-7", "legalName": "Comercializadora Andes SpA", "website": "https://comercializadoraandes.cl" },
    { "legalId": "78.111.000-2", "legalName": "Distribuidora Central Ltda", "website": "https://distcentral.cl" },
    { "legalId": "FAQM900909LM5", "legalName": "Fabrica de Alimentos Quetzal", "website": "https://alimentosquetzal.mx" },
    { "legalId": "76.222.333-4", "legalName": "Soluciones Digitales Austral", "website": "https://digitalaustral.cl" },
    { "legalId": "PLNE870404ZX6", "legalName": "Plasticos del Noreste SA", "website": "https://plasticosnoreste.mx" },
    { "legalId": "77.888.999-1", "legalName": "Transportes Bio Bio SpA", "website": "https://transportesbiobio.cl" },
    { "legalId": "COVE020606BN7", "legalName": "Comercio Verde SA de CV", "website": "" },
    { "legalId": "76.333.444-5", "legalName": "Maquinarias del Valle Ltda", "website": "https://maqvalle.cl" },
    { "legalId": "MAGE920101AB1", "legalName": "Manufacturas Aguila SA de CV", "website": "https://manufacturasaguila.mx" },
    { "legalId": "78.222.111-3", "legalName": "Asesorias Financieras Lican", "website": "https://aflican.cl" },
    { "legalId": "QUSE110811GH8", "legalName": "Quimica del Sureste", "website": "https://quimicasureste.mx" },
    { "legalId": "76.444.555-6", "legalName": "Ferreteria Industrial Maipo", "website": "https://ferremaipo.cl" }
  ]
}

El endpoint responde 202 Accepted inmediatamente. El procesamiento ocurre en background — seguir el estado en GET /api/batches o en el frontend.


Decisiones de AI enrichment

Modelo: Claude Haiku vía Anthropic API

Fuente de datos: Scraping del sitio web de la empresa con cheerio (homepage, 1000 chars máximo).

Segunda fuente: No implementada en el MVP — en producción se agregaría Google Custom Search para mejorar cobertura en PyMEs con sitios inactivos.

Prompt: En español para que los outputs sean directamente usables por los SDRs sin traducción. Output estructurado con prospectFitScore, prospectFitJustification, iceBreaker, painHypothesis.