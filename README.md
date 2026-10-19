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
