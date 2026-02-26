import { useEffect, useState } from 'react';
import { supabase } from '../data/supabaseClient';

export default function MonitorEstoqueResumo() {
    const [itens, setItens] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [mediaGeral, setMediaGeral] = useState(0);

    useEffect(() => {
        const fetchEstoque = async () => {
            const { data } = await supabase
                .from('estoque')
                .select('nome_item, quantidade_atual, quantidade_minima');

            if (data) {
                setItens(data);
                // Cálculo da média de "carga" de todos os itens
                const totalPorcentagem = data.reduce((acc, item) => {
                    const meta = item.quantidade_minima * 3 || 50;
                    return acc + Math.min((item.quantidade_atual / meta) * 100, 100);
                }, 0);
                setMediaGeral(Math.round(totalPorcentagem / data.length) || 0);
            }
        };
        fetchEstoque();
    }, []);

    // Cores dinâmicas para a média
    const getCores = (pct) => {
        if (pct < 30) return { barra: "from-red-500 to-rose-600", texto: "text-red-600", bg: "bg-red-50" };
        if (pct < 60) return { barra: "from-amber-400 to-orange-500", texto: "text-amber-600", bg: "bg-amber-50" };
        return { barra: "from-emerald-400 to-green-500", texto: "text-green-600", bg: "bg-green-50" };
    };

    const coresMedia = getCores(mediaGeral);

    return (
        <>
            {/* 1. COMPONENTE COMPACTO NO DASHBOARD */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-5 flex items-center justify-center flex-col">
                <div className="flex justify-between w-full items-center h-full ">
                    <div className="space-y-2 w-50">
                        <div className="flex justify-between items-end">
                            <span className={`text-xs font-black ${coresMedia.texto}`}>{mediaGeral}%</span>
                            <span className="text-[10px] text-gray-400 font-bold uppercase">Saúde do Estoque</span>
                        </div>

                        <div className="w-full h-4 bg-gray-100 rounded-full border border-gray-200 p-0.5 shadow-inner">
                            <div
                                className={`h-full rounded-full bg-linear-to-r ${coresMedia.barra} transition-all duration-1000`}
                                style={{ width: `${mediaGeral}%` }}
                            ></div>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="text-[10px] font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-2 py-2 cursor-pointer rounded transition-all"
                    >
                        VER DETALHES
                    </button>
                </div>
            </div>

            {/* 2. MODAL DE DETALHES (Exibido ao clicar) */}
            {isModalOpen && (
                <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b flex justify-between items-center bg-slate-50">
                            <h3 className="font-black text-slate-800 uppercase tracking-tight">Níveis por Item</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-red-500 text-xl font-bold">&times;</button>
                        </div>

                        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-6 custom-scrollbar">
                            {itens.map((item, index) => {
                                const meta = item.quantidade_minima * 3 || 50;
                                const pct = Math.min(Math.round((item.quantidade_atual / meta) * 100), 100);
                                const cores = getCores(pct);

                                return (
                                    <div key={index}>
                                        <div className="flex justify-between mb-1">
                                            <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">{item.nome_item}</span>
                                            <span className={`text-[10px] font-black ${cores.texto}`}>{item.quantidade_atual} UN</span>
                                        </div>
                                        <div className="w-full h-3 bg-gray-100 rounded-full border border-gray-100 p-px">
                                            <div
                                                className={`h-full rounded-full bg-linear-to-r ${cores.barra}`}
                                                style={{ width: `${pct}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="p-4 bg-slate-50 text-center">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="w-full py-2 bg-slate-800 text-white rounded-xl font-bold text-sm hover:bg-slate-700 transition-colors"
                            >
                                FECHAR PAINEL
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}