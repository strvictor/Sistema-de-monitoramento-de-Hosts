import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import axios from "axios";

import {
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

export function RegisterForm() {
  // Estados para armazenar os valores do formulário
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmedpassword, setConfirmedpassword] = useState('');

  // Função para lidar com o registro
  const handleRegister = async () => {
    if (password !== confirmedpassword) {
      console.error("As senhas não coincidem!");
      return;
    }

    try {
      // Dados que serão enviados ao backend
      const data = {
        name: nome,
        email: email,
        password: password,
      };

      // Requisição POST para o endpoint de criação de conta
      const response = await axios.post('http://localhost:8000/api/create-account/', data);

      // Resposta bem-sucedida
      console.log("Usuário registrado com sucesso:", response.data);

      // Você pode redirecionar ou exibir uma mensagem de sucesso
      // Exemplo: window.location.href = "/login";
    } catch (error: any) {
      console.error("Erro ao registrar o usuário:", error.response?.data || error.message);
    }
  };

  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleRegister(); // Chama a função de registro ao enviar o formulário
        }}
        className="space-y-4"
      >
        <DialogHeader>
          <div className="flex flex-col w-auto text-center gap-1.5">
            <DialogTitle className="text-2xl">Cadastro</DialogTitle>
            <DialogDescription>
              Faça seu cadastro aqui. É simples e seguro!
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-2">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              placeholder="Digite seu nome"
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="col-span-4"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              placeholder="Seu melhor e-mail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="col-span-4"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              placeholder="Crie uma senha"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="col-span-4"
              minLength={8}
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-2">
            <Label htmlFor="confirmedpassword">Confirme sua senha</Label>
            <Input
              id="confirmedpassword"
              placeholder="Confirme sua senha"
              type="password"
              value={confirmedpassword}
              onChange={(e) => setConfirmedpassword(e.target.value)}
              className="col-span-4"
              minLength={8}
              required
            />
          </div>
        </div>

        <DialogFooter className="w-full">
          <Button type="submit" className="w-full">
            Criar Conta
          </Button>
        </DialogFooter>
      </form>
    </div>
  );
}
