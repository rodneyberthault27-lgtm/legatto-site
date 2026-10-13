# Plano de medição — segunda etapa

Por decisão do responsável, Analytics e pixels permanecem desativados. Não existe coleta de eventos ou envio de dados de medição nesta versão.

Quando houver uma propriedade GA4 e decisão sobre privacidade/consentimento, medir:

| Evento | Pergunta respondida | Propriedades sem dados pessoais |
| --- | --- | --- |
| service_viewed | Quais soluções despertam interesse? | service_id, page_path |
| whatsapp_clicked | Onde o visitante inicia contato? | service_id, placement |
| guide_opened | Quais conteúdos ajudam a decisão? | guide_id |
| priority_selected | Qual necessidade aparece na seleção? | priority_id |

Não registrar mensagens do WhatsApp, nomes, telefones, documentos, condições de saúde ou query strings completas. Clique não equivale a mensagem enviada, lead ou venda. Propostas e contratos devem ser acompanhados no processo comercial e correlacionados apenas com controles de privacidade apropriados.

Antes de ativar: configurar propriedade, avaliar consentimento, atualizar a informação de privacidade, testar navegação sem consentimento, duplicações e DebugView. Validar dados com o processo de atendimento antes de reportar conversões.
