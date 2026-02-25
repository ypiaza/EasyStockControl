import { useEffect, useState } from 'react';
import { supabase } from '../data/supabaseClient'; 

export default function ListaFuncionarios() {
  const [funcionarios, setFuncionarios] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFuncionarios();
  }, []);

  async function fetchFuncionarios() {
    try {
      setLoading(true);
      
      // .from('nome_da_tabela')
      const { data, error } = await supabase
        .from('funcionarios')
        .select('*') // Busca todas as colunas
        .order('nome', { ascending: true }); // Ordena por nome A-Z

      if (error) throw error;
      setFuncionarios(data || []);
      
    } catch (error) {
      console.error("Erro ao buscar funcionários:", error.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <p className="p-4 text-gray-500 text-center">Carregando equipe...</p>;

  return (
    <div className="p-4 bg-white rounded-lg shadow-2xl border border-black/10 mt-15 md:mt-0">
      <h2 className="text-xl font-bold mb-4 border-b pb-2">Equipe Cadastrada</h2>
      
      {funcionarios.length === 0 ? (
        <p className="text-gray-500">Nenhum funcionário encontrado.</p>
      ) : (
        <ul className="divide-y divide-gray-100 overflow-y-auto h-56">
          {funcionarios.map((f) => (
            <li key={f.id} className="py-3 flex justify-between items-center">
              <div>
                <p className="font-semibold text-slate-800">{f.nome}</p>
                <p className="text-sm text-gray-500">{f.cargo || 'Sem cargo'}</p>
              </div>
              <span className="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-400">
                ID: {f.id.slice(0, 5)}...
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}