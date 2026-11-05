# Dudu Barber Shop

Site de apresentação da Dudu Barber Shop, desenvolvido com React e Vite. A direção visual e as decisões de conteúdo estão em [docs/visaodoprojeto.md](docs/visaodoprojeto.md).

## Desenvolvimento

```bash
npm install
npm run dev
```

Para validar a versão de produção:

```bash
npm run build
npm run preview
```

## Conteúdo pendente

- **Foto principal:** o recorte transparente, gerado por IA a partir da foto fornecida, está em `public/images/dudu-recorte.webp` e é configurado pela constante `heroImage` em `src/main.jsx`. O original está em `referencias/foto-home-original.jpg`. A composição mantém o efeito de parallax e respeita a configuração de movimento reduzido.
- **WhatsApp:** substitua o número fictício na constante `whatsapp` em `src/main.jsx` antes de divulgar o site.
- **Planos:** confirme valores e condições com a barbearia. A referência não informa todos os detalhes.
- **Equipe e unidades:** fotos, nomes, endereços e horários podem ser adicionados quando forem confirmados.

O site não inclui agendamento, pagamentos ou área administrativa.
