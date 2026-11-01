# Inventário de campos do formulário

Inventário estático e campos acrescentados por `js/public-intake.js`. Respostas originais preservadas sem substituir a avaliação profissional.

| Campo | Apresentação | Persistência | Exportação |
|---|---|---|---|
| `idioma_formulario` | Idioma do formulário | public_intakes.payload | QuestionnaireResponse + complemento |
| `versao_documento` | Versão do documento | public_intakes.payload | QuestionnaireResponse + complemento |
| `initial_acknowledgement` | Li e compreendi que este formulário e prévio e complementar, não substitui avaliação presencial e que o procedimento poderá ser confirmado, adaptado, adiado, interrompido ou contraindicado por segurança. | public_intakes.payload | QuestionnaireResponse + complemento |
| `email` | E-mail | public_intakes.payload + patients (novo paciente) | QuestionnaireResponse + complemento |
| `full_name` | Nome completo | public_intakes.payload + patients (novo paciente) | QuestionnaireResponse + complemento |
| `preferred_name` | Como gostaria de ser chamado(a) | public_intakes.payload + patients (novo paciente) | QuestionnaireResponse + complemento |
| `cpf` | CPF | public_intakes.payload + patients (novo paciente) | QuestionnaireResponse + complemento |
| `identity_document` | Número do documento | public_intakes.payload + patients (novo paciente) | QuestionnaireResponse + complemento |
| `identity_issuer` | Emissor | public_intakes.payload + patients (novo paciente) | QuestionnaireResponse + complemento |
| `identity_letter` | Letra / complemento | public_intakes.payload + patients (novo paciente) | QuestionnaireResponse + complemento |
| `phone` | Telefone / WhatsApp | public_intakes.payload + patients (novo paciente) | QuestionnaireResponse + complemento |
| `birth_date` | Data de nascimento | public_intakes.payload + patients (novo paciente) | QuestionnaireResponse + complemento |
| `address` | Endereço com CEP | public_intakes.payload + patients (novo paciente) | QuestionnaireResponse + complemento |
| `adult_status` | Você e maior de 18 anos? | public_intakes.payload | QuestionnaireResponse + complemento |
| `guardian_details` | Dados do responsável legal, se aplicável | public_intakes.payload + patients (novo paciente) | QuestionnaireResponse + complemento |
| `identity_upload` | Upload de documento de identidade | public_intake_files + intake-private | DocumentReference + complemento |
| `booking_fee_acknowledgement` | Li e compreendi a política de taxa de agendamento de 30%, cancelamento, remarcação, atraso e no-show. | public_intakes.payload | QuestionnaireResponse + complemento |
| `booking_payment_receipt` | Comprovante de pagamento da taxa de agendamento | public_intake_files + intake-private | DocumentReference + complemento |
| `treatment_área` | Área ou região do corpo a ser tratada | public_intakes.payload | QuestionnaireResponse + complemento |
| `appointment_date` | Data combinada para atendimento | public_intakes.payload | QuestionnaireResponse + complemento |
| `appointment_time` | Horário combinado | public_intakes.payload | QuestionnaireResponse + complemento |
| `selected_procedures` | Procedimentos selecionados | public_intakes.payload | QuestionnaireResponse + complemento |
| `accepted_term_enzimas` | Consentimento para enzimas | public_intakes.payload | QuestionnaireResponse + complemento |
| `accepted_term_harmony` | Consentimento para Harmony | public_intakes.payload | QuestionnaireResponse + complemento |
| `accepted_term_lightsheer` | Consentimento para LightSheer | public_intakes.payload | QuestionnaireResponse + complemento |
| `accepted_term_toxina` | Consentimento para toxina botulínica | public_intakes.payload | QuestionnaireResponse + complemento |
| `accepted_term_co2` | Consentimento para laser de CO₂ | public_intakes.payload | QuestionnaireResponse + complemento |
| `accepted_term_ultraformer` | Consentimento para Ultraformer | public_intakes.payload | QuestionnaireResponse + complemento |
| `accepted_term_radiofrequencia` | Consentimento para radiofrequência | public_intakes.payload | QuestionnaireResponse + complemento |
| `accepted_term_plasma` | Consentimento para jato de plasma | public_intakes.payload | QuestionnaireResponse + complemento |
| `accepted_term_mmp_capilar` | Consentimento para MMP capilar | public_intakes.payload | QuestionnaireResponse + complemento |
| `accepted_term_mmp_pele` | Consentimento para MMP da pele | public_intakes.payload | QuestionnaireResponse + complemento |
| `accepted_term_peim` | Consentimento para PEIM | public_intakes.payload | QuestionnaireResponse + complemento |
| `accepted_term_peeling_mecanico` | Consentimento para peeling mecânico | public_intakes.payload | QuestionnaireResponse + complemento |
| `accepted_term_peeling_quimico` | Consentimento para peeling químico | public_intakes.payload | QuestionnaireResponse + complemento |
| `health_notes` | Alergia, condição de saúde, medicamento ou situação importante | public_intakes.payload | QuestionnaireResponse + complemento |
| `general_risk_acknowledgement` | Li e compreendi os riscos gerais, limitações, ausência de garantia de resultado e responsabilidade de seguir orientações pre e pós-procedimento. | public_intakes.payload | QuestionnaireResponse + complemento |
| `truth_declaration` | Declaro que as informações prestadas são verdadeiras e que não omiti informações relevantes a minha segurança. | public_intakes.payload | QuestionnaireResponse + complemento |
| `technical_image_authorisation` | Registro técnico do procedimento | public_intakes.payload | QuestionnaireResponse + complemento |
| `marketing_image_authorisation` | Uso de imagem em marketing e redes sociais | public_intakes.payload | QuestionnaireResponse + complemento |
| `marketing_revocation_acknowledgement` | Compreendo que posso revogar autorização para novas publicações por escrito ao canal oficial. | public_intakes.payload | QuestionnaireResponse + complemento |
| `lgpd_personal_data_consent` | Li e concordo com o tratamento dos meus dados pessoais para identificação, agendamento, atendimento, comunicação, cobrança, registro de consentimento e obrigações legais/profissionais. | public_intakes.payload | QuestionnaireResponse + complemento |
| `lgpd_sensitive_data_consent` | Autorizo, de forma específica e destacada, o tratamento de dados relacionados ao procedimento estético, imagens da área tratada e informações de saúde que eu voluntariamente informar. | public_intakes.payload | QuestionnaireResponse + complemento |
| `promotional_communication` | Comunicação promocional | public_intakes.payload | QuestionnaireResponse + complemento |
| `final_acceptance` | Declaro que li, compreendi e aceito os termos, condições, consentimentos e autorizações selecionados neste formulário. | public_intakes.payload | QuestionnaireResponse + complemento |
| `postal_code` | CEP | public_intakes.payload + patients (novo paciente) | QuestionnaireResponse + complemento |
| `supporting_attachments` | Documentos adicionais | public_intake_files + intake-private | DocumentReference + complemento |
| `form_version` | Versão do formulário | public_intakes.payload | QuestionnaireResponse + complemento |
| `language` | Idioma | public_intakes.payload | QuestionnaireResponse + complemento |
| `selected_procedure` | Procedimentos selecionados (descrição) | public_intakes.payload | QuestionnaireResponse + complemento |

Consentimentos condicionais adicionais são gerados em tempo de execução para os procedimentos do catálogo. O formulário atual não coleta assinatura manuscrita nem campos separados para alergias e medicamentos; `health_notes` é texto livre. Não são inferidos diagnósticos ou prescrições desse texto.

| Campo condicional | Apresentação | Persistência | Exportação |
|---|---|---|---|
| `accepted_term_peeling_ultrassonico` | Consentimento para peeling ultrassônico | public_intakes.payload (campo condicional em tempo de execução) | QuestionnaireResponse + Consent + complemento |
| `accepted_term_peeling_cristal` | Consentimento para peeling de cristal | public_intakes.payload (campo condicional em tempo de execução) | QuestionnaireResponse + Consent + complemento |
| `accepted_term_peeling_diamante` | Consentimento para peeling de diamante | public_intakes.payload (campo condicional em tempo de execução) | QuestionnaireResponse + Consent + complemento |
| `accepted_term_limpeza_pele` | Consentimento para limpeza de pele | public_intakes.payload (campo condicional em tempo de execução) | QuestionnaireResponse + Consent + complemento |
