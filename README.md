# Cardápio Online - Boilerplate

Boilerplate de cardápio digital para restaurantes e delivery. Integrado com API NestJS para menu dinâmico, programa de fidelidade, cupons e pedidos.

## Sobre o projeto

Projeto voltado para pequenos negócios que precisam de um cardápio online com backend. Consome a API de delivery para exibir produtos, validar cupons, gerenciar pontos de fidelidade e criar pedidos. Após o pedido, abre o WhatsApp com a mensagem formatada.

## Funcionalidades

- **Cardápio dinâmico** — Categorias e produtos vindos da API (`GET /menu`)
- **Programa de fidelidade** — Busca cliente por telefone, exibe saldo de pontos
- **Cupom de desconto** — Validação em tempo real (`POST /coupons/validate`)
- **Loja de recompensas** — Troca de pontos por itens (`GET /rewards`)
- **Pedido via API** — `POST /orders` substitui envio direto ao WhatsApp
- **WhatsApp** — Após criar pedido, gera mensagem e abre link

## Stack

- **Next.js 16** (App Router)
- **React 19**
- **TypeScript**
- **Tailwind CSS 4**
- **React Query (TanStack Query)**
- **Axios**
- **Framer Motion** — Animações
- **Embla Carousel** — Carrossel de imagens

## Configuração

Crie `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_RESTAURANT_ID=seu-restaurant-id
```

- **NEXT_PUBLIC_API_URL** — URL da API NestJS
- **NEXT_PUBLIC_RESTAURANT_ID** — ID do restaurante (header `x-restaurant-id`)

## Início rápido

```bash
pnpm install
pnpm dev
```

Acesse [http://localhost:3000](http://localhost:3000). A API deve estar rodando na URL configurada.

## API esperada

| Método | Endpoint | Descrição |
|--------|----------|------------|
| GET | `/menu` | Categorias e produtos |
| GET | `/customers/:phone` | Buscar cliente por telefone |
| GET | `/loyalty/balance/:phone` | Saldo de pontos |
| POST | `/coupons/validate` | Validar cupom `{ code, orderValue }` |
| GET | `/rewards` | Lista de recompensas |
| POST | `/orders` | Criar pedido |

## Estrutura do projeto

```
├── app/
│   ├── components/
│   ├── hooks/          # useMenu, useCustomer, useLoyalty, useRewards, useCreateOrder
│   ├── services/       # Client Axios + funções de API
│   ├── types/
│   └── ...
└── package.json
```

## Extras

- Telefone persistido em `localStorage` para pré-preenchimento
- Header `Authorization: Bearer` quando houver token (preparado para login futuro)
