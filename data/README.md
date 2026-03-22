# Cadastro de Produtos

Edite o arquivo `products.json` para cadastrar seus produtos de forma estática.

## Estrutura do JSON

```json
{
  "theme": {
    "primary": "#E53935",
    "primaryHover": "#C62828",
    "secondary": "#FFC107",
    "secondarySoft": "#FFF8E1",
    "background": "#FFFFFF",
    "foreground": "#212121",
    "foregroundMuted": "#616161",
    "whatsapp": "#25D366"
  },
  "restaurant": {
    "name": "Nome do Restaurante",
    "description": "Descrição exibida no header",
    "whatsapp": "5511999999999",
    "icon": "/logo.svg",
    "deliveryFee": 5.00,
    "businessHours": {
      "monday": { "open": "11:00", "close": "23:00" },
      "tuesday": { "open": "11:00", "close": "23:00" },
      "wednesday": { "open": "11:00", "close": "23:00" },
      "thursday": { "open": "11:00", "close": "23:00" },
      "friday": { "open": "11:00", "close": "23:00" },
      "saturday": { "open": "11:00", "close": "23:00" },
      "sunday": null
    }
  },
  "footer": {
    "copyright": "Todos os direitos reservados"
  },
  "categories": [
    {
      "id": "id-unico",
      "name": "Nome da Categoria",
      "order": 1
    }
  ],
  "products": [
    {
      "id": "id-unico-produto",
      "name": "Nome do Produto",
      "description": "Descrição curta",
      "price": 25.00,
      "image": "/products/produto/foto.png",
      "images": [
        "/products/produto/01.jpg",
        "/products/produto/02.jpg",
        "/products/produto/03.jpg"
      ],
      "categoryId": "id-unico",
      "available": true
    }
  ]
}
```

## Campos

- **theme** (opcional): Paleta de cores do sistema. Se omitido, usa valores padrão.
  - **primary**: Cor principal (botões, destaques)
  - **primaryHover**: Cor no hover dos botões
  - **secondary**: Cor secundária (badges, ícones)
  - **secondarySoft**: Fundos suaves e bordas
  - **background**: Cor de fundo da página
  - **foreground**: Cor do texto principal
  - **foregroundMuted**: Cor do texto secundário
  - **whatsapp**: Cor do botão WhatsApp
- **restaurant**: Dados do restaurante (nome, descrição, whatsapp e icon)
  - **whatsapp**: Número com DDD e país, só dígitos (ex: 5511999999999)
  - **icon** (opcional): Caminho do ícone/logo (ex: /logo.png ou /logo.svg)
  - **deliveryFee** (opcional): Taxa de entrega em reais. Omita ou use 0 para não cobrar.
  - **timezone** (opcional): Fuso do restaurante para verificação de horários (ex: `"America/Sao_Paulo"`). Se omitido, usa o horário do dispositivo do usuário.
  - **businessHours** (opcional): Horários de funcionamento. Use `null` para dia fechado (ex: `"sunday": null`). Formato `"HH:mm"`.
- **footer** (opcional): Rodapé da página
  - **copyright**: Texto de direitos reservados (ex: "Todos os direitos reservados")
- **categories**: Lista de categorias. O campo `order` define a ordem de exibição
- **products**: Lista de produtos
  - `image`: Imagem principal (obrigatória). Usada no card e como fallback
  - `images` (opcional): Array de imagens para o carrossel na tela de detalhes. Se houver mais de 1, exibe navegação
  - `categoryId`: Deve corresponder ao `id` de uma categoria
  - `available`: `false` oculta o produto do cardápio

## Imagens

### Estrutura de pastas por produto

Para produtos com várias imagens, organize em pastas:

```
public/products/
├── x-burger/
│   ├── 01.jpg
│   ├── 02.jpg
│   └── 03.jpg
├── x-bacon/
│   ├── 01.jpg
│   └── 02.jpg
└── prato-feito/
    ├── 01.jpg
    ├── 02.jpg
    ├── 03.jpg
    └── 04.jpg
```

No JSON, use os caminhos completos:

```json
{
  "id": "x-burger",
  "image": "/products/x-burger/01.jpg",
  "images": [
    "/products/x-burger/01.jpg",
    "/products/x-burger/02.jpg",
    "/products/x-burger/03.jpg"
  ]
}
```

- **image**: Sempre obrigatório. Primeira imagem ou única imagem
- **images**: Opcional. Quando presente com 2+ itens, ativa o carrossel na tela de detalhes
