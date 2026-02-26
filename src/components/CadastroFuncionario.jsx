import { useState } from 'react';
import { supabase } from '../data/supabaseClient';
import ListaFuncionarios from './ListaFuncionarios';

export default function CadastroFuncionario() {
  const [nome, setNome] = useState('');
  const [cargo, setCargo] = useState('');
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false); // Estado do Modal

  const handleCadastro = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase
      .from('funcionarios')
      .insert([{ nome, cargo, ativo: true }]);

    if (error) {
      alert("Erro ao cadastrar: " + error.message);
    } else {
      alert("Funcionário cadastrado com sucesso!");
      setNome('');
      setCargo('');
    }
    setLoading(false);
  };

  return (
    <div className="p-5 w-full flex flex-col items-center h-86 relative">
      
      {/* Formulário com Tailwind seguindo sua estética */}
      <form onSubmit={handleCadastro} className="w-full max-w-md bg-white p-6 rounded-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">Novo Funcionário</h2>
          <button 
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="text-xs bg-blue-50 text-blue-600 px-3 py-2 rounded-lg font-bold hover:bg-blue-100 transition"
          >
            VER EQUIPE
          </button>
        </div>

        <div className="mb-3">
          <label className="block mb-1 text-sm font-medium text-gray-700">Nome Completo:</label>
          <input 
            type="text" 
            placeholder="Ex: João Silva"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
            className="w-full p-2.5 rounded-md border border-gray-300 focus:ring-2 focus:ring-green-500 focus:outline-none"
          />
        </div>

        <div className="mb-5">
          <label className="block mb-1 text-sm font-medium text-gray-700">Cargo / Função:</label>
          <input 
            type="text" 
            placeholder="Ex: Operador de Máquina"
            value={cargo}
            onChange={(e) => setCargo(e.target.value)}
            required
            className="w-full p-2.5 rounded-md border border-gray-300 focus:ring-2 focus:ring-green-500 focus:outline-none"
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full p-3 bg-green-600 text-white rounded-md font-bold hover:bg-green-700 disabled:bg-gray-400 transition-colors shadow-lg shadow-green-200"
        >
          {loading ? 'Salvando...' : 'Cadastrar Funcionário'}
        </button>
      </form>

      {/* MODAL DA LISTA */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="relative w-full max-w-lg animate-in fade-in zoom-in duration-200">
            {/* Botão de fechar em cima do componente */}
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute -top-12 right-0 text-white text-sm font-bold flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full hover:bg-white/20 transition"
            >
              FECHAR ✕
            </button>
            
            <ListaFuncionarios />
          </div>
        </div>
      )}
    </div>
  );
}