# Legatto: fechamento da reformulação editorial

Revisão do PR #2, branch `feature/legatto-editorial-scrollcraft-v2`, em 28/10/2026.
Escopo autorizado: concluir a reformulação, validar e integrar na main para publicar no GitHub Pages.

## Resultado e correções

- Preservados marca, fotografias existentes, seis serviços, telefone, fundador e conteúdo factual.
- Mantida a gramática editorial por capítulos e a montagem das quatro fotografias como pico da experiência. Esta é uma revisão da home registrada em `scrollcraft/FINGERPRINTS.md`, com o mesmo movimento assinatura, não uma nova proposta visual.
- Corrigida a sobreposição da barra de capítulos com o cabeçalho. A montagem calcula o espaço disponível abaixo das duas barras; em telas baixas, apresenta a composição estática completa.
- Filtros acessíveis por teclado, com contagem para leitores de tela e todos os botões disponíveis no celular. Links para uma solução oculta restauram sua visibilidade e direcionam o foco.
- O perfil escolhido no hero atualiza o diagnóstico. As seis combinações de perfil e momento geram mensagens coerentes para o WhatsApp. Nenhuma mensagem é enviada automaticamente.
- Corrigidas as dimensões declaradas da foto antecipada do fundador, evitando deslocamento durante carregamento e rolagem até as soluções.
- Sem JavaScript, todas as soluções e os contatos diretos permanecem disponíveis. Controles que dependem de script só aparecem quando inicializados.
- O teste do build verifica que cada CSS e JavaScript local referenciado pela home foi copiado para o pacote e corresponde à fonte atual.

## Jornada, movimento e leitura visual

| Trecho | Dispositivo | Sentimento observado |
|---|---|---|
| Abertura | Família em planos e profundidade contida | Reconhecimento |
| Fundador | Fotografia e texto em fluxo | Confiança |
| Manifesto | Contraste e escala editorial | Reflexão |
| Montagem | Quatro fotos convergem ao rolar | Conexão, pico da página |
| Soluções e método | Filtros, cartões e sequência de passos | Clareza |
| Prioridades | Seleções somáveis compõem o rascunho do WhatsApp | Participação |
| Contato | Diagnóstico e chamada final estável | Decisão calma |

A leitura visual mantém a curva do briefing existente. O título da montagem passou a permanecer legível também antes do encaixe; cabeçalho e capítulos deixam as fotos livres em seus estados intermediários. Não foram gerados novos assets nem adicionadas bibliotecas de produção.

## Verificação reproduzível

1. `node tests/build-hosting.cjs`
2. `SITE_URL=https://rodneyberthault27-lgtm.github.io/legatto-site node scripts/build-static.cjs` (definir a variável conforme o terminal).
3. `node tests/editorial-v2.cjs`
4. Suíte existente: `pages-browser`, `game-privacy`, `guide-effects`, `hero-typography`, `family-motion`, `service-pages`, `seguro-auto`, `visual-motion` em `tests/*.cjs`.

O teste editorial usa o pacote `dist` no caminho `/legatto-site/`, em 1440×1000, 1024×768, 390×844, 360×640 e 320×640, com movimento normal e reduzido. Exercita filtros por teclado, destinos após filtros, seis mensagens do diagnóstico, encaixe das fotos, barras fixas, menu/Escape, erros de JavaScript e arquivos locais. Inclui fallback sem JavaScript. `QA_OUTPUT` habilita as capturas e `SITE_TEST_URL` permite repetir contra o endereço publicado. Requer Playwright e Chrome; `CHROME_PATH` permite escolher o executável.

O carregamento sem a biblioteca de animação, a recuperação de página em cache, o movimento da família após imagem lenta, as seis páginas de serviço, FAQ, prioridades, privacidade do jogo, metadados e página 404 são cobertos pela suíte existente. A tipografia foi verificada em 14 larguras de 320 a 1920 pixels.

Limites: versões de celular verificadas por emulação no Chrome, sem teste em aparelho físico; não há certificação integral de leitor de telas. Os links e textos do WhatsApp foram conferidos sem enviar mensagens.
