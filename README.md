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

Para gerar a versão de produção e testar as animações, o parallax e o botão em um navegador instalado:

```bash
npm run test:browser
```

O teste procura Chrome ou Edge nos locais comuns. Se necessário, defina `CHROME_PATH` com o caminho do navegador antes de executá-lo.

## Estrutura e conteúdo pendente

- **Código:** `src/App.jsx` reúne as seções; os componentes estão em `src/components`, os dados em `src/data/site.js` e as animações e a rolagem em `src/hooks`.
- **Fotos:** os arquivos usados no site ficam em `public/images`; os originais ficam em `referencias`, incluindo `foto-equipe-original.jpeg`. O recorte transparente da foto principal, gerado por IA a partir da imagem fornecida, é configurado por `heroImage` em `src/data/site.js`.
- **WhatsApp:** substitua o número fictício na constante `whatsapp` em `src/data/site.js` antes de divulgar o site.
- **Planos:** confirme valores e condições com a barbearia. A referência não informa todos os detalhes.
- **Equipe e unidades:** confirme a foto da equipe e as três cidades. Nomes individuais, endereços e horários podem ser adicionados quando forem informados.

O site não inclui agendamento, pagamentos ou área administrativa.
