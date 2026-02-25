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
    <div className='p-5 h-80 overflow-y-auto'>
      <table border="1" cellPadding="10" className='w-full border-collapse'>
        <thead>
          <tr className='bg-zinc-400 border'>
            <th >Data</th>
            <th>Funcionário</th>
            <th>EPI</th>
            <th>Qtd</th>
          </tr>
        </thead>
        <tbody>
          {dados.map((item, index) => (
            <tr key={index} className='border-b mb-0.5'>
              <td className='border-x'>{new Date(item.data_saida).toLocaleDateString('pt-BR')}</td>
              <td className='border-x'>{item.funcionarios?.nome}</td>
              <td className='border-x'>{item.estoque?.nome_item}</td>
              <td className='border-x'>{item.quantidade_entregue}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}