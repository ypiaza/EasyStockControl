import { useState } from 'react';
import { supabase } from '../data/supabaseClient';

export default function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) alert(error.message);
    else onLoginSuccess(data.user);
    
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <form onSubmit={handleLogin} className=" p-8 w-96">
      <h2 className="text-2xl font-bold mb-15 text-center text-zinc-800">Easy Stock Control</h2>
        <input 
          type="email" 
          placeholder="Seu e-mail" 
          className="w-full p-3 border rounded-lg mb-4"
          value={email} onChange={e => setEmail(e.target.value)}
        />
        <input 
          type="password" 
          placeholder="Sua senha" 
          className="w-full p-3 border rounded-lg mb-6"
          value={password} onChange={e => setPassword(e.target.value)}
        />
        <button className="w-full bg-blue-600 text-white p-3 rounded-lg font-bold hover:bg-blue-700 hover:scale-101 cursor-pointer transition-all duration-200">
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}