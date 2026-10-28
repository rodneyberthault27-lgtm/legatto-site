# Legatto — site institucional

Site estático em português. A home é editada em `index.html`; conteúdo das seis páginas em `data/services.cjs`; layout em `styles.css`.

## Preparar publicação

Execute `node scripts/build-static.cjs`. O resultado em `dist/` inclui os serviços, privacidade, sitemap, robots e 404. O projeto Sites permanece identificado em `.openai/hosting.json`.

### GitHub Pages

Cada push em `main` executa `.github/workflows/pages.yml`: valida o build, prepara o site com o endereço retornado pelo GitHub e publica somente `dist/`. O repositório é público por autorização do responsável.

Endereço: https://rodneyberthault27-lgtm.github.io/legatto-site/

O build aceita `SITE_URL` para gerar canonical, imagens de compartilhamento, sitemap e links da página 404 com o subdiretório correto. Sem essa variável, mantém o endereço original do Sites. Teste: `node tests/build-hosting.cjs`.

Para reverter uma publicação com falhas, reverta o commit correspondente e aguarde o workflow, ou execute novamente um workflow do último commit aprovado. Verifique home, páginas de serviços, imagens e abertura do WhatsApp antes de considerar o deploy concluído. Nenhum banco ou migração está envolvido.

Os testes de navegador estão em `tests/seguro-auto.cjs`, `tests/service-pages.cjs` e `tests/game-privacy.cjs`; usam o Playwright e o Chrome disponíveis no ambiente local de desenvolvimento. Não ativam analytics nem enviam dados de clientes.

## Fotografia e movimento — 19/10/2026

`jornada.css` preserva as composições completas do banner e das seis fotos de serviço, com legendas fora da fotografia e grade responsiva 3/2/1 colunas. Não há zoom automático contínuo nem texto sobre pessoas.

`jornada.js` usa GSAP 3.15.0, servido localmente em `assets/vendor/`, para uma entrada curta e um diagrama SVG com traço CSS ligando quatro áreas com destinos reais. Só a camada HTML do traço se transforma; o SVG não precisa ser repintado a cada quadro. Não há animação de layout, filtros, rolagem sequestrada ou loops. Sem GSAP/JavaScript, todo conteúdo continua visível. O movimento reduzido responde também a mudanças feitas durante a navegação. A barra de leitura usa fallback por transform nas páginas internas e ao mudar a preferência de movimento.

Direção técnica: skills `gsap-web`, `svg-animation`, `accessible-animation` e `60fps-animation` de https://github.com/iart-ai/web-animation-skills (referência `b6dba3eb759726845a44163ff0bad70dd9e7fbb6`). Biblioteca oficial: https://www.npmjs.com/package/gsap/v/3.15.0, sujeita à licença https://gsap.com/standard-license (aviso de copyright preservado no arquivo distribuído).

Verificação: `node tests/visual-motion.cjs`. Para inspecionar quadros determinísticos: `?t=0`, `?t=0.7`, `?t=2`; `?reduce=1` força a variante reduzida. O parâmetro é opcional e não afeta links de atendimento. Os demais serviços e a simulação mantêm suas verificações anteriores.

## Acabamento do guia de movimento — 20/10/2026

`acabamento.css` e `acabamento.js` aplicam o guia aprovado sem trocar a tecnologia ou instalar bibliotecas. A abertura usa tipografia maior, painéis geométricos e um recorte WebP transparente da família, com todos os integrantes dentro do enquadramento. Texto e legenda ficam fora da imagem.

Os títulos das seções entram uma única vez com deslocamento de 12px, sem ocultar permanentemente conteúdo. Os cards ganham uma luz discreta acompanhando o mouse e contorno equivalente ao focar links pelo teclado. No toque e com movimento reduzido, não há rastreamento do cursor.

No rodapé, partículas em Canvas 2D formam LEGATTO em 1,5s e terminam em texto HTML nítido. O efeito pausa fora da tela ou com a aba oculta, limita partículas/DPR e não mantém loop após concluir. Não foram adicionados React, Three.js, Motion ou Lenis. O GSAP local existente cuida das entradas; sem ele, o conteúdo segue visível.

A família tem entrada própria de 1,25s quando pelo menos 20% do palco ficam visíveis. Um invólucro separado responde ao cursor e à rolagem, inclusive em telas de toque, sem disputar o transform da entrada. A foto não perde opacidade e o fade antigo do banner não a oculta. O movimento é limitado ao espaço de segurança da composição, para na redução de movimento e não mantém renderização contínua. Regressão específica: `node tests/family-motion.cjs`.

Teste: `node tests/guide-effects.cjs`; `TEST_DIST=1` valida a saída de produção e `SITE_TEST_URL` aceita o endereço publicado. O teste cobre pixels realmente desenhados, pausa/conclusão das partículas, foco, toque, teclado, movimento reduzido e enquadramento responsivo. Detalhes do ativo e do prompt: [docs/movement-guide.md](docs/movement-guide.md).

## Decisões de conteúdo

- Experiência do fundador e posicionamento consultivo vêm do briefing do responsável.
- As imagens de contexto são ilustrativas. Não representam clientes ou casos reais.
- Logos são referências de mercado, não comprovação de parcerias.
- Depoimentos, CNPJ, registro profissional, endereço, horário e vídeo real só devem ser adicionados quando fornecidos e confirmados.
- Analytics e pixels permanecem desativados por decisão do responsável. Plano da segunda etapa em `docs/measurement.md`.
- A simulação Sobreviva ao Mês funciona localmente, sem cadastro de contato e sem POST para API. O usuário decide quando abrir o WhatsApp.

## Fontes dos logos

Arquivos públicos de cabeçalhos oficiais, consultados em 13/10/2026:

- Hapvida: https://www2.hapvida.com.br/
- Amil: https://institucional.amil.com.br/
- SulAmérica: https://portal.sulamericaseguros.com.br/
- Bradesco Seguros: https://www.bradescoseguros.com.br/clientes
- Porto: https://www.portoseguro.com.br/
- Zurich Santander: https://www.zurich-santander.com.br/

Bradesco Saúde, Unimed Nacional e BB Seguros permanecem textuais: não foi obtido arquivo inequívoco nas consultas. Não substituir seus logos por marcas de grupos diferentes.

## Montagem — 28/10/2026

Aplicação da skill scroll-craft. Briefing, curva de sentimento e pico em `scrollcraft/builds/legatto-home/BRIEF.md`; registro em `scrollcraft/FINGERPRINTS.md`.

- **Hero em planos:** a palavra "história" (`.hero-word`, decorativa, `aria-hidden`) fica entre o painel e a família. Ao rolar, o painel desce e a palavra sobe em ritmos diferentes; a família mantém o movimento já testado.
- **O pico, "a vida se monta":** dentro de `.protection-journey`, quatro fotos de contexto começam soltas e inclinadas e se encaixam num quadro só enquanto a seção fica parada na tela (`position: sticky`, 260vh no desktop, 220vh no celular). A segunda linha do título acende no encaixe. As fotos mantêm a proporção 3:2 sem corte. Só `transform` e `opacity` via variáveis CSS, um quadro por `requestAnimationFrame`, nada roda fora da tela.
- **Monte sua conversa:** em "O que pede atenção hoje?" as prioridades agora se somam. Cada escolha vira miniatura e linha de um rascunho visível, e o link do WhatsApp abre exatamente esse texto. Com uma escolha só, a mensagem é a mesma de antes. URL e `sessionStorage` guardam a lista separada por vírgula.
- **Sem movimento:** com movimento reduzido, sem JavaScript ou quando o conteúdo não cabe na altura da tela (ex.: 320×568), o quadro aparece montado e a seção tem altura normal.

Arquivos: `montagem.css`, `montagem.js` (incluídos no build). Verificação: todos os testes existentes; `tests/pages-browser.cjs` pede o build com `SITE_URL` do GitHub Pages.
