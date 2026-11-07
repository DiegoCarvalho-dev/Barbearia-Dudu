# Dudu Barber Shop

**Uma landing page que apresenta a identidade, a história e os serviços de uma barbearia.**

![React](https://img.shields.io/badge/React-19-20232A?logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-6-20232A?logo=vite&logoColor=BD93F9)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6%2B-20232A?logo=javascript&logoColor=F7DF1E)
![CSS](https://img.shields.io/badge/CSS-Responsivo-20232A?logo=css&logoColor=white)

---

## Sobre o projeto

A **Dudu Barber Shop** é uma landing page de apresentação inspirada em uma barbearia de São José de Mipibu, no Rio Grande do Norte. O site reúne a história da marca, a equipe, os serviços, os planos e as cidades onde a barbearia está presente.

Desenvolvi este projeto para praticar minhas habilidades em front-end e criar uma peça para meu portfólio. Ele também serve como base para explorar a criação de sites para negócios locais e, futuramente, apresentar esse tipo de solução a possíveis clientes.

> Projeto de portfólio e demonstração. As informações comerciais devem ser confirmadas antes de uma divulgação oficial.

## Destaques

- **Design responsivo:** layouts adaptados para celulares, tablets, laptops e desktops.
- **Experiência visual:** efeito parallax na abertura, animações de entrada e interações sutis.
- **Navegação simples:** acesso direto às seções, ao Instagram e ao contato pelo WhatsApp.
- **Atenção à acessibilidade:** navegação por teclado e respeito à preferência por movimento reduzido.
- **Conteúdo organizado:** apresentação da história, equipe, serviços, assinaturas e unidades.

O site é uma vitrine digital e não realiza agendamentos, pagamentos ou cadastro de usuários.

## Tecnologias

| Tecnologia | Uso |
| --- | --- |
| React | Componentes e interface |
| Vite | Desenvolvimento e compilação |
| JavaScript | Interações, animações e navegação |
| CSS | Estilização e responsividade |
| Playwright | Testes no navegador |

## Como executar

**Pré-requisitos:** Node.js 22 ou superior e npm.

Clone o repositório e instale as dependências:

```bash
git clone https://github.com/DiegoCarvalho-dev/Barbearia-Dudu.git
cd Barbearia-Dudu
npm install
```

Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

Abra no navegador o endereço local informado pelo Vite.

Para gerar e visualizar a versão de produção:

```bash
npm run build
npm run preview
```

O build é gerado na pasta `dist/`.

### Testes

```bash
npm run test:browser
```

Os testes usam um navegador Chrome ou Edge instalado. Caso ele não seja encontrado automaticamente, configure a variável `CHROME_PATH` com o caminho do executável.

Para verificar também o mecanismo WebKit, usado pelos navegadores no iPhone, instale o navegador de teste e execute:

```bash
node node_modules/playwright-core/cli.js install webkit
npm run test:webkit
```

## Organização

```text
├── docs/                 # Direção e decisões do projeto
├── public/images/        # Imagens otimizadas usadas no site
├── referencias/          # Fotografias originais
├── src/
│   ├── components/       # Seções e componentes da interface
│   ├── data/             # Conteúdo e informações de contato
│   ├── hooks/            # Animações e comportamento de rolagem
│   └── *.css             # Estilos por seção
└── tests/                # Testes no navegador
```

A documentação detalhada está em [docs/visaodoprojeto.md](docs/visaodoprojeto.md).

## Antes de divulgar

- Substituir o número fictício do WhatsApp em `src/data/site.js`.
- Confirmar com a barbearia os valores e as condições dos planos.
- Validar as imagens e as informações apresentadas; endereços e horários podem ser acrescentados quando estiverem disponíveis.

---

Desenvolvido por [Diego Carvalho](https://github.com/DiegoCarvalho-dev) como projeto de estudo e portfólio.
