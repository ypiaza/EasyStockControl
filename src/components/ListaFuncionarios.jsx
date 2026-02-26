import { useEffect, useState } from 'react';
import { supabase } from '../data/supabaseClient';

export default function ListaFuncionarios() {
  const [funcionarios, setFuncionarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editandoId, setEditandoId] = useState(null);
  const [novoNome, setNovoNome] = useState('');

  useEffect(() => {
    fetchFuncionarios();
  }, []);

  async function fetchFuncionarios() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('funcionarios')
        .select('*')
        .order('nome', { ascending: true });

      if (error) throw error;
      setFuncionarios(data || []);
    } catch (error) {
      alert("Erro ao buscar: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  // FUNÇÃO PARA EXCLUIR
  async function excluirFuncionario(id) {
    if (window.confirm("Tem certeza que deseja remover este funcionário?")) {
      const { error } = await supabase
        .from('funcionarios')
        .delete()
        .eq('id', id);

      if (error) alert("Erro ao excluir: " + error.message);
      else fetchFuncionarios(); // Atualiza a lista
    }
  }

  // FUNÇÃO PARA EDITAR (SALVAR)
  async function salvarEdicao(id) {
    const { error } = await supabase
      .from('funcionarios')
      .update({ nome: novoNome })
      .eq('id', id);

    if (error) {
      alert("Erro ao editar: " + error.message);
    } else {
      setEditandoId(null);
      fetchFuncionarios();
    }
  }

  if (loading) return <p className="p-10 text-gray-500 text-center animate-pulse">Carregando equipe...</p>;

  return (
    <div className="p-6 bg-white rounded-xl shadow-2xl border border-black/5 w-full">
      <h2 className="text-xl font-bold mb-4 border-b pb-4 flex justify-between items-center text-slate-800">
        Equipe Cadastrada
        <span className="text-[10px] bg-slate-100 px-2 py-1 rounded text-slate-500 uppercase font-black">
          {funcionarios.length} Membros
        </span>
      </h2>

      <div className="overflow-y-auto max-h-[60vh] pr-2 custom-scrollbar">
        {funcionarios.length === 0 ? (
          <p className="text-gray-400 text-center py-10">Nenhum registro encontrado.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {funcionarios.map((f) => (
              <li key={f.id} className="py-4 flex flex-col gap-2">
                <div className="flex justify-between items-start">
                  {editandoId === f.id ? (
                    /* MODO EDIÇÃO */
                    <div className="flex gap-2 w-full pr-4">
                      <input 
                        className="flex-1 p-1 border rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        value={novoNome}
                        onChange={(e) => setNovoNome(e.target.value)}
                        autoFocus
                      />
                      <button onClick={() => salvarEdicao(f.id)} className="text-green-600 text-xs font-bold">SALVAR</button>
                      <button onClick={() => setEditandoId(null)} className="text-gray-400 text-xs">SAIR</button>
                    </div>
                  ) : (
                    /* MODO VISUALIZAÇÃO */
                    <>
                      <div>
                        <p className="font-bold text-slate-800 leading-tight">{f.nome}</p>
                        <p className="text-xs text-gray-500 font-medium uppercase tracking-tighter">{f.cargo}</p>
                      </div>
                      
                      <div className="flex gap-3 ml-4">
                        <button 
                          onClick={() => { setEditandoId(f.id); setNovoNome(f.nome); }}
                          className="text-blue-500 hover:text-blue-700 transition"
                          title="Editar nome"
                        >
                          ✏️
                        </button>
                        <button 
                          onClick={() => excluirFuncionario(f.id)}
                          className="text-red-400 hover:text-red-600 transition"
                          title="Excluir funcionário"
                        >
                          🗑️
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
      `}</style>
    </div>
  );
}