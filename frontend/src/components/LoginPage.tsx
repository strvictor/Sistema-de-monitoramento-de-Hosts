import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Dialog, DialogContent } from "./ui/dialog"
import axios from 'axios';

import { RegisterForm } from "./RegisterForm";  // Importando o componente RegisterForm

export function LoginPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (data: { email: string; password: string }) => {
    try {
      const response = await axios.post('https://seu-endpoint-de-login.com/api/login', data);
      console.log("Login bem-sucedido:", response.data);
      // Faça algo com a resposta, como salvar o token ou redirecionar o usuário
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      console.log('erro!!!!!')
      // Trate o erro, como mostrar uma mensagem de erro ao usuário
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-center mb-4">Login</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleLogin({ email, password });
        }}
        className="space-y-4"
      >
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">
            Email
          </label>
          <Input
            id="email"
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Digite seu email"
            className="border border-gray-300"
            required
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-1">
            Senha
          </label>
          <Input
            id="password"
            type="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Digite sua senha"
            className="border border-gray-300"
            required
          />
        </div>
        <Button type="submit" className="w-full">
          Login
        </Button>
      </form>

      <div className="text-center mt-4">
        <p>Não tem uma conta? </p>
        <Button
          variant="link"
          onClick={() => setIsModalOpen(true)}
          className="text-blue-500 underline"
        >
        Cadastre-se agora!
        </Button>
      </div>

      <Dialog open={isModalOpen} onOpenChange={() => setIsModalOpen(false)}>
        <DialogContent  className="sm:max-w-[625px]">
            <RegisterForm /> 
        </DialogContent>
      </Dialog>
    </div>
  );
}
