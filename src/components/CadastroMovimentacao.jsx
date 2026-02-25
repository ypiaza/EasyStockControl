import { useState, useEffect } from 'react';
import { supabase } from '../data/supabaseClient'; 

export default function CadastroMovimentacao() {
  const [funcionarios, setFuncionarios] = useState([]);
  const [estoque, setEstoque] = useState([]);
  const [loading, setLoading] = useState(false);

  // Estados do formulário
  const [funcionarioId, setFuncionarioId] = useState('');
  const [itemId, setItemId] = useState('');
  const [quantidade, setQuantidade] = useState(1);

  // Carregar dados iniciais
  useEffect(() => {
    fetchDados();
  }, []);

  async function fetchDados() {
    const { data: func } = await supabase.from('funcionarios').select('id, nome').eq('ativo', true);
    const { data: estq } = await supabase.from('estoque').select('id, nome_item, quantidade_atual');
    setFuncionarios(func || []);
    setEstoque(estq || []);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase
      .from('movimentacoes_epi')
      .insert([
        { 
          funcionario_id: funcionarioId, 
          item_id: itemId, 
          quantidade_entregue: parseInt(quantidade) 
        }
      ]);

    if (error) {
      alert("Erro ao registrar: " + error.message);
    } else {
      alert("EPI entregue com sucesso! O estoque foi atualizado pelo Trigger.");
      setQuantidade(1);
      fetchDados(); // Atualiza a lista para mostrar o novo saldo do estoque
    }
    setLoading(false);
  };

  return (
    <div className='p-5 w-full'>     
      <form onSubmit={handleSubmit}>
        <div>
          <label className='font-bold'>Funcionário:</label>
          <select 
            required 
            value={funcionarioId} 
            onChange={e => setFuncionarioId(e.target.value)}
            className='w-full border-2 border-black/50 rounded p-1'
          >
            <option value="">Selecione...</option>
            {funcionarios.map(f => (
              <option key={f.id} value={f.id}>{f.nome}</option>
            ))}
          </select>
        </div>

        <div className='mb-4'>
          <label className='font-bold'>EPI (Item do Estoque):</label>
          <select 
            required 
            value={itemId} 
            onChange={e => setItemId(e.target.value)}
            className='w-full border-2 border-black/50 rounded p-1'
          >
            <option value="">Selecione...</option>
            {estoque.map(i => (
              <option key={i.id} value={i.id}>
                {i.nome_item} (Saldo: {i.quantidade_atual})
              </option>
            ))}
          </select>
        </div>

        <div className='mb-4'>
          <label className='font-bold'>Quantidade:</label>
          <input 
            type="number" 
            min="1" 
            value={quantidade} 
            onChange={e => setQuantidade(e.target.value)}
            className='w-full border-2 border-black/50 rounded p-1'
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          style={{ width: '100%', padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          {loading ? 'Processando...' : 'Registrar Entrega'}
        </button>
      </form>
    </div>
  );
}