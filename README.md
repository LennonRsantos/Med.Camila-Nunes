# Dra. Camila Nunes — Saúde Integral da Mulher

![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![Sass](https://img.shields.io/badge/Sass-CC6699?logo=sass&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)
![Vercel](https://img.shields.io/badge/Vercel-000000?logo=vercel&logoColor=white)

Landing page da **Dra. Camila Nunes**, médica de Família e Comunidade dedicada ao cuidado integral da saúde da mulher em Águas Claras (DF).

O site apresenta a médica e sua forma de atender, as opções de consulta e os procedimentos com valores, avaliações de pacientes e conteúdo educativo. Cada etapa leva a um único objetivo: facilitar o agendamento pelo WhatsApp.

---

## Destaques

- **Agendamento em um toque** — todos os botões abrem o WhatsApp com uma mensagem pronta para o tipo de consulta, procedimento ou artigo de onde a paciente veio.
- **Pensado primeiro para o celular** — carrosséis de deslizar, sanfonas e menu compacto; layout testado de 360 px a 1920 px.
- **Conteúdo educativo** — 10 artigos com fontes, lidos numa janela sobre a página, sem perder o lugar. Cada artigo tem link próprio (ex.: `#artigo-menopausa`).
- **Prova social** — avaliações do Google com link para o original e aviso em conformidade com a Resolução CFM nº 2.336/2023.
- **Movimento com propósito** — diagrama orbital da abordagem de cuidado, linhas animadas no topo, revelação suave ao rolar e rodapé em cortina. Tudo é desligado para quem prefere menos movimento no sistema.
- **Acessível** — HTML semântico, navegação completa por teclado, foco sempre visível, textos alternativos e paleta com contraste WCAG AA.
- **Encontrável** — Open Graph para prévias no WhatsApp e nas redes sociais, e dados estruturados Schema.org (`Physician` e `FAQPage`).
- **Leve** — HTML, CSS e JavaScript puros, sem framework. CSS minificado e imagens com dimensões definidas e carregamento sob demanda.

## Seções da página

| Seção | Âncora | Conteúdo |
|---|---|---|
| Início | `#inicio` | Apresentação, especialidade, CRM/RQE e chamada para agendamento |
| Sobre | `#sobre` | Trajetória e propósito da médica |
| Abordagem | `#abordagem` | Metodologia de cuidado: paciente no centro e os três pilares |
| Consultas | `#consultas` | Três modalidades com valores, duração e o que está incluso |
| Procedimentos | `#procedimentos` | Implanon e exame preventivo |
| Diferenciais | `#diferenciais` | O que torna o atendimento diferente |
| Avaliações | `#avaliacoes` | Depoimentos verificados no Google |
| Informações | `#informacoes` | Retorno, atendimento particular e formas de pagamento |
| Blog | `#blog` | Artigos sobre saúde da mulher |
| Perguntas frequentes | `#faq` | Dúvidas comuns antes da primeira consulta |
| Contato | `#contato` | WhatsApp, localização, Instagram e horários |

## Tecnologias

- **HTML5** semântico
- **Sass** (Dart Sass) organizado em módulos com `@use` e `@forward`
- **JavaScript** moderno, sem dependências
- **Bootstrap Icons** 1.13.1
- **Google Fonts** — Young Serif (títulos) e Hanken Grotesk (texto)
- **Vercel** — hospedagem e deploy contínuo

## Identidade visual

| Cor | Hex | Uso |
|---|---|---|
| Café | `#6b4a3a` | Títulos, botões e blocos de destaque |
| Caramelo | `#b5764c` | Detalhes, linhas e ícones |
| Areia | `#e9dfc8` | Faixas, etiquetas e fundos de ícone |
| Creme | `#f7f3ec` | Fundo da página |
| Taupe | `#a1887a` | Bordas e divisórias |

Os tons usados em textos pequenos são derivados dessas cores para manter o contraste mínimo de 4,5:1. Todas as cores, fontes, espaçamentos e breakpoints ficam em [`scss/abstracts/_tokens.scss`](scss/abstracts/_tokens.scss).

## Estrutura do projeto

```
.
├── index.html            # Conteúdo e marcação da página
├── styles.css            # CSS gerado pelo Sass (não editar à mão)
├── script.js             # Menu, carrosséis, órbita, blog e animações
├── assets/               # Fotografias
├── scss/
│   ├── main.scss         # Ponto de entrada do Sass
│   ├── abstracts/        # Tokens, funções e mixins
│   ├── base/             # Reset, tipografia e utilitários
│   ├── components/       # Botões, carrossel, revelação, spotlight, WhatsApp flutuante
│   ├── layout/           # Cabeçalho e rodapé
│   └── sections/         # Um arquivo por seção da página
├── scripts/build.mjs     # Monta a pasta dist/ para o deploy
├── vercel.json           # Configuração de build da Vercel
└── package.json
```

## Como rodar localmente

Pré-requisito: [Node.js](https://nodejs.org/) 18 ou superior.

```bash
npm install       # instala o Sass
npm run watch     # recompila o CSS a cada alteração em scss/
```

Depois, abra o `index.html` no navegador ou use uma extensão como o Live Server.

> Se o `npm run watch` não reagir às alterações, autorize o script de instalação do observador de arquivos com `npm install-scripts approve @parcel/watcher` e rode `npm install` novamente.

## Build e deploy

```bash
npm run build
```

Esse comando compila `scss/main.scss` em `styles.css` (minificado) e copia o site para a pasta `dist/`.

Na Vercel, o build roda automaticamente a cada push na branch `main`. A pasta `dist/` é publicada, conforme o [`vercel.json`](vercel.json).

## Personalização

| O que alterar | Onde |
|---|---|
| Textos, preços e links | `index.html` |
| Número do WhatsApp | Links `https://wa.me/5561993314896` em `index.html` |
| Cores, fontes, espaçamentos e breakpoints | `scss/abstracts/_tokens.scss` |
| Dados para o Google (horário, local, preços) | Bloco `Physician` no `<head>` do `index.html` |
| Perguntas frequentes | Seção `#faq` e bloco `FAQPage` no `<head>` — mantenha os dois iguais |

Ao configurar o domínio definitivo, adicione `<link rel="canonical">` e `og:url` no `<head>`. Há um comentário no próprio arquivo indicando o local.

### Medição de cliques

Todos os botões de WhatsApp têm o atributo `data-cta` (ex.: `hero`, `consulta-inicial`, `blog-menopausa`). Com isso, é possível ligar uma ferramenta de analytics depois, sem alterar o HTML.

## Créditos

- Desenvolvido por [Lennon Santos](https://linkslennonrsantos.vercel.app/).
- Os efeitos de órbita, linhas animadas, spotlight e rodapé foram inspirados em componentes da comunidade [21st.dev](https://21st.dev) e reimplementados em HTML, Sass e JavaScript.
- Conteúdo, textos e imagens: Dra. Camila Nunes — CRM DF 29940 | RQE 26577.
