import { CONFIG } from '../config/config';

export const formatarData = (dataString: string): string => {
  const data = new Date(dataString);
  return data.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

export const formatarDataExtenso = (dataString: string): string => {
  const data = new Date(dataString);
  return data.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
};

export const obterDiasDisponiveis = (
  mesAtual: Date, 
  diasAntecedenciaMinima: number, 
  diasAntecedenciaMaxima: number,
  feriados: string[] = [...CONFIG.FERIADOS],
  horariosAtendimento?: string[]
): string[] => {
  // Se horários de atendimento forem passados e estiverem vazios, nenhum dia está disponível
  if (horariosAtendimento !== undefined && horariosAtendimento.length === 0) {
    return [];
  }

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  
  const dataInicial = new Date(hoje);
  dataInicial.setDate(hoje.getDate() + diasAntecedenciaMinima);
  
  const dataFinal = new Date(hoje);
  dataFinal.setDate(hoje.getDate() + diasAntecedenciaMaxima);
  
  const diasDisponiveis: string[] = [];
  let dataAtual = new Date(dataInicial);
  
  while (dataAtual <= dataFinal) {
    const dataString = dataAtual.toISOString().split('T')[0];
    
    // Regra: Dias úteis (Segunda a Sábado) - Domingo (0) bloqueado
    // E a data não pode estar na lista de feriados
    const diaSemana = dataAtual.getDay();
    if (diaSemana !== 0 && !feriados.includes(dataString)) {
      diasDisponiveis.push(dataString);
    }
    
    dataAtual.setDate(dataAtual.getDate() + 1);
  }
  
  return diasDisponiveis;
};

export const obterHorariosDisponiveis = (data: string, agendamentosExistentes: number, limiteVagas: number): string[] => {
  if (agendamentosExistentes >= limiteVagas) {
    return [];
  }
  
  const horarios = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '13:30', '14:00', '14:30', '15:00',
    '15:30', '16:00', '16:30'
  ];
  
  const vagasRestantes = limiteVagas - agendamentosExistentes;
  return horarios.slice(0, Math.min(vagasRestantes, horarios.length));
};