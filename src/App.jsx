import { useState, useEffect } from "react";
import { supabase } from "../src/data/supabaseClient";

// Importação dos seus componentes
import CadastroFuncionario from "./components/CadastroFuncionario";
import CadastroMovimentacao from "./components/CadastroMovimentacao";
import EntradaEstoque from "./components/EntradaEstoque";
import RelatorioMovimentacoes from "./components/RelatorioMovimentacoes";
import Login from "./components/Login";

const App = () => {
  const [session, setSession] = useState(null);
  const [abaAtiva, setAbaAtiva] = useState("relatorio");
  const [stats, setStats] = useState({ total: 0, baixo: 0 });

  // 1. Gerenciamento de Autenticação
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // 2. Busca de estatísticas para a Mini Dash
  useEffect(() => {
    if (session) {
      const fetchStats = async () => {
        const { data } = await supabase
          .from('estoque')
          .select('quantidade_atual, quantidade_minima');
        
        if (data) {
          const total = data.reduce((acc, item) => acc + item.quantidade_atual, 0);
          const baixo = data.filter(item => item.quantidade_atual < item.quantidade_minima).length;
          setStats({ total, baixo });
        }
      };
      fetchStats();
    }
  }, [session, abaAtiva]);

  // Itens do Menu
  const menuItems = [
    { id: 'relatorio', label: 'Relatório', icon: '📋', color: 'bg-blue-600/30' },
    { id: 'saida', label: 'Registrar Saída', icon: '📤', color: 'bg-red-600/30' },
    { id: 'entrada', label: 'Entrada Estoque', icon: '📥', color: 'bg-green-600/30' },
    { id: 'funcionario', label: 'Funcionários', icon: '👥', color: 'bg-orange-500/30' },
  ];

  // Se não houver sessão, mostra apenas o Login
  if (!session) {
    return <Login onLoginSuccess={(user) => setSession(user)} />;
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen pb-20 md:pb-0">
      
      {/* SIDEBAR (DESKTOP) */}
      <aside className="hidden md:flex w-52 bg-zinc-900 text-white flex-col p-6 shadow-xl shadow-black/50">
        <div className="flex items-center gap-3 mb-10 justify-center">
          <span className="text-2xl">📦</span>
          <h1 className="text-xl font-bold tracking-tight">Easy Stock Control</h1>
        </div>

        <nav className="flex flex-col gap-2">
          {menuItems.map((item) => (
            <button 
              key={item.id}
              onClick={() => setAbaAtiva(item.id)}
              className={`p-3 rounded-lg text-left transition flex items-center gap-3 ${
                abaAtiva === item.id ? item.color : "hover:bg-white/10 text-gray-300"
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <button 
          onClick={() => supabase.auth.signOut()}
          className="mt-auto p-3 text-gray-400 hover:text-white hover:bg-red-900/30 rounded-lg transition text-left flex items-center gap-3"
        >
          <span>🚪</span> Sair do Sistema
        </button>
      </aside>

      {/* ÁREA DE CONTEÚDO */}
      <main className="flex-1 p-4 md:p-10 h-screen"> 
        
        {/* CABEÇALHO MOBILE */}
        <div className="md:hidden flex justify-between items-center mb-6">
           <h1 className="text-xl font-bold text-zinc-800">Easy Stock Control</h1>
           <button onClick={() => supabase.auth.signOut()} className="text-sm bg-red-100 text-red-600 px-3 py-1 rounded-full font-bold">Sair</button>
        </div>

        {/* MINI DASHBOARD */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-4 rounded-xl shadow-sm border-b-4 border-blue-500">
            <p className="text-gray-400 text-[10px] md:text-xs uppercase font-bold mb-1">Total Itens</p>
            <h3 className="text-xl md:text-2xl font-black text-slate-700">{stats.total}</h3>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border-b-4 border-red-500">
            <p className="text-gray-400 text-[10px] md:text-xs uppercase font-bold mb-1">Crítico (Abaixo Min.)</p>
            <h3 className="text-xl md:text-2xl font-black text-red-600">{stats.baixo}</h3>
          </div>
          <div className="hidden md:block bg-white p-4 rounded-xl shadow-sm border-b-4 border-green-500">
            <p className="text-gray-400 text-xs uppercase font-bold mb-1">Status do Banco</p>
            <h3 className="text-2xl font-black text-green-600">Conectado</h3>
          </div>
        </div>

        {/* COMPONENTE ATIVO */}
        <div className="bg-white rounded-2xl shadow-md p-6 md:p-10 border border-gray-200">
          <div className="mb-6 border-b pb-4">
            <h2 className="text-2xl font-bold text-slate-800">
              {menuItems.find(i => i.id === abaAtiva)?.label}
            </h2>
          </div>

          <div className="flex justify-center md:block">
            {abaAtiva === "relatorio" && <RelatorioMovimentacoes />}
            {abaAtiva === "saida" && <CadastroMovimentacao />}
            {abaAtiva === "entrada" && <EntradaEstoque />}
            {abaAtiva === "funcionario" && <CadastroFuncionario />}
          </div>
        </div>
      </main>

      {/* TAB BAR (MOBILE) */}
      <nav className="md:hidden fixed bottom-1 left-0 right-0 bg-zinc-800/70 backdrop-blur-md text-white flex justify-around items-center p-3 z-50">
        {menuItems.map((item) => (
          <button 
            key={item.id}
            onClick={() => setAbaAtiva(item.id)}
            className={`flex flex-col items-center gap-1 transition-all ${
              abaAtiva === item.id ? "text-blue-400 scale-110" : "text-white"
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="text-[9px] uppercase font-black">{item.id}</span>
          </button>
        ))}
      </nav>

    </div>
  );
};

export default App;