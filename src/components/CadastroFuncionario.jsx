import { useEffect, useState } from 'react';
import { supabase } from '../data/supabaseClient'; // O arquivo de conexão que criamos
import ListaFuncionarios from './ListaFuncionarios';

export default function CadastroFuncionario() {
  const [nome, setNome] = useState('');
  const [cargo, setCargo] = useState('');
  const [loading, setLoading] = useState(false);
  const [funcionarios, setFuncionarios] = useState([]);

  const handleCadastro = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase
      .from('funcionarios')
      .insert([
        { nome: nome, cargo: cargo, ativo: true }
      ]);

    if (error) {
      alert("Erro ao cadastrar: " + error.message);
    } else {
      alert("Funcionário cadastrado com sucesso!");
      setNome('');
      setCargo('');
    }
    setLoading(false);
  };

  useEffect(() => {
    const buscarFuncionarios = async () => {
      try {
        const response = await fetch(supabase)

        if(!response.ok) {
          throw new Error('Erro ao buscar funcionários')
        }

        const dados = await response.json();
        setFuncionarios(dados)
      } catch (err) {
        setErro(err.message);
      } 
    }
    console.log(funcionarios)
    buscarFuncionarios()
  }, [])

  return (
    <div className="p-5 w-full grid grid-cols-1 md:grid-cols-2 gap-2 items-start mt-5">
      
      <form onSubmit={handleCadastro}
            className='w-full'>
      <h2 style={{ color: '#333' }}>Novo Funcionário</h2>
        <div style={{ marginBottom: '10px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Nome Completo:</label>
          <input 
            type="text" 
            placeholder="Ex: João Silva"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
            style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Cargo / Função:</label>
          <input 
            type="text" 
            placeholder="Ex: Operador de Máquina"
            value={cargo}
            onChange={(e) => setCargo(e.target.value)}
            required
            style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          style={{ 
            width: '100%', 
            padding: '12px', 
            backgroundColor: '#28a745', 
            color: 'white', 
            border: 'none', 
            borderRadius: '5px', 
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          {loading ? 'Salvando...' : 'Cadastrar Funcionário'}
        </button>
      </form>
        <ListaFuncionarios />
    </div>
  )}