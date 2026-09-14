import { createContext, useContext } from "react";
export const Language = createContext("pt");
export function useT() {
  const lang = useContext(Language);
  return (pt, en) => (lang === "en" ? en : pt);
}
export const labels = {
  owner: ["Proprietário", "Owner"],
  professional: ["Profissional de saúde", "Healthcare professional"],
  reception: ["Recepção", "Reception"],
  readonly: ["Consulta administrativa", "Administrative read-only"],
  active: ["Ativo", "Active"],
  inactive: ["Inativo", "Inactive"],
  suspended: ["Suspenso", "Suspended"],
  invited: ["Convidado", "Invited"],
  scheduled: ["Agendado", "Scheduled"],
  confirmed: ["Confirmado", "Confirmed"],
  waiting: ["Aguardando", "Waiting"],
  in_consultation: ["Em atendimento", "In consultation"],
  completed: ["Concluído", "Completed"],
  cancelled: ["Cancelado", "Cancelled"],
  no_show: ["Faltou", "No-show"],
  rescheduled: ["Reagendado", "Rescheduled"],
  pending: ["Pendente", "Pending"],
  done: ["Concluída", "Done"],
  normal: ["Normal", "Normal"],
  high: ["Alta", "High"],
  assessment: ["Avaliação estética", "Aesthetic assessment"],
  anamnesis: ["Anamnese", "Health history"],
  plan: ["Plano de tratamento", "Treatment plan"],
  consultation: ["Atendimento", "Consultation"],
  evolution: ["Evolução / intercorrência", "Evolution / adverse event"],
  note: ["Anotação clínica", "Clinical note"],
  consent: ["Consentimento", "Consent"],
  alert: ["Alerta clínico", "Clinical alert"],
  draft: ["Rascunho", "Draft"],
  final: ["Finalizado", "Finalized"],
  new: ["Novo", "New"],
  reviewing: ["Em análise", "Under review"],
  contacted: ["Contatado", "Contacted"],
  converted: ["Convertido", "Converted"],
  closed: ["Encerrado", "Closed"],
  accepted: ["Aceito pelo serviço de email", "Accepted by email service"],
  failed: ["Falha", "Failed"],
  unknown: ["Envio não confirmado", "Send unconfirmed"],
  document: ["Documento", "Document"],
  photo: ["Fotografia clínica", "Clinical photograph"],
  exam: ["Exame", "Examination"],
};
export const label = (value, t) =>
  labels[value] ? t(...labels[value]) : value;
