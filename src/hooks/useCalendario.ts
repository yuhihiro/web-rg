import { useState, useEffect } from 'react';
import { CONFIG } from '../config/config';
import { obterDiasDisponiveis } from '../utils/dateUtils';
import { useConfig } from './useConfig';

export const useCalendario = () => {
  const [mesAtual, setMesAtual] = useState<Date>(new Date());
  const [diasDisponiveis, setDiasDisponiveis] = useState<string[]>([]);
  const { config } = useConfig();

  useEffect(() => {
    atualizarDiasDisponiveis();
  }, [mesAtual, config.feriados, config.regrasDatas, config.horariosAtendimento]);

  const atualizarDiasDisponiveis = () => {
    const dias = obterDiasDisponiveis(
      mesAtual,
      CONFIG.DIAS_ANTECEDENCIA_MINIMA,
      CONFIG.DIAS_ANTECEDENCIA_MAXIMA,
      config.feriados,
      config.horariosAtendimento
    );
    const regras = Object.keys(config.regrasDatas || {});

    // Alteração: O sistema agora opera SEMPRE em modo manual (whitelist) ou restritivo.
    // Se houver regras, apenas essas datas são mostradas (respeitando a janela de antecedência).
    // Se não houver regras, NENHUMA data é mostrada.
    if (regras.length > 0) {
      // Filtra as regras para garantir que estão dentro da janela permitida (futuro)
      // Usamos a lista 'dias' apenas como referência de janela válida se quisermos ser estritos com feriados/fds,
      // mas para dar controle total ao admin, vamos permitir qualquer data configurada que esteja na janela de tempo.
      
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      
      const datasValidas = regras.filter(dataString => {
         // Cria data compensando fuso se necessário, ou assumindo string YYYY-MM-DD
         const [ano, mes, dia] = dataString.split('-').map(Number);
         const data = new Date(ano, mes - 1, dia);
         
         const diffTime = data.getTime() - hoje.getTime();
         const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
         
         return diffDays >= CONFIG.DIAS_ANTECEDENCIA_MINIMA && 
                diffDays <= CONFIG.DIAS_ANTECEDENCIA_MAXIMA;
      });

      setDiasDisponiveis(datasValidas);
    } else {
      // Nenhuma regra configurada = Nenhuma data disponível
      setDiasDisponiveis([]);
    }
  };

  const mudarMes = (direcao: 'anterior' | 'proximo') => {
    const novoMes = new Date(mesAtual);
    if (direcao === 'anterior') {
      novoMes.setMonth(mesAtual.getMonth() - 1);
    } else {
      novoMes.setMonth(mesAtual.getMonth() + 1);
    }
    setMesAtual(novoMes);
  };

  const obterDiasDoMes = (): Date[] => {
    const ano = mesAtual.getFullYear();
    const mes = mesAtual.getMonth();
    const primeiroDia = new Date(ano, mes, 1);
    const ultimoDia = new Date(ano, mes + 1, 0);
    
    const dias: Date[] = [];
    
    // Adicionar dias do mês anterior para preencher a semana
    const diaDaSemana = primeiroDia.getDay();
    for (let i = diaDaSemana; i > 0; i--) {
      const dia = new Date(primeiroDia);
      dia.setDate(dia.getDate() - i);
      dias.push(dia);
    }
    
    // Adicionar dias do mês atual
    for (let dia = 1; dia <= ultimoDia.getDate(); dia++) {
      dias.push(new Date(ano, mes, dia));
    }
    
    // Adicionar dias do próximo mês para completar a grade
    const diasRestantes = 42 - dias.length;
    for (let dia = 1; dia <= diasRestantes; dia++) {
      dias.push(new Date(ano, mes + 1, dia));
    }
    
    return dias;
  };

  const ehDiaDisponivel = (data: Date): boolean => {
    const dataString = data.toISOString().split('T')[0];
    return diasDisponiveis.includes(dataString);
  };

  const ehDiaPassado = (data: Date): boolean => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    return data < hoje;
  };

  const ehFimDeSemana = (data: Date): boolean => {
    return data.getDay() === 0 || data.getDay() === 6;
  };

  return {
    mesAtual,
    diasDisponiveis,
    mudarMes,
    obterDiasDoMes,
    ehDiaDisponivel,
    ehDiaPassado,
    ehFimDeSemana
  };
};
