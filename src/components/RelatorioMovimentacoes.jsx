import { useEffect, useState } from 'react';
import { supabase } from '../data/supabaseClient';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function RelatorioMovimentacoes() {
  const [movimentacoes, setMovimentacoes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados dos Filtros
  const [filtroEPI, setFiltroEPI] = useState('');
  const [filtroFuncionario, setFiltroFuncionario] = useState('');
  const [dataInicio, setDataInicio] = useState('');

  // Carrega os dados sempre que o componente monta ou um filtro muda
  useEffect(() => {
    fetchMovimentacoes();
  }, [filtroEPI, filtroFuncionario, dataInicio]);

  const gerarPDF = () => {
    const doc = new jsPDF();

    // Título do Documento
    doc.text("Relatório de Entregas de EPI", 14, 15);
    doc.setFontSize(10);
    doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 14, 22);

    // Formata os dados para a tabela do PDF
    const linhasTabela = movimentacoes.map(m => [
      new Date(m.data_saida).toLocaleDateString('pt-BR'),
      m.funcionarios?.nome || '—',
      m.estoque?.nome_item,
      m.quantidade_entregue
    ]);

    // Cria a tabela no PDF
    autoTable(doc, {
      startY: 30,
      head: [['Data', 'Colaborador', 'EPI', 'Qtd']],
      body: linhasTabela,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [30, 41, 59] }, // Cor Slate-800
    });

    // Faz o download
    doc.save("relatorio-epi.pdf");
  };

  const fetchMovimentacoes = async () => {
    setLoading(true);
    try {
      // Ajustado para o seu Schema: tabela 'movimentacoes_epi'
      let query = supabase
        .from('movimentacoes_epi')
        .select(`
          id, 
          data_saida, 
          quantidade_entregue, 
          observacao,
          estoque (nome_item), 
          funcionarios (nome)
        `)
        .order('data_saida', { ascending: false });

      // Filtros dinâmicos baseados nas suas colunas
      if (filtroEPI) query = query.ilike('estoque.nome_item', `%${filtroEPI}%`);
      if (filtroFuncionario) query = query.ilike('funcionarios.nome', `%${filtroFuncionario}%`);
      if (dataInicio) query = query.gte('data_saida', dataInicio);

      const { data, error } = await query;
      if (error) throw error;
      setMovimentacoes(data || []);
    } catch (error) {
      console.error("Erro na busca:", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-6">

      {/* 1. BARRA DE FILTROS (Sempre Ativa) */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 ml-1">Funcionário</label>
          <input
            type="text"
            placeholder="Nome do colaborador..."
            className="w-full p-2 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            value={filtroFuncionario}
            onChange={(e) => setFiltroFuncionario(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 ml-1">EPI / Item</label>
          <input
            type="text"
            placeholder="Ex: Luva, Capacete..."
            className="w-full p-2 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            value={filtroEPI}
            onChange={(e) => setFiltroEPI(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 ml-1">A partir de</label>
          <input
            type="date"
            className="w-full p-2 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            value={dataInicio}
            onChange={(e) => setDataInicio(e.target.value)}
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => { setFiltroEPI(''); setFiltroFuncionario(''); setDataInicio(''); }}
            className="flex-1 bg-gray-50 text-gray-400 py-2 rounded-lg text-[10px] font-black hover:bg-gray-100 transition"
          >
            LIMPAR
          </button>
          <button onClick={gerarPDF} className="flex-1 bg-slate-800 text-white py-2 rounded-lg text-[10px] font-black hover:bg-slate-700 shadow-md">
            PDF
          </button>
        </div>
      </div>

      {/* 2. TABELA DE RESULTADOS */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="max-h-60 overflow-y-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-slate-50 z-10 shadow-sm">
              <tr>
                <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-wider">Data Saída</th>
                <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-wider">Colaborador</th>
                <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-wider">EPI Entregue</th>
                <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-wider text-right">Qtd</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan="4" className="px-6 py-10 text-center text-slate-400 text-xs animate-pulse">Sincronizando com movimentacoes_epi...</td></tr>
              ) : movimentacoes.length === 0 ? (
                <tr><td colSpan="4" className="px-6 py-10 text-center text-slate-400 text-xs font-medium">Nenhum registro encontrado.</td></tr>
              ) : (
                movimentacoes.map((m) => (
                  <tr key={m.id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="px-6 py-4 text-xs text-slate-500">
                      {new Date(m.data_saida).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 text-xs font-bold text-slate-700">
                      {m.funcionarios?.nome || '—'}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-600">
                      <span className="block font-medium">{m.estoque?.nome_item}</span>
                      {m.observacao && <span className="text-[10px] text-gray-400 italic">{m.observacao}</span>}
                    </td>
                    <td className="px-6 py-4 text-right text-xs font-black text-slate-800">
                      {m.quantidade_entregue}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CSS para Scrollbar (Sem o erro 'jsx') */}
      <style>
        {`
          .custom-scrollbar::-webkit-scrollbar { width: 6px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
        `}
      </style>
    </div>
  );
}