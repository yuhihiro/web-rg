import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useAuth } from '../../context/AuthContext';
import { useAgendamentos } from '../../hooks/useAgendamentos';
import { useConfig } from '../../hooks/useConfig';
import { AdminCalendar } from '../../components/Admin/AdminCalendar';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Settings, 
  LogOut, 
  Users, 
  CheckSquare, 
  X, 
  Plus, 
  Trash2,
  Search,
  Menu,
  ChevronRight,
  Shield,
  UserCheck,
  AlertCircle,
  FileText,
  Tags,
  CalendarCheck
} from 'lucide-react';

type Tab = 'agendamentos' | 'configuracoes';

export const Dashboard: React.FC = () => {
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('agendamentos');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Agendamentos State
  const { obterAgendamentosPorData, toggleCompareceu, agendamentos } = useAgendamentos();
  const [dataFiltro, setDataFiltro] = useState(new Date().toISOString().split('T')[0]);
  const [mostrarTodos, setMostrarTodos] = useState(false);
  const [termoBusca, setTermoBusca] = useState('');

  // Config State
  const { 
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
  } = useConfig();
  const [novoHorario, setNovoHorario] = useState('');
  const [novoFeriado, setNovoFeriado] = useState('');
  
  // New Config State
  const [novaCategoria, setNovaCategoria] = useState({ nome: '', idadeMin: '', idadeMax: '' });
  const [novaRegraData, setNovaRegraData] = useState({ data: '', categoriaId: '' });

  // Derived State
  const agendamentosDoDia = mostrarTodos ? agendamentos : obterAgendamentosPorData(dataFiltro);
  const agendamentosFiltrados = agendamentosDoDia.filter(ag => 
    ag.nome.toLowerCase().includes(termoBusca.toLowerCase()) ||
    ag.cpf.includes(termoBusca)
  ).sort((a, b) => {
    if (mostrarTodos) {
      // Se mostrar todos, ordena por data primeiro, depois horário
      const dataA = a.dataAgendamento.split('/').reverse().join('-'); // assumindo formato YYYY-MM-DD
      const dataB = b.dataAgendamento.split('/').reverse().join('-');
      if (a.dataAgendamento !== b.dataAgendamento) return a.dataAgendamento.localeCompare(b.dataAgendamento);
    }
    return a.horario.localeCompare(b.horario);
  });

  const compareceram = agendamentosDoDia.filter(ag => ag.compareceu).length;

  const handleExportPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text(`Lista de Agendamentos - ${new Date(dataFiltro).toLocaleDateString('pt-BR')}`, 14, 15);
    
    doc.setFontSize(10);
    doc.text(`Total: ${agendamentosFiltrados.length} | Compareceram: ${compareceram}`, 14, 22);

    const tableData = agendamentosFiltrados.map(ag => [
      ag.horario,
      ag.nome,
      ag.cpf,
      ag.telefone,
      ag.senha.toString(),
      ag.compareceu ? 'Sim' : 'Não'
    ]);

    autoTable(doc, {
      head: [['Horário', 'Nome', 'CPF', 'Telefone', 'Senha', 'Compareceu']],
      body: tableData,
      startY: 25,
      headStyles: { fillColor: [41, 128, 185] },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      styles: { fontSize: 9 },
    });

    doc.save(`agendamentos_${dataFiltro}.pdf`);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-800">
      {/* Sidebar */}
      <aside 
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-slate-900 text-white flex-shrink-0 transition-all duration-300 flex flex-col fixed md:relative z-30 h-full shadow-xl`}
      >
        <div className="p-6 flex items-center justify-between border-b border-slate-800">
          {sidebarOpen ? (
            <div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">Admin RG</h2>
              <p className="text-slate-400 text-xs mt-1">Painel Gerencial</p>
            </div>
          ) : (
            <div className="mx-auto font-bold text-xl text-blue-400">RG</div>
          )}
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-slate-400 hover:text-white transition-colors md:hidden"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 mt-6 px-3 space-y-2">
          <button
            onClick={() => setActiveTab('agendamentos')}
            className={`w-full flex items-center px-4 py-3 rounded-xl transition-all duration-200 group ${
              activeTab === 'agendamentos' 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Users className={`w-5 h-5 ${sidebarOpen ? 'mr-3' : 'mx-auto'}`} />
            {sidebarOpen && <span className="font-medium">Agendamentos</span>}
            {sidebarOpen && activeTab === 'agendamentos' && <ChevronRight className="w-4 h-4 ml-auto opacity-50" />}
          </button>

          <button
            onClick={() => setActiveTab('configuracoes')}
            className={`w-full flex items-center px-4 py-3 rounded-xl transition-all duration-200 group ${
              activeTab === 'configuracoes' 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Settings className={`w-5 h-5 ${sidebarOpen ? 'mr-3' : 'mx-auto'}`} />
            {sidebarOpen && <span className="font-medium">Configurações</span>}
            {sidebarOpen && activeTab === 'configuracoes' && <ChevronRight className="w-4 h-4 ml-auto opacity-50" />}
          </button>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button
            onClick={logout}
            className={`w-full flex items-center px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors ${!sidebarOpen && 'justify-center'}`}
          >
            <LogOut className={`w-5 h-5 ${sidebarOpen ? 'mr-3' : ''}`} />
            {sidebarOpen && <span className="font-medium">Sair do Sistema</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 overflow-y-auto transition-all duration-300 ${sidebarOpen ? 'ml-0' : 'ml-0'}`}>
        <div className="p-8 max-w-7xl mx-auto">
          {activeTab === 'agendamentos' ? (
            <div className="space-y-8 animate-fadeIn">
              {/* Header Section */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                  <h1 className="text-3xl font-bold text-slate-800">Controle de Agendamentos</h1>
                  <p className="text-slate-500 mt-2">Gerencie a lista de presença diária e acompanhe o fluxo.</p>
                </div>
                
                <div className="flex items-center gap-4 bg-white p-2 pr-4 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                  <div className="bg-blue-50 p-2 rounded-xl">
                    <CalendarIcon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-slate-500 font-semibold uppercase">Data de Visualização</span>
                      <button 
                        onClick={() => setMostrarTodos(!mostrarTodos)}
                        className={`text-xs px-2 py-0.5 rounded-full transition-colors ${
                          mostrarTodos 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        }`}
                      >
                        {mostrarTodos ? 'Ver Filtro' : 'Ver Todos'}
                      </button>
                    </div>
                    {!mostrarTodos ? (
                      <input
                        type="date"
                        value={dataFiltro}
                        onChange={(e) => setDataFiltro(e.target.value)}
                        className="outline-none text-slate-700 font-medium bg-transparent cursor-pointer"
                      />
                    ) : (
                      <span className="text-slate-700 font-medium text-sm py-0.5">Exibindo todos os registros</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-md transition-all">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                  <div className="relative">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                        <Users className="w-5 h-5" />
                      </div>
                      <p className="text-slate-500 text-sm font-medium">Total Agendado</p>
                    </div>
                    <p className="text-4xl font-bold text-slate-800">{agendamentosDoDia.length}</p>
                    <p className="text-xs text-slate-400 mt-2">Para {new Date(dataFiltro).toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-md transition-all">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                  <div className="relative">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
                        <UserCheck className="w-5 h-5" />
                      </div>
                      <p className="text-slate-500 text-sm font-medium">Compareceram</p>
                    </div>
                    <p className="text-4xl font-bold text-slate-800">{compareceram}</p>
                    <div className="w-full bg-slate-100 h-1.5 mt-3 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${agendamentosDoDia.length ? (compareceram / agendamentosDoDia.length) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-md transition-all">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-orange-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                  <div className="relative">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-orange-100 rounded-lg text-orange-600">
                        <AlertCircle className="w-5 h-5" />
                      </div>
                      <p className="text-slate-500 text-sm font-medium">Pendentes</p>
                    </div>
                    <p className="text-4xl font-bold text-slate-800">{agendamentosDoDia.length - compareceram}</p>
                    <p className="text-xs text-slate-400 mt-2">Aguardando chegada</p>
                  </div>
                </div>
              </div>

              {/* Search and Table */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <h3 className="text-lg font-bold text-slate-800">Lista de Cidadãos</h3>
                    <button
                      onClick={handleExportPDF}
                      className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors text-sm font-medium border border-slate-200"
                      title="Exportar para PDF"
                    >
                      <FileText className="w-4 h-4" />
                      <span className="hidden sm:inline">Exportar PDF</span>
                    </button>
                  </div>
                  <div className="relative w-full sm:w-72">
                    <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Buscar por nome ou CPF..."
                      value={termoBusca}
                      onChange={(e) => setTermoBusca(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-sm"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-100">
                    <thead className="bg-slate-50/50">
                      <tr>
                        {mostrarTodos && (
                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Data</th>
                        )}
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Horário</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Dados do Cidadão</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Contato</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Senha</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status de Presença</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-100">
                      {agendamentosFiltrados.length === 0 ? (
                        <tr>
                          <td colSpan={mostrarTodos ? 6 : 5} className="px-6 py-12 text-center">
                            <div className="flex flex-col items-center justify-center text-slate-400">
                              <Search className="w-12 h-12 mb-3 opacity-20" />
                              <p className="text-lg font-medium">Nenhum agendamento encontrado</p>
                              <p className="text-sm">Tente mudar a data ou o termo de busca.</p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        agendamentosFiltrados.map((ag) => (
                          <tr key={ag.id} className={`transition-colors ${ag.compareceu ? 'bg-emerald-50/30' : 'hover:bg-slate-50'}`}>
                            {mostrarTodos && (
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="text-sm font-medium text-slate-700">
                                  {new Date(ag.dataAgendamento + 'T12:00:00').toLocaleDateString('pt-BR')}
                                </span>
                              </td>
                            )}
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-bold">
                                {ag.horario}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center">
                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm mr-3 shadow-md shadow-blue-200">
                                  {ag.nome.charAt(0).toUpperCase()}{ag.nome.split(' ').length > 1 ? ag.nome.split(' ')[1].charAt(0).toUpperCase() : ''}
                                </div>
                                <div>
                                  <div className="text-sm font-bold text-slate-900">{ag.nome}</div>
                                  <div className="text-xs text-slate-500 font-mono bg-slate-100 px-1.5 py-0.5 rounded mt-1 inline-block">
                                    CPF: {ag.cpf}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-slate-700">{ag.telefone}</div>
                              <div className="text-xs text-slate-400">{ag.email}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="font-mono text-sm font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded">
                                #{ag.senha}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <button
                                onClick={() => toggleCompareceu(ag.id)}
                                className={`flex items-center px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 shadow-sm ${
                                  ag.compareceu 
                                    ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 ring-2 ring-emerald-500/20' 
                                    : 'bg-white border border-slate-300 text-slate-600 hover:bg-slate-50 hover:border-slate-400'
                                }`}
                              >
                                {ag.compareceu ? (
                                  <>
                                    <CheckSquare className="w-4 h-4 mr-2" />
                                    Confirmado
                                  </>
                                ) : (
                                  <>
                                    <div className="w-4 h-4 border-2 border-slate-400 rounded mr-2"></div>
                                    Marcar Presença
                                  </>
                                )}
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-8 animate-fadeIn">
              <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-slate-800">Configurações do Sistema</h1>
                  <p className="text-slate-500 mt-2">Personalize horários, datas bloqueadas e limites de atendimento.</p>
                </div>
              </header>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Coluna 1: Horários e Feriados */}
                <div className="space-y-8">
                  {/* Horários */}
                  <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-3 bg-blue-100 rounded-xl text-blue-600">
                        <Clock className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-800">Horários de Atendimento</h3>
                        <p className="text-sm text-slate-400">Defina os horários disponíveis para agendamento</p>
                      </div>
                    </div>

                    <div className="flex gap-3 mb-6 p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <input
                        type="time"
                        value={novoHorario}
                        onChange={(e) => setNovoHorario(e.target.value)}
                        className="flex-1 bg-white border border-slate-200 rounded-lg px-4 py-2 text-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                      />
                      <button
                        onClick={() => {
                          if (novoHorario) {
                            adicionarHorario(novoHorario);
                            setNovoHorario('');
                          }
                        }}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 active:scale-95 transition-all shadow-lg shadow-blue-200"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {config.horariosAtendimento?.map((horario) => (
                        <span key={horario} className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-bold bg-white border border-slate-200 text-slate-700 shadow-sm hover:border-blue-300 transition-colors group">
                          {horario}
                          <button
                            onClick={() => removerHorario(horario)}
                            className="ml-2 text-slate-400 hover:text-red-500 transition-colors bg-slate-100 p-0.5 rounded-full"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>

                  <div className="mt-6">
                    <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                      <Users className="w-4 h-4 text-slate-500" />
                      Capacidade por Horário
                    </h4>
                    <div className="space-y-2">
                      {config.horariosAtendimento?.map((horario) => (
                        <div key={`cap_${horario}`} className="flex items-center justify-between bg-slate-50 border border-slate-100 rounded-xl px-3 py-2">
                          <span className="text-sm font-medium text-slate-700">{horario}</span>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min={0}
                              value={config.capacidadePorHorario?.[horario] ?? 0}
                              onChange={(e) => atualizarCapacidadeHorario(horario, Number(e.target.value))}
                              className="w-20 bg-white border border-slate-200 rounded-lg px-3 py-1 text-slate-700 outline-none text-sm"
                            />
                            <span className="text-xs text-slate-500">pessoas</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  </div>

                  {/* Feriados / Bloqueios */}
                  <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-3 bg-red-100 rounded-xl text-red-600">
                        <CalendarIcon className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-800">Dias Bloqueados</h3>
                        <p className="text-sm text-slate-400">Adicione feriados ou dias sem expediente</p>
                      </div>
                    </div>

                    <div className="flex gap-3 mb-6 p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <input
                        type="date"
                        value={novoFeriado}
                        onChange={(e) => setNovoFeriado(e.target.value)}
                        className="flex-1 bg-white border border-slate-200 rounded-lg px-4 py-2 text-slate-700 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all"
                      />
                      <button
                        onClick={() => {
                          if (novoFeriado) {
                            adicionarFeriado(novoFeriado);
                            setNovoFeriado('');
                          }
                        }}
                        className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 active:scale-95 transition-all shadow-lg shadow-red-200"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                      {config.feriados?.map((feriado) => (
                        <div key={feriado} className="flex justify-between items-center p-3 bg-white border border-slate-100 rounded-xl hover:border-red-200 hover:shadow-sm transition-all group">
                          <span className="text-slate-700 font-medium flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-400"></div>
                            {new Date(feriado + 'T12:00:00').toLocaleDateString('pt-BR', {
                              weekday: 'long',
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </span>
                          <button
                            onClick={() => removerFeriado(feriado)}
                            className="text-slate-400 hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Coluna 2: Gerais, Categorias e Regras */}
                <div className="space-y-8">
                  {/* Geral */}
                  <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-3 bg-purple-100 rounded-xl text-purple-600">
                        <Shield className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-800">Parâmetros Gerais</h3>
                        <p className="text-sm text-slate-400">Configurações globais do sistema</p>
                      </div>
                    </div>

                    <div className="max-w-md">
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        Limite de Vagas por Dia
                      </label>
                      <div className="flex items-center gap-4">
                        <input
                          type="number"
                          value={config.limiteVagasPorDia || 0}
                          onChange={(e) => atualizarLimiteVagas(Number(e.target.value))}
                          className="w-32 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-lg font-bold text-slate-800 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all"
                        />
                        <span className="text-slate-500 text-sm">
                          vagas disponíveis para agendamento diário
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Categorias */}
                  <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-3 bg-indigo-100 rounded-xl text-indigo-600">
                        <Tags className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-800">Categorias de Público</h3>
                        <p className="text-sm text-slate-400">Defina faixas etárias e grupos</p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 mb-6 p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <input
                        type="text"
                        placeholder="Nome (ex: Idoso, Criança)"
                        value={novaCategoria.nome}
                        onChange={(e) => setNovaCategoria({...novaCategoria, nome: e.target.value})}
                        className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2 text-slate-700 outline-none"
                      />
                      <div className="flex gap-3">
                        <input
                          type="number"
                          placeholder="Idade Mín"
                          value={novaCategoria.idadeMin}
                          onChange={(e) => setNovaCategoria({...novaCategoria, idadeMin: e.target.value})}
                          className="flex-1 bg-white border border-slate-200 rounded-lg px-4 py-2 text-slate-700 outline-none"
                        />
                        <input
                          type="number"
                          placeholder="Idade Máx"
                          value={novaCategoria.idadeMax}
                          onChange={(e) => setNovaCategoria({...novaCategoria, idadeMax: e.target.value})}
                          className="flex-1 bg-white border border-slate-200 rounded-lg px-4 py-2 text-slate-700 outline-none"
                        />
                        <button
                          onClick={() => {
                            if (novaCategoria.nome && novaCategoria.idadeMin && novaCategoria.idadeMax) {
                              salvarCategoria({
                                id: `cat_${Date.now()}`,
                                nome: novaCategoria.nome,
                                idadeMin: Number(novaCategoria.idadeMin),
                                idadeMax: Number(novaCategoria.idadeMax)
                              });
                              setNovaCategoria({ nome: '', idadeMin: '', idadeMax: '' });
                            }
                          }}
                          className="bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600 transition-all"
                        >
                          <Plus className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                      {config.categorias?.map((cat) => (
                        <div key={cat.id} className="flex justify-between items-center p-3 bg-white border border-slate-100 rounded-xl">
                          <div>
                            <p className="font-bold text-slate-700">{cat.nome}</p>
                            <p className="text-xs text-slate-500">{cat.idadeMin} a {cat.idadeMax} anos</p>
                          </div>
                          <button
                            onClick={() => removerCategoria(cat.id)}
                            className="text-slate-400 hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      {(!config.categorias || config.categorias.length === 0) && (
                        <p className="text-sm text-slate-400 text-center py-4">Nenhuma categoria cadastrada</p>
                      )}
                    </div>
                  </div>

                  {/* Regras por Data - Substituído pelo Calendário Visual */}
        <AdminCalendar
          config={config}
          onToggleDate={(data, categoriaId) => {
            if (config.regrasDatas && config.regrasDatas[data]) {
              removerRegraData(data);
            } else {
              salvarRegraData(data, { categoriaId });
            }
          }}
          onCreateDefaultCategory={() => {
            salvarCategoria({
              id: crypto.randomUUID(),
              nome: 'Público Geral',
              idadeMin: 0,
              idadeMax: 100
            });
          }}
        />
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
