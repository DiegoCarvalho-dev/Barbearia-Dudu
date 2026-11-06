# Dudu Barber Shop — direção do projeto

## Objetivo

Criar uma vitrine digital para a Dudu Barber Shop, com foco em apresentar a marca, sua história, equipe, serviços, planos e unidades. O site não realiza agendamentos nem possui área administrativa. A manutenção do conteúdo será feita pela equipe responsável pelo projeto.

## Direção aprovada

- Home contemporâneo aprovado na terceira proposta visual: fundo preto com vermelho discreto, nome DUDU em destaque atrás do retrato, frase curta e tipografia editorial. O restante do site será revisto posteriormente.
- Paleta: preto `#101010`, grafite `#1b1b1b`, branco quente `#f3efea`, cinza `#a8a39f` e vermelho `#c91822` como cor de destaque. As cores podem ser refinadas para garantir contraste.
- Página inicial com o retrato do dono integrado à tipografia; a imagem atual usa um recorte gerado por IA a partir da foto fornecida e pode ser trocada quando uma nova foto estiver disponível.
- Prompt utilizado para o recorte: remover somente o fundo da fotografia fornecida e preservar rosto, expressão, proporções, braços cruzados, roupa e enquadramento, produzindo imagem com transparência e sem novos elementos. O recorte foi gerado pela ferramenta interna de imagens e salvo em `public/images/dudu-recorte.webp`.
- Cada seção ocupa a altura da tela, inclusive no celular. O destaque mantém o efeito de foto fixa enquanto sai da tela, sem aumentar a altura do início. Em telas muito baixas, o conteúdo da seção pode ser rolado para permanecer acessível.
- O retrato é enquadrado sem corte e o efeito respeita a preferência por movimento reduzido e telas móveis.
- No home, a foto acompanha a janela enquanto o nome ao fundo se desloca em outra velocidade. Após o carregamento dos recursos, a foto entra pela direita e as frases entram por lados diferentes uma única vez por carregamento; ao voltar, apenas o parallax continua. O menu apresenta um traço animado ao passar o mouse.
- Em celulares, o nome fica maior à altura da cabeça, com o retrato deslocado para a direita e mais abaixo, atrás de parte da chamada. Em tablets, o nome é maior e a chamada fica mais abaixo, com apenas parte de uma letra encoberta pela cabeça.
- O botão principal do home é claro e arredondado e leva à história com uma rolagem gradual. A animação respeita a preferência por movimento reduzido e pode ser interrompida pela pessoa.
- A marca no cabeçalho é apenas informativa. A frase principal e as cidades recebem um efeito discreto ao passar o mouse, sem indicar que são links.
- A seção Nossa História segue a direção aprovada: fundo branco, foto do Dudu trabalhando com cantos arredondados e tipografia sem serifa. “Sonho” e “2016” aparecem em vermelho, com efeitos discretos ao passar o mouse, assim como “nossa trajetória” e o link para a equipe. As animações de entrada acontecem apenas na primeira visita à seção. A foto original está em `referencias/foto-historia-original.jpeg` e a versão otimizada em `public/images/dudu-historia.webp`.
- A imagem de referência aprovada é uma simulação. A fotografia enviada posteriormente foi adicionada à abertura do site.
- Layout responsivo para celulares, tablets, laptops e desktops, com navegação acessível e carregamento leve.
- A relação das unidades não deve aparecer como uma faixa logo abaixo do destaque, como na imagem de referência.

## Conteúdo acordado

- Apresentação e história da barbearia, sem inventar fatos.
- Espaço para apresentar a equipe quando os dados e as fotos forem fornecidos.
- Serviços e planos: a referência apresenta cabelo por R$ 55 (duas vezes por mês), barba por R$ 100 e cabelo e barba por R$ 200 (quatro vezes no mês). Valores e condições precisam ser confirmados antes da publicação final; não deduzir condições ausentes.
- Unidades: São José de Mipibu, Nísia Floresta e Goianinha. Endereços individuais ainda não foram informados.
- Botão flutuante de WhatsApp com número provisório, substituível antes da publicação final.
- Não implementar agendamento, pagamentos, contas de usuário ou painel administrativo.

## Decisões técnicas

- React com Vite, conforme preferência indicada pelo solicitante e adequado a uma vitrine estática.
- Conteúdo editável nos arquivos do projeto; imagens reais podem ser integradas depois.
- Versionamento Git com commits por etapas coerentes e envio ao repositório GitHub informado: `https://github.com/DiegoCarvalho-dev/Barbearia-Dudu`.

## Pendências de conteúdo

- Imagens autorizadas da equipe e das unidades.
- Número de WhatsApp definitivo.
- Confirmação dos valores e das condições completas dos planos.
- Endereços, horários por unidade e informações adicionais verificadas para enriquecer a história e a apresentação da equipe.
