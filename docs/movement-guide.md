# Aplicação do guia de movimento

Referência fornecida pelo responsável: `kit-sites-com-movimento (2).zip`. Os nove capítulos e o exemplo de spotlight foram examinados antes da implementação. A adaptação é original em HTML/CSS/JavaScript, sem copiar o componente React do exemplo. O guia foi tratado como referência visual/técnica, não como autorização para alterar conteúdos ou publicar dados.

## Decisões

- Identidade atual preservada: fundo quase preto, azul elétrico e tipografia Jost.
- Abertura: título maior, plano geométrico azul e moldura discreta atrás da família recortada. Sem texto sobre pessoas ou ampliação contínua.
- Movimento próprio da família: entrada horizontal de 28px com escala de 0,97 até 1 durante 1,25s, disparada quando pelo menos 20% do palco entram na tela. O banner pai não aplica fade sobre ela. Um invólucro separado cria profundidade ao cursor e à rolagem; deslocamento limitado a ±6px horizontal, ±4px vertical do cursor e ±6px de rolagem. Nenhuma opacidade é reduzida na foto. Observador e eventos de entrada substituem loops contínuos; os listeners de scroll/resize só permanecem ativos com o palco visível e movimento permitido.
- A entrada espera o carregamento e decode da foto, para não terminar antes de os pixels chegarem numa conexão lenta. O observador é renovado em `pageshow`, incluindo restauração por cache de navegação, e a exibição da aba reavalia a entrada pendente.
- Foto com proporção original 3:2, num palco quadrado. Apenas área transparente pode ultrapassar o palco; o teste projeta os pixels opacos para verificar que cabeça, corpo e pés cabem.
- Entradas curtas de 500ms, uma vez, com texto legível durante o efeito. Sem scroll hijacking ou mudança de layout por quadro.
- Spotlight: gradiente fixo movido por `transform`, eventos agrupados por `requestAnimationFrame`, sem processamento contínuo. Foco por teclado visível; toque e movimento reduzido sem rastreamento.
- Rodapé: Canvas 2D, semente determinística, amostragem após fontes prontas, até 400 partículas no celular/1000 no desktop e DPR de até 1,5. Uma composição de 1500ms; pausa fora da tela/aba oculta; termina no texto HTML LEGATTO, sempre presente para tecnologias assistivas.
- O site mantém os seis serviços, guias, perguntas frequentes, simulação e WhatsApp contextual. Analytics e pixels continuam desligados.
- Sem novas dependências; usa o GSAP já servido localmente e APIs nativas.

## Ativo ilustrativo

Arquivo: `assets/hero-familia-recorte.webp`, 1200 × 800, 86.784 bytes, transparência real. Derivado por geração/edição do ativo ilustrativo já autorizado no site, `assets/legatto-jornada.webp`; o original foi preservado. Não representa clientes reais, depoimento ou caso atendido. A composição usa o recorte isolado, não sobreposto ao original, para evitar duplicação de contornos.

Prompt empregado na edição:

> Use case: background-extraction. Image 1 is the EDIT TARGET, the existing authorized Legatto website family photograph. Create a precise transparent-background cutout of ONLY the father, daughter and mother holding hands. Remove all park, trees, ground, sky, fence and buildings. Preserve the same three people, identities, body proportions, poses, clothing, hands, legs and shoes. Keep the full original 3:2 landscape canvas and EXACT original positions and scale of every person; leave all negative space transparent, especially the left half. Do not center, crop, zoom, restyle or rearrange the people. Preserve natural photographic texture and original lighting. Clean hair and fabric edges, no halos, no added objects, no shadows outside the figures, no text. Actual alpha transparency. This cutout will be layered over the original photograph in a website hero.

Adaptação após inspeção: o recorte foi usado sobre planos gráficos próprios, não sobre a foto original. Conversão otimizada para WebP com alpha; sem remoção manual adicional de fundo.

## Verificação

- `node tests/guide-effects.cjs`: spotlight, foco, redução de movimento, pixels de partículas, pausa fora da tela, término sem loop, entrada única, enquadramento em 1440/768/390/320px, toque, menu e FAQ pelo teclado, HTML sem JavaScript.
- `node tests/family-motion.cjs`: entrada ao chegar à foto no celular, efeito ao cursor após a entrada, profundidade com rolagem de toque, mudança de preferência durante a animação, visibilidade real incluindo ancestrais e limites da composição com scroll/cursor combinados nas quatro larguras. O teste reproduziu a foto imóvel e o conflito do fade pai antes das correções.
- `node tests/visual-motion.cjs`: seis larguras de 320 a 1920px, composição das sete fotos, legenda externa, diagrama conectado, fallback e perfil de animação.
- `node tests/service-pages.cjs`, `node tests/seguro-auto.cjs`, `node tests/game-privacy.cjs`: funcionalidades e privacidade existentes.
- `node tests/build-hosting.cjs`: metadados, sitemap e caminhos de publicação.
- `node tests/pages-browser.cjs`: build configurado para GitHub Pages, páginas internas e 404; aceita URL pública como argumento.

Os testes de navegador usam o Playwright e Chrome já disponíveis no ambiente local; não instalam bibliotecas nem ativam medição. A revisão visual deve acompanhar os testes, especialmente após mudanças no ativo ou na tipografia.
