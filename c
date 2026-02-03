warning: in the working copy of 'src/App.tsx', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'src/pages/Admin/Dashboard.tsx', LF will be replaced by CRLF the next time Git touches it
[1mdiff --git a/src/App.tsx b/src/App.tsx[m
[1mindex d85ac70..51f2e34 100644[m
[1m--- a/src/App.tsx[m
[1m+++ b/src/App.tsx[m
[36m@@ -1,49 +1,738 @@[m
[31m-import React from 'react';[m
[31m-import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';[m
[31m-import { Home } from './pages/Home';[m
[31m-import { Confirmacao } from './pages/Confirmacao';[m
[31m-import { Sucesso } from './pages/Sucesso';[m
[31m-import { Verificacao } from './pages/Verificacao';[m
[31m-import { Login } from './pages/Admin/Login';[m
[31m-import Dashboard from './pages/Admin/Dashboard';[m
[31m-import { AuthProvider, useAuth } from './context/AuthContext';[m
[31m-[m
[31m-// Componente para proteger rotas privadas[m
[31m-const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {[m
[31m-  const { isAuthenticated } = useAuth();[m
[32m+[m[32m"use client"[m
[32m+[m
[32m+[m[32mimport React, { useState, useMemo } from 'react'[m
[32m+[m[32mimport {[m[41m [m
[32m+[m[32m  Calendar as CalendarIcon,[m[41m [m
[32m+[m[32m  Clock,[m[41m [m
[32m+[m[32m  Settings,[m[41m [m
[32m+[m[32m  LogOut,[m[41m [m
[32m+[m[32m  Users,[m[41m [m
[32m+[m[32m  CheckCircle2,[m[41m [m
[32m+[m[32m  X,[m[41m [m
[32m+[m[32m  Plus,[m[41m [m
[32m+[m[32m  Trash2,[m
[32m+[m[32m  Search,[m
[32m+[m[32m  ChevronRight,[m
[32m+[m[32m  Shield,[m
[32m+[m[32m  UserCheck,[m
[32m+[m[32m  AlertCircle,[m
[32m+[m[32m  FileText,[m
[32m+[m[32m  Tags,[m
[32m+[m[32m  ChevronDown[m
[32m+[m[32m} from 'lucide-react'[m
[32m+[m[32mimport { cn } from '@/lib/utils'[m
[32m+[m
[32m+[m[32mtype Tab = 'agendamentos' | 'configuracoes'[m
[32m+[m
[32m+[m[32mtype Agendamento = {[m
[32m+[m[32m  id: string[m
[32m+[m[32m  nome: string[m
[32m+[m[32m  cpf: string[m
[32m+[m[32m  telefone: string[m
[32m+[m[32m  email: string[m
[32m+[m[32m  horario: string[m
[32m+[m[32m  dataAgendamento: string[m
[32m+[m[32m  senha: number[m
[32m+[m[32m  compareceu: boolean[m
[32m+[m[32m}[m
[32m+[m
[32m+[m[32m// Mock data for demonstration[m
[32m+[m[32mconst mockAgendamentos: Agendamento[] = [[m
[32m+[m[32m  { id: '1', nome: 'Maria Silva Santos', cpf: '123.456.789-00', telefone: '(11) 99999-1234', email: 'maria@email.com', horario: '08:00', dataAgendamento: '2026-02-03', senha: 1, compareceu: true },[m
[32m+[m[32m  { id: '2', nome: 'João Pedro Oliveira', cpf: '987.654.321-00', telefone: '(11) 98888-5678', email: 'joao@email.com', horario: '08:30', dataAgendamento: '2026-02-03', senha: 2, compareceu: true },[m
[32m+[m[32m  { id: '3', nome: 'Ana Carolina Ferreira', cpf: '456.789.123-00', telefone: '(11) 97777-9012', email: 'ana@email.com', horario: '09:00', dataAgendamento: '2026-02-03', senha: 3, compareceu: false },[m
[32m+[m[32m  { id: '4', nome: 'Carlos Eduardo Lima', cpf: '321.654.987-00', telefone: '(11) 96666-3456', email: 'carlos@email.com', horario: '09:30', dataAgendamento: '2026-02-03', senha: 4, compareceu: false },[m
[32m+[m[32m  { id: '5', nome: 'Beatriz Almeida Costa', cpf: '789.123.456-00', telefone: '(11) 95555-7890', email: 'beatriz@email.com', horario: '10:00', dataAgendamento: '2026-02-03', senha: 5, compareceu: false },[m
[32m+[m[32m][m
[32m+[m
[32m+[m[32mconst mockConfig = {[m
[32m+[m[32m  horariosAtendimento: ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '14:00', '14:30', '15:00'],[m
[32m+[m[32m  feriados: ['2026-02-16', '2026-02-17', '2026-04-21'],[m
[32m+[m[32m  limiteVagasPorDia: 50,[m
[32m+[m[32m  categorias: [[m
[32m+[m[32m    { id: '1', nome: 'Idoso', idadeMin: 60, idadeMax: 120 },[m
[32m+[m[32m    { id: '2', nome: 'Criança', idadeMin: 0, idadeMax: 12 },[m
[32m+[m[32m  ],[m
[32m+[m[32m  capacidadePorHorario: {} as Record<string, number>,[m
[32m+[m[32m}[m
[32m+[m
[32m+[m[32mexport default function Dashboard() {[m
[32m+[m[32m  const [activeTab, setActiveTab] = useState<Tab>('agendamentos')[m
[32m+[m[32m  const [sidebarOpen, setSidebarOpen] = useState(true)[m
[32m+[m[32m  const [agendamentos, setAgendamentos] = useState(mockAgendamentos)[m
   [m
[31m-  if (!isAuthenticated) {[m
[31m-    return <Navigate to="/admin/login" replace />;[m
[32m+[m[32m  // Agendamentos State[m
[32m+[m[32m  const [dataFiltro, setDataFiltro] = useState(new Date().toISOString().split('T')[0])[m
[32m+[m[32m  const [mostrarTodos, setMostrarTodos] = useState(false)[m
[32m+[m[32m  const [termoBusca, setTermoBusca] = useState('')[m
[32m+[m[32m  const [expandedCard, setExpandedCard] = useState<string | null>(null)[m
[32m+[m
[32m+[m[32m  // Config State[m
[32m+[m[32m  const [config, setConfig] = useState(mockConfig)[m
[32m+[m[32m  const [novoHorario, setNovoHorario] = useState('')[m
[32m+[m[32m  const [novoFeriado, setNovoFeriado] = useState('')[m
[32m+[m[32m  const [novaCategoria, setNovaCategoria] = useState({ nome: '', idadeMin: '', idadeMax: '' })[m
[32m+[m
[32m+[m[32m  // Derived State[m
[32m+[m[32m  const agendamentosDoDia = useMemo(() => {[m
[32m+[m[32m    if (mostrarTodos) return agendamentos[m
[32m+[m[32m    return agendamentos.filter(ag => ag.dataAgendamento === dataFiltro)[m
[32m+[m[32m  }, [agendamentos, dataFiltro, mostrarTodos])[m
[32m+[m
[32m+[m[32m  const agendamentosFiltrados = useMemo(() => {[m
[32m+[m[32m    return agendamentosDoDia.filter(ag =>[m[41m [m
[32m+[m[32m      ag.nome.toLowerCase().includes(termoBusca.toLowerCase()) ||[m
[32m+[m[32m      ag.cpf.includes(termoBusca)[m
[32m+[m[32m    ).sort((a, b) => a.horario.localeCompare(b.horario))[m
[32m+[m[32m  }, [agendamentosDoDia, termoBusca])[m
[32m+[m
[32m+[m[32m  const compareceram = agendamentosDoDia.filter(ag => ag.compareceu).length[m
[32m+[m[32m  const taxaComparecimento = agendamentosDoDia.length ? Math.round((compareceram / agendamentosDoDia.length) * 100) : 0[m
[32m+[m
[32m+[m[32m  const toggleCompareceu = (id: string) => {[m
[32m+[m[32m    setAgendamentos(prev => prev.map(ag =>[m[41m [m
[32m+[m[32m      ag.id === id ? { ...ag, compareceu: !ag.compareceu } : ag[m
[32m+[m[32m    ))[m
[32m+[m[32m  }[m
[32m+[m
[32m+[m[32m  const adicionarHorario = (horario: string) => {[m
[32m+[m[32m    if (!config.horariosAtendimento.includes(horario)) {[m
[32m+[m[32m      setConfig(prev => ({[m
[32m+[m[32m        ...prev,[m
[32m+[m[32m        horariosAtendimento: [...prev.horariosAtendimento, horario].sort()[m
[32m+[m[32m      }))[m
[32m+[m[32m    }[m
[32m+[m[32m  }[m
[32m+[m
[32m+[m[32m  const removerHorario = (horario: string) => {[m
[32m+[m[32m    setConfig(prev => ({[m
[32m+[m[32m      ...prev,[m
[32m+[m[32m      horariosAtendimento: prev.horariosAtendimento.filter(h => h !== horario)[m
[32m+[m[32m    }))[m
[32m+[m[32m  }[m
[32m+[m
[32m+[m[32m  const adicionarFeriado = (feriado: string) => {[m
[32m+[m[32m    if (!config.feriados.includes(feriado)) {[m
[32m+[m[32m      setConfig(prev => ({[m
[32m+[m[32m        ...prev,[m
[32m+[m[32m        feriados: [...prev.feriados, feriado].sort()[m
[32m+[m[32m      }))[m
[32m+[m[32m    }[m
[32m+[m[32m  }[m
[32m+[m
[32m+[m[32m  const removerFeriado = (feriado: string) => {[m
[32m+[m[32m    setConfig(prev => ({[m
[32m+[m[32m      ...prev,[m
[32m+[m[32m      feriados: prev.feriados.filter(f => f !== feriado)[m
[32m+[m[32m    }))[m
[32m+[m[32m  }[m
[32m+[m
[32m+[m[32m  const atualizarLimiteVagas = (valor: number) => {[m
[32m+[m[32m    setConfig(prev => ({ ...prev, limiteVagasPorDia: valor }))[m
[32m+[m[32m  }[m
[32m+[m
[32m+[m[32m  const salvarCategoria = (categoria: { id: string, nome: string, idadeMin: number, idadeMax: number }) => {[m
[32m+[m[32m    setConfig(prev => ({[m
[32m+[m[32m      ...prev,[m
[32m+[m[32m      categorias: [...(prev.categorias || []), categoria][m
[32m+[m[32m    }))[m
[32m+[m[32m  }[m
[32m+[m
[32m+[m[32m  const removerCategoria = (id: string) => {[m
[32m+[m[32m    setConfig(prev => ({[m
[32m+[m[32m      ...prev,[m
[32m+[m[32m      categorias: prev.categorias?.filter(c => c.id !== id) || [][m
[32m+[m[32m    }))[m
   }[m
 [m
[31m-  return <>{children}</>;[m
[31m-};[m
[32m+[m[32m  const atualizarCapacidadeHorario = (horario: string, capacidade: number) => {[m
[32m+[m[32m    setConfig(prev => ({[m
[32m+[m[32m      ...prev,[m
[32m+[m[32m      capacidadePorHorario: { ...prev.capacidadePorHorario, [horario]: capacidade }[m
[32m+[m[32m    }))[m
[32m+[m[32m  }[m
 [m
[31m-function App() {[m
   return ([m
[31m-    <Router>[m
[31m-      <AuthProvider>[m
[31m-        <Routes>[m
[31m-          {/* Rotas Públicas */}[m
[31m-          <Route path="/" element={<Home />} />[m
[31m-          <Route path="/confirmacao" element={<Confirmacao />} />[m
[31m-          <Route path="/sucesso" element={<Sucesso />} />[m
[31m-          <Route path="/verificacao/:id" element={<Verificacao />} />[m
[32m+[m[32m    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-800">[m
[32m+[m[32m      {/* Sidebar */}[m
[32m+[m[32m      <aside[m[41m [m
[32m+[m[32m        className={cn([m
[32m+[m[32m          "bg-slate-900 text-white flex-shrink-0 transition-all duration-300 flex flex-col fixed md:relative z-30 h-full shadow-xl",[m
[32m+[m[32m          sidebarOpen ? 'w-64' : 'w-20'[m
[32m+[m[32m        )}[m
[32m+[m[32m      >[m
[32m+[m[32m        {/* Logo Area */}[m
[32m+[m[32m        <div className="p-5 border-b border-slate-800">[m
[32m+[m[32m          <div className="flex items-center gap-3">[m
[32m+[m[32m            {sidebarOpen ? ([m
[32m+[m[32m              <>[m
[32m+[m[32m                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/20">[m
[32m+[m[32m                  <Users className="w-5 h-5 text-white" />[m
[32m+[m[32m                </div>[m
[32m+[m[32m                <div>[m
[32m+[m[32m                  <h2 className="text-base font-bold text-white">Admin RG</h2>[m
[32m+[m[32m                  <p className="text-slate-400 text-xs">Painel Gerencial</p>[m
[32m+[m[32m                </div>[m
[32m+[m[32m              </>[m
[32m+[m[32m            ) : ([m
[32m+[m[32m              <div className="w-10 h-10 mx-auto rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">[m
[32m+[m[32m                <Users className="w-5 h-5 text-white" />[m
[32m+[m[32m              </div>[m
[32m+[m[32m            )}[m
[32m+[m[32m          </div>[m
[32m+[m[32m        </div>[m
[32m+[m
[32m+[m[32m        {/* Navigation */}[m
[32m+[m[32m        <nav className="flex-1 mt-6 px-3 space-y-1">[m
[32m+[m[32m          {sidebarOpen && ([m
[32m+[m[32m            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold mb-3 px-3">[m
[32m+[m[32m              Menu Principal[m
[32m+[m[32m            </p>[m
[32m+[m[32m          )}[m
           [m
[31m-          {/* Rotas Administrativas */}[m
[31m-          <Route path="/admin/login" element={<Login />} />[m
[31m-          <Route [m
[31m-            path="/admin/dashboard" [m
[31m-            element={[m
[31m-              <ProtectedRoute>[m
[31m-                <Dashboard />[m
[31m-              </ProtectedRoute>[m
[31m-            } [m
[31m-          />[m
[31m-        </Routes>[m
[31m-      </AuthProvider>[m
[31m-    </Router>[m
[31m-  );[m
[31m-}[m
[32m+[m[32m          {/* Agendamentos */}[m
[32m+[m[32m          <button[m
[32m+[m[32m            onClick={() => setActiveTab('agendamentos')}[m
[32m+[m[32m            className={cn([m
[32m+[m[32m              "w-full flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 group",[m
[32m+[m[32m              activeTab === 'agendamentos'[m[41m [m
[32m+[m[32m                ? 'bg-blue-600 text-white'[m[41m [m
[32m+[m[32m                : 'text-slate-400 hover:bg-slate-800 hover:text-white'[m
[32m+[m[32m            )}[m
[32m+[m[32m          >[m
[32m+[m[32m            <Users className={cn("w-5 h-5", sidebarOpen ? '' : 'mx-auto')} />[m
[32m+[m[32m            {sidebarOpen && ([m
[32m+[m[32m              <>[m
[32m+[m[32m                <span className="ml-3 font-medium text-sm">Agendamentos</span>[m
[32m+[m[32m                <span className={cn([m
[32m+[m[32m                  "ml-auto px-2 py-0.5 text-xs font-bold rounded-md",[m
[32m+[m[32m                  activeTab === 'agendamentos' ? "bg-white/20 text-white" : "bg-slate-700 text-slate-300"[m
[32m+[m[32m                )}>[m
[32m+[m[32m                  {agendamentosDoDia.length}[m
[32m+[m[32m                </span>[m
[32m+[m[32m                {activeTab === 'agendamentos' && <ChevronRight className="w-4 h-4 ml-1.5" />}[m
[32m+[m[32m              </>[m
[32m+[m[32m            )}[m
[32m+[m[32m          </button>[m
[32m+[m
[32m+[m[32m          {/* Configuracoes */}[m
[32m+[m[32m          <button[m
[32m+[m[32m            onClick={() => setActiveTab('configuracoes')}[m
[32m+[m[32m            className={cn([m
[32m+[m[32m              "w-full flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 group",[m
[32m+[m[32m              activeTab === 'configuracoes'[m[41m [m
[32m+[m[32m                ? 'bg-blue-600 text-white'[m[41m [m
[32m+[m[32m                : 'text-slate-400 hover:bg-slate-800 hover:text-white'[m
[32m+[m[32m            )}[m
[32m+[m[32m          >[m
[32m+[m[32m            <Settings className={cn("w-5 h-5", sidebarOpen ? '' : 'mx-auto')} />[m
[32m+[m[32m            {sidebarOpen && ([m
[32m+[m[32m              <>[m
[32m+[m[32m                <span className="ml-3 font-medium text-sm">Configurações</span>[m
[32m+[m[32m                {activeTab === 'configuracoes' && <ChevronRight className="w-4 h-4 ml-auto" />}[m
[32m+[m[32m              </>[m
[32m+[m[32m            )}[m
[32m+[m[32m          </button>[m
[32m+[m[32m        </nav>[m
[32m+[m
[32m+[m[32m        {/* Logout */}[m
[32m+[m[32m        <div className="p-4 border-t border-slate-800">[m
[32m+[m[32m          <button[m
[32m+[m[32m            className={cn([m
[32m+[m[32m              "w-full flex items-center px-3 py-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all duration-200",[m
[32m+[m[32m              !sidebarOpen && 'justify-center'[m
[32m+[m[32m            )}[m
[32m+[m[32m          >[m
[32m+[m[32m            <LogOut className={cn("w-5 h-5", sidebarOpen && "mr-3")} />[m
[32m+[m[32m            {sidebarOpen && <span className="font-medium text-sm">Sair</span>}[m
[32m+[m[32m          </button>[m
[32m+[m[32m        </div>[m
[32m+[m[32m      </aside>[m
[32m+[m
[32m+[m[32m      {/* Main Content */}[m
[32m+[m[32m      <main className="flex-1 overflow-y-auto">[m
[32m+[m[32m        <div className="p-6 lg:p-8 max-w-7xl mx-auto">[m
[32m+[m[32m          {activeTab === 'agendamentos' ? ([m
[32m+[m[32m            <div className="space-y-6">[m
[32m+[m[32m              {/* Header */}[m
[32m+[m[32m              <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">[m
[32m+[m[32m                <div>[m
[32m+[m[32m                  <div className="flex items-center gap-2 mb-1">[m
[32m+[m[32m                    <div className="w-1 h-6 bg-blue-600 rounded-full" />[m
[32m+[m[32m                    <h1 className="text-2xl font-bold text-slate-800">Agendamentos</h1>[m
[32m+[m[32m                  </div>[m
[32m+[m[32m              