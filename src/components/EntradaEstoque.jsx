import { useState, useEffect } from 'react';
import { supabase } from '../data/supabaseClient';

export default function EntradaEstoque() {
  const [estoque, setEstoque] = useState([]);
  const [loading, setLoading] = useState(false);

  // Estados do formulário
  const [isNovoItem, setIsNovoItem] = useState(false);
  const [itemId, setItemId] = useState('');
  const [nomeItem, setNomeItem] = useState('');
  const [quantidade, setQuantidade] = useState(0);
  const [categoria, setCategoria] = useState('EPI');

  useEffect(() => {
    fetchEstoque();
  }, []);

  async function fetchEstoque() {
    const { data } = await supabase.from('estoque').select('*').order('nome_item');
    setEstoque(data || []);
  }

  const handleEntrada = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (isNovoItem) {
      // Cria um novo registro no estoque
      const { error } = await supabase
        .from('estoque')
        .insert([{ nome_item: nomeItem, quantidade_atual: quantidade, categoria: categoria }]);
      
      if (error) alert("Erro ao criar item: " + error.message);
      else alert("Novo EPI cadastrado com sucesso!");

    } else {
      // Atualiza a quantidade de um item existente (SOMA a quantidade nova à atual)
      const itemAtual = estoque.find(i => i.id === itemId);
      const novaQuantidade = parseInt(itemAtual.quantidade_atual) + parseInt(quantidade);

      const { error } = await supabase
        .from('estoque')
        .update({ quantidade_atual: novaQuantidade })
        .eq('id', itemId);

      if (error) alert("Erro ao atualizar: " + error.message);
      else alert("Estoque atualizado com sucesso!");
    }

    // Limpa o formulário e recarrega
    setNomeItem('');
    setQuantidade(0);
    setItemId('');
    fetchEstoque();
    setLoading(false);
  };

  return (
    <div className='p-5 w-full'>
      <div className='w-full mb-4 flex items-center justify-between gap-1'>
        <button onClick={() => setIsNovoItem(false)} className='border border-amber-200/10 px-2 py-1 rounded bg-amber-500/90 hover:bg-amber-500 text-white font-semibold cursor-pointer'>Repor Item Existente</button>
        <button onClick={() => setIsNovoItem(true)} className='border border-amber-200/10 px-2 py-1 rounded bg-emerald-400/90 hover:bg-emerald-400 text-white font-semibold cursor-pointer' >Cadastrar Novo Tipo de EPI</button>
      </div>

      <form onSubmit={handleEntrada}>
        {isNovoItem ? (
          <div style={{ marginBottom: '10px' }}>
            <label className='font-bold'>Nome do Novo EPI:</label>
            <input 
              type="text" 
              value={nomeItem} 
              onChange={e => setNomeItem(e.target.value)} 
              required 
              className='w-full border-2 border-black/50 rounded p-1' 
              placeholder="Ex: Luva de Vaqueta"
            />
          </div>
        ) : (
          <div style={{ marginBottom: '10px' }}>
            <label className='font-bold'>Selecionar EPI:</label>
            <select 
              value={itemId} 
              onChange={e => setItemId(e.target.value)} 
              required 
              className='w-full border-2 border-black/50 rounded p-1'
            >
              <option value="">Selecione o item...</option>
              {estoque.map(item => (
                <option key={item.id} value={item.id}>{item.nome_item} (Atual: {item.quantidade_atual})</option>
              ))}
            </select>
          </div>
        )}

        <div style={{ marginBottom: '10px' }}>
          <label className='font-bold'>Quantidade que está entrando:</label>
          <input 
            type="number" 
            value={quantidade} 
            onChange={e => setQuantidade(e.target.value)} 
            required 
            className='w-full border-2 border-black/50 rounded p-1' 
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          style={{ width: '100%', padding: '10px', backgroundColor: '#e67e22', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
        >
          {loading ? 'Salvando...' : (isNovoItem ? 'Cadastrar e Adicionar' : 'Confirmar Entrada')}
        </button>
      </form>
    </div>
  );
}