# BRIEF: Legatto, identidade Cobalt + Lime (01/11/2026)

**Self-authored under explicit creative delegation.** O pedido do responsável
define a paleta, as prioridades e os critérios; as decisões abaixo foram
tomadas a partir dele. Branch: `feat/identidade-cobalt-lime`.

## Diagnóstico do site atual

- Hero: título e subtítulo colados (sem respiro), título em 4 linhas, foto
  presa numa caixa, faixa de confiança quase ilegível. No celular a primeira
  dobra não mostra nenhuma imagem.
- Ritmo: 11 seções sobre o mesmo preto, mesmo azul de acento; nada muda de
  chão até o CTA final.
- Páginas de serviço usam outra identidade (claro, Playfair, dourado).
- Acento azul #2F5BEA usado para tudo (botão, link, traço): sem hierarquia.

## Paleta (tokens em `identidade.css`)

| Token | Valor | Uso |
|---|---|---|
| `--midnight` | #080B12 | base predominante |
| `--cobalt` | #2450FF | planos, áreas de destaque, estados interativos |
| `--lime` | #D6FF3F | CTA principal, gesto do hero, detalhes pontuais |
| `--branco` | #F5F7FA | texto |

Cobalto não é usado como cor de texto pequeno sobre o preto (3,4:1). Texto de
acento usa `--cobalt-claro` #8FA6FF (8,5:1).

## Hero: três momentos

1. **Abertura:** o plano cobalto entra pela direita, a família sobe, o título
   aparece e uma órbita lime se desenha em volta da família: a metade de trás
   passa atrás das pessoas, a da frente na frente (o gesto: proteção que
   envolve).
2. **Evolução na rolagem:** o texto sobe mais rápido que a página, o plano
   cobalto fica para trás (mais lento), a órbita gira e abre. Rolagem nativa,
   sem sticky.
3. **Saída:** o plano cobalto se abre até ocupar a largura toda e emenda com a
   seção seguinte, que começa em cobalto.

Celular: composição própria (título, CTA, depois a família sobre um campo
cobalto em largura total), movimentos com metade da amplitude.

## Gesto

A órbita lime: uma elipse em duas metades, atrás e na frente da família.

## Frase para contar a alguém

> É o site em que uma linha verde-limão se desenha em volta da família, e
> quando você rola, o azul toma a tela e te leva para dentro.

## HyperFrames

Avaliado e não usado: o hero já entrega o gesto em HTML/SVG leve, e um vídeo
gerado não mostraria nada real da marca que as fotos e o texto não mostrem.
