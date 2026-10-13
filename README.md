# Legatto — site institucional

Site estático em português. A home é editada em `index.html`; conteúdo das seis páginas em `data/services.cjs`; layout em `styles.css`.

## Preparar publicação

Execute `node scripts/build-static.cjs`. O resultado em `dist/` inclui os serviços, privacidade, sitemap, robots e 404. O projeto Sites permanece identificado em `.openai/hosting.json`.

Os testes de navegador estão em `tests/seguro-auto.cjs`, `tests/service-pages.cjs` e `tests/game-privacy.cjs`; usam o Playwright e o Chrome disponíveis no ambiente local de desenvolvimento. Não ativam analytics nem enviam dados de clientes.

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
