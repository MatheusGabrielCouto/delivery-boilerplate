# Cardápio Online - Boilerplate

Site de pedidos online para restaurantes. Cadastre produtos e categorias de forma estática via JSON.

## Início rápido

```bash
pnpm dev
```

Acesse [http://localhost:3000](http://localhost:3000).

## Cadastro de produtos

Edite o arquivo `data/products.json` para cadastrar:

- **restaurant**: Nome e descrição do restaurante
- **categories**: Categorias do cardápio (Bebidas, Lanches, etc.)
- **products**: Produtos com nome, descrição, preço, imagem e categoria

Veja a documentação completa em `data/README.md`.

### Exemplo de produto

```json
{
  "id": "x-burger",
  "name": "X-Burger",
  "description": "Hambúrguer artesanal com queijo",
  "price": 18.00,
  "image": "/products/xburger.png",
  "categoryId": "lanches",
  "available": true
}
```

Imagens: coloque em `public/products/` e use o caminho `/products/nome.png` no JSON.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
