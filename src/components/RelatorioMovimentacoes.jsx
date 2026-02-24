import { useEffect, useState } from 'react';
import { supabase } from '../data/supabaseClient';

export default function RelatorioSimples() {
  const [dados, setDados] = useState([]);

  useEffect(() => {
    const carregarRelatorio = async () => {
      const { data } = await supabase
        .from('movimentacoes_epi')
        .select('data_saida, quantidade_entregue, funcionarios(nome), estoque(nome_item)')
        .order('data_saida', { ascending: false });
      
      setDados(data || []);
    };

    carregarRelatorio();
  }, []);

  return (
    <div className='p-5'>
      <h2>📋 Relatório de Movimentações</h2>
      <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
        <thead>
          <tr style={{ backgroundColor: '#f0f0f0' }}>
            <th>Data</th>
            <th>Funcionário</th>
            <th>EPI</th>
            <th>Qtd</th>
          </tr>
        </thead>
        <tbody>
          {dados.map((item, index) => (
            <tr key={index}>
              <td>{new Date(item.data_saida).toLocaleDateString('pt-BR')}</td>
              <td>{item.funcionarios?.nome}</td>
              <td>{item.estoque?.nome_item}</td>
              <td>{item.quantidade_entregue}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}