import React, { useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Header } from '../components/Layout/Header';
import { Footer } from '../components/Layout/Footer';
import { FormularioAgendamento } from '../components/Formulario/FormularioAgendamento';
import { useAgendamentos } from '../hooks/useAgendamentos';
import type { Agendamento } from '../types';
import { TransicaoPagina } from '../components/Animacoes/TransicaoPagina';
import { useConfig } from '../hooks/useConfig';
import { AlertCircle, X } from 'lucide-react';

export const Confirmacao: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { salvarAgendamento, gerarProximaSenha, verificarAgendamentoExistente, contarAgendamentosPorHorario } = useAgendamentos();
  const { config } = useConfig();
  const [erro, setErro] = useState<string | null>(null);
  
  // Tenta pegar do state (legado) ou do query param (novo)
  const dataSelecionada = location.state?.dataSelecionada || searchParams.get('data');
  const horarioSelecionado = location.state?.horarioSelecionado || searchParams.get('horario');

  if (!dataSelecionada) {
    navigate('/');
    return null;
  }

  const handleConfirmar = async (dados: Omit<Agendamento, 'id' | 'senha' | 'horario'>) => {
    try {
      // Verifica se já existe agendamento para este CPF
      if (verificarAgendamentoExistente(dados.cpf)) {
        setErro('Já existe um agendamento realizado para este CPF. Por favor, verifique seus dados ou entre em contato com o suporte.');
        return;
      }

      if (!horarioSelecionado) {
        setErro('Horário não selecionado. Por favor, inicie o agendamento novamente.');
        setTimeout(() => navigate('/'), 3000);
        return;
      }
      
      const capacidade = config.capacidadePorHorario?.[horarioSelecionado];
      if (capacidade !== undefined) {
        const ocupacao = contarAgendamentosPorHorario(dataSelecionada, horarioSelecionado);
        if (ocupacao >= capacidade) {
          setErro('Este horário acabou de ser preenchido. Por favor, escolha outro horário disponível.');
          setTimeout(() => navigate('/'), 3000);
          return;
        }
      }

      const senha = gerarProximaSenha();
      
      const agendamento: Agendamento = {
        ...dados,
        id: `agendamento_${Date.now()}`,
        senha,
        horario: horarioSelecionado,
        dataAgendamento: dataSelecionada
      };

      // Enviar para o backend (PostgreSQL)
      try {
        const response = await fetch('http://localhost:3001/usuarios', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            nome: dados.nome,
            email: dados.email,
            cpf: dados.cpf,
            dataNascimento: dados.dataNascimento,
            telefone: dados.telefone
          }),
        });

        if (!response.ok) {
          console.error('Erro ao salvar no banco de dados:', await response.text());
          // Não vamos bloquear o fluxo se o banco falhar, pois o LocalStorage ainda funciona
          // Mas em produção idealmente deveríamos tratar isso
        } else {
          console.log('Usuário salvo no banco com sucesso!');
        }
      } catch (dbError) {
        console.error('Erro de conexão com o backend:', dbError);
      }

      salvarAgendamento(agendamento);
      
      navigate('/sucesso', { 
        state: { 
          agendamento,
          dataFormatada: new Date(dataSelecionada).toLocaleDateString('pt-BR')
        } 
      });
    } catch (error) {
      console.error('Erro ao salvar agendamento:', error);
      setErro('Ocorreu um erro ao processar seu agendamento. Por favor, tente novamente.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-600 to-blue-600">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <TransicaoPagina>
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-4">Confirmação de Agendamento</h1>
            <p className="text-blue-100">Preencha seus dados para confirmar o agendamento</p>
          </div>

          <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-6 mb-8">
            <div className="flex flex-col md:flex-row justify-center items-center gap-6 text-white">
              <div className="text-center">
                <h2 className="text-xl font-bold mb-2">Data Selecionada</h2>
                <p className="text-2xl font-bold">{new Date(dataSelecionada).toLocaleDateString('pt-BR', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</p>
              </div>
              
              {horarioSelecionado && (
                <>
                  <div className="hidden md:block w-px h-16 bg-white/30"></div>
                  <div className="text-center">
                    <h2 className="text-xl font-bold mb-2">Horário</h2>
                    <p className="text-2xl font-bold">{horarioSelecionado}</p>
                  </div>
                </>
              )}
            </div>
          </div>

          <FormularioAgendamento 
            dataSelecionada={dataSelecionada}
            aoConfirmar={handleConfirmar}
          />
        </TransicaoPagina>
      </main>
      
      <Footer />

      {/* Modal de Erro UI/UX */}
      {erro && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative animate-scaleIn transform transition-all">
            <button 
              onClick={() => setErro(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors p-1 hover:bg-slate-100 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4 ring-4 ring-red-50/50">
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
              
              <h3 className="text-xl font-bold text-slate-800 mb-2">Atenção!</h3>
              <p className="text-slate-600 mb-6 leading-relaxed">{erro}</p>
              
              <button
                onClick={() => setErro(null)}
                className="w-full bg-red-500 text-white py-3.5 rounded-xl font-bold hover:bg-red-600 transition-all shadow-lg shadow-red-200 active:scale-[0.98]"
              >
                Entendi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
