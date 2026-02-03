import { useState, useEffect } from 'react';
import type { Agendamento } from '../types';
import { CONFIG } from '../config/config';
import { db } from '../services/firebase';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  onSnapshot, 
  query, 
  orderBy, 
  runTransaction,
  setDoc,
  getDoc
} from 'firebase/firestore';

const AGENDAMENTOS_COLLECTION = 'agendamentos';
const COUNTERS_COLLECTION = 'counters';
const COUNTER_DOC_ID = 'geral';

export const useAgendamentos = () => {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [senhaAtual, setSenhaAtual] = useState<number>(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Escutar agendamentos em tempo real
    // Removido orderBy composto para evitar erro de índice inexistente no Firestore
    const q = query(collection(db, AGENDAMENTOS_COLLECTION));
    const unsubscribeAgendamentos = onSnapshot(q, (snapshot) => {
      const dados = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      })) as Agendamento[];
      
      // Ordenação no cliente (mais seguro para evitar erros de índice)
      dados.sort((a, b) => {
        if (a.dataAgendamento !== b.dataAgendamento) {
          return a.dataAgendamento.localeCompare(b.dataAgendamento);
        }
        return a.horario.localeCompare(b.horario);
      });

      setAgendamentos(dados);
      setLoading(false);
    }, (error) => {
      console.error("Erro ao carregar agendamentos:", error);
      setLoading(false);
    });

    // Escutar contador de senhas
    const unsubscribeCounter = onSnapshot(doc(db, COUNTERS_COLLECTION, COUNTER_DOC_ID), (docSnap) => {
      if (docSnap.exists()) {
        setSenhaAtual(docSnap.data().senhaAtual);
      } else {
        // Inicializa contador se não existir
        setDoc(doc(db, COUNTERS_COLLECTION, COUNTER_DOC_ID), { senhaAtual: 1 });
        setSenhaAtual(1);
      }
    });

    return () => {
      unsubscribeAgendamentos();
      unsubscribeCounter();
    };
  }, []);

  const salvarAgendamento = async (agendamento: Agendamento) => {
    try {
      let agendamentoSalvo: Agendamento | null = null;

      await runTransaction(db, async (transaction) => {
        // 1. Obter a senha atual mais recente
        const counterRef = doc(db, COUNTERS_COLLECTION, COUNTER_DOC_ID);
        const counterDoc = await transaction.get(counterRef);
        
        let novaSenha = 1;
        if (counterDoc.exists()) {
          const current = counterDoc.data().senhaAtual;
          novaSenha = current >= CONFIG.SENHA_MAXIMA ? 1 : current + 1;
        }

        // 2. Preparar o novo agendamento com a senha correta
        const novoAgendamento = {
          ...agendamento,
          senha: novaSenha
        };

        // 3. Criar referência para o novo documento
        const newAgendamentoRef = doc(collection(db, AGENDAMENTOS_COLLECTION));
        
        // 4. Executar as escritas (novo agendamento e atualização da senha)
        transaction.set(newAgendamentoRef, novoAgendamento);
        transaction.set(counterRef, { senhaAtual: novaSenha });

        agendamentoSalvo = { ...novoAgendamento, id: newAgendamentoRef.id };
      });

      return agendamentoSalvo!;
    } catch (error) {
      console.error('Erro ao salvar agendamento:', error);
      throw error;
    }
  };

  const obterAgendamentosPorData = (data: string): Agendamento[] => {
    return agendamentos.filter(agendamento => agendamento.dataAgendamento === data);
  };

  const contarAgendamentosPorHorario = (data: string, horario: string): number => {
    return agendamentos.filter(a => a.dataAgendamento === data && a.horario === horario).length;
  };

  const verificarDisponibilidade = (data: string): boolean => {
    const agendamentosDoDia = obterAgendamentosPorData(data);
    return agendamentosDoDia.length < CONFIG.LIMITE_VAGAS_POR_DIA;
  };

  const verificarAgendamentoExistente = (cpf: string): boolean => {
    const cpfLimpo = cpf.replace(/\D/g, '');
    return agendamentos.some(agendamento => {
      const agendamentoCpfLimpo = agendamento.cpf.replace(/\D/g, '');
      return agendamentoCpfLimpo === cpfLimpo;
    });
  };

  const obterVagasRestantes = (data: string): number => {
    const agendamentosDoDia = obterAgendamentosPorData(data);
    return CONFIG.LIMITE_VAGAS_POR_DIA - agendamentosDoDia.length;
  };

  const gerarProximaSenha = (): number => {
    return senhaAtual;
  };

  const toggleCompareceu = async (id: string) => {
    try {
      const agendamento = agendamentos.find(a => a.id === id);
      if (agendamento) {
        const agendamentoRef = doc(db, AGENDAMENTOS_COLLECTION, id);
        await updateDoc(agendamentoRef, {
          compareceu: !agendamento.compareceu
        });
      }
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
    }
  };

  return {
    agendamentos,
    senhaAtual,
    salvarAgendamento,
    obterAgendamentosPorData,
    contarAgendamentosPorHorario,
    verificarDisponibilidade,
    verificarAgendamentoExistente,
    obterVagasRestantes,
    gerarProximaSenha,
    toggleCompareceu,
    loading
  };
};
