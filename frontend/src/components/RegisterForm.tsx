import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { AlertDescription, AlertTitle } from "./ui/alert";
import axios from "axios";
import {
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

export function RegisterForm() {
  // Estados para armazenar os valores do formulário
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmedpassword, setConfirmedpassword] = useState("");
  const [alert, setAlert] = useState({ type: "", message: "" });

  // Função para lidar com o registro
  const handleRegister = async () => {
    if (password !== confirmedpassword) {
      setAlert({ type: "error", message: "As senhas não coincidem!" });
      setTimeout(() => setAlert({ type: "", message: "" }), 6000);
      return;
    }

    try {
      const data = {
        name: nome,
        email: email,
        password: password,
      };

      const response = await axios.post(
        "http://localhost:8000/api/create-account/",
        data
      );

      console.log("Usuário registrado com sucesso:", response.data);
      setAlert({
        type: "success",
        message: "Conta criada com sucesso! Redirecionando...",
      });

      setTimeout(() => {
        window.location.href = "/login";
      }, 3500);
    } catch (error: any) {
      console.error("Erro ao registrar o usuário:", error.response?.data || error.message);
      setAlert({
        type: "error",
        message: error.response?.data?.error || error.response?.data,
      });
      setTimeout(() => setAlert({ type: "", message: "" }), 8000);
    }
  };

  return (
    <div className="relative">
      {/* Alerta de sucesso ou erro */}
      {alert.type && (
        <div
          className={`mb-4 mt-4 transition-all duration-500 ease-in-out p-4 rounded ${
            alert.type === "success"
              ? "bg-green-50 text-green-600"
              : "bg-red-50 text-red-600"
          }`}
        >
          <AlertTitle>
            {alert.type === "success" ? "Sucesso!" : "Erro!"}
          </AlertTitle>
          <AlertDescription>{alert.message}</AlertDescription>
        </div>
      )}

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
