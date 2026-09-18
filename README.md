# NUVIB

Tienda pública NUVIB construida con Nuxt, Vue, TypeScript, Bulma y MongoDB.

## Configuración

1. Copia `.env.example` a `.env` y completa las credenciales privadas.
2. Inicializa las colecciones y productos DEMO:

```bash
npm run db:init
```

3. Crea o actualiza el administrador usando variables de entorno:

```bash
npm run admin:create
```

Los clientes no necesitan cuenta. Sus solicitudes comienzan en `SOLICITUD RECIBIDA` y el administrador controla el flujo desde `/admin`.

## Desarrollo

```bash
npm run dev
```

Rutas principales: `/`, `/productos`, `/pedido`, `/admin/login`, `/admin`, `/admin/monitor`, `/admin/pedidos` y `/admin/publicaciones`.

Las credenciales de MongoDB, Cloudinary y administración solo deben existir en `.env`, nunca en el frontend ni en `.env.example`.

Look at the [Nuxt documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Setup

Make sure to install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.
