import { useState, useEffect } from 'react';
import { CONFIG } from '../config/config';
import { db } from '../services/firebase';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';

export interface Categoria {
  id: string;
  nome: string;
  idadeMin: number;
  idadeMax: number;
}

export interface RegraData {
  categoriaId: string;
  limiteVagas?: number;
}

export interface SistemaConfig {
  horariosAtendimento: string[];
  feriados: string[];
  limiteVagasPorDia: number;
  categorias: Categoria[];
  regrasDatas: Record<string, RegraData>;
  capacidadePorHorario?: Record<string, number>;
}

const CONFIG_COLLECTION = 'configuracoes';
const CONFIG_DOC_ID = 'geral';

export const useConfig = () => {
  const [config, setConfig] = useState<SistemaConfig>({
    horariosAtendimento: [...CONFIG.HORARIOS_ATENDIMENTO],
    feriados: [...CONFIG.FERIADOS],
    limiteVagasPorDia: CONFIG.LIMITE_VAGAS_POR_DIA,
    categorias: [],
    regrasDatas: {},
    capacidadePorHorario: {}
  });

  useEffect(() => {
    // Escutar atualizações em tempo real do Firebase
    const unsubscribe = onSnapshot(doc(db, CONFIG_COLLECTION, CONFIG_DOC_ID), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as SistemaConfig;
        setConfig({
          horariosAtendimento: data.horariosAtendimento || [...CONFIG.HORARIOS_ATENDIMENTO],
          feriados: data.feriados || [...CONFIG.FERIADOS],
          limiteVagasPorDia: data.limiteVagasPorDia || CONFIG.LIMITE_VAGAS_POR_DIA,
          categorias: data.categorias || [],
          regrasDatas: data.regrasDatas || {},
          capacidadePorHorario: data.capacidadePorHorario || {}
        });
      } else {
        // Se não existir, cria o documento inicial
        salvarConfiguracoes(config);
      }
    }, (error) => {
      console.error("Erro ao sincronizar configurações:", error);
    });

    return () => unsubscribe();
  }, []);

  const salvarConfiguracoes = async (novaConfig: SistemaConfig) => {
    try {
      // Atualiza localmente para feedback instantâneo
      setConfig(novaConfig);
      // Salva no Firebase
      await setDoc(doc(db, CONFIG_COLLECTION, CONFIG_DOC_ID), novaConfig);
      return true;
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      return false;
    }
  };

  const adicionarHorario = (horario: string) => {
    const novosHorarios = [...config.horariosAtendimento, horario].sort();
    const capacidadeDefault = 10;
    const novasCapacidades = { ...(config.capacidadePorHorario || {}) };
    if (!(horario in novasCapacidades)) {
      novasCapacidades[horario] = capacidadeDefault;
    }
    salvarConfiguracoes({ ...config, horariosAtendimento: novosHorarios, capacidadePorHorario: novasCapacidades });
  };

  const removerHorario = (horario: string) => {
    const novosHorarios = config.horariosAtendimento.filter(h => h !== horario);
    const novasCapacidades = { ...(config.capacidadePorHorario || {}) };
    if (horario in novasCapacidades) {
      delete novasCapacidades[horario];
    }
    salvarConfiguracoes({ ...config, horariosAtendimento: novosHorarios, capacidadePorHorario: novasCapacidades });
  };

  const adicionarFeriado = (data: string) => {
    if (!config.feriados.includes(data)) {
      const novosFeriados = [...config.feriados, data].sort();
      salvarConfiguracoes({ ...config, feriados: novosFeriados });
    }
  };

  const removerFeriado = (data: string) => {
    const novosFeriados = config.feriados.filter(f => f !== data);
    salvarConfiguracoes({ ...config, feriados: novosFeriados });
  };

  const atualizarLimiteVagas = (limite: number) => {
    salvarConfiguracoes({ ...config, limiteVagasPorDia: limite });
  };

  const salvarCategoria = (categoria: Categoria) => {
    const novasCategorias = [...config.categorias];
    const index = novasCategorias.findIndex(c => c.id === categoria.id);
    
    if (index >= 0) {
      novasCategorias[index] = categoria;
    } else {
      novasCategorias.push(categoria);
    }
    
    salvarConfiguracoes({ ...config, categorias: novasCategorias });
  };

  const removerCategoria = (id: string) => {
    const novasCategorias = config.categorias.filter(c => c.id !== id);
    // Remove também regras associadas a esta categoria
    const novasRegras = { ...config.regrasDatas };
    Object.keys(novasRegras).forEach(data => {
      if (novasRegras[data].categoriaId === id) {
        delete novasRegras[data];
      }
    });
    
    salvarConfiguracoes({ ...config, categorias: novasCategorias, regrasDatas: novasRegras });
  };

  const salvarRegraData = (data: string, regra: RegraData) => {
    const novasRegras = { ...config.regrasDatas, [data]: regra };
    salvarConfiguracoes({ ...config, regrasDatas: novasRegras });
  };

  const removerRegraData = (data: string) => {
    const novasRegras = { ...config.regrasDatas };
    delete novasRegras[data];
    salvarConfiguracoes({ ...config, regrasDatas: novasRegras });
  };

  const atualizarCapacidadeHorario = (horario: string, capacidade: number) => {
    const novasCapacidades = { ...(config.capacidadePorHorario || {}) };
    novasCapacidades[horario] = Math.max(0, Math.floor(capacidade));
    salvarConfiguracoes({ ...config, capacidadePorHorario: novasCapacidades });
  };

  return {
    config,
    adicionarHorario,
    removerHorario,
    adicionarFeriado,
    removerFeriado,
    atualizarLimiteVagas,
    salvarCategoria,
    removerCategoria,
    salvarRegraData,
    removerRegraData,
    atualizarCapacidadeHorario
  };
};
