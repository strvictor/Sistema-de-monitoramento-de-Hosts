import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Dialog, DialogContent } from "./ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { useNavigate } from "react-router-dom";
import api from "../axiosConfig";
import { RegisterForm } from "./RegisterForm";
import { Server, Shield, Activity, BarChart2, Lock, Mail } from "lucide-react";

export function LoginPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (data: { username: string; password: string }) => {
    try {
      const response = await api.post("token/", data);

      // Pegando o token JWT (access e refresh)
      const { access, refresh } = response.data;

      // Salvando os tokens no localStorage
      localStorage.setItem("accessToken", access);
      localStorage.setItem("refreshToken", refresh);

      console.log("Login bem-sucedido, tokens armazenados!");
      console.log(access);
      console.log(refresh);

      navigate("/dashboard"); // Redireciona para a página Dashboard
    } catch (error: any) {
      console.error(
        "Erro ao fazer login:",
        error.response?.data || error.message
      );
      const errorAlert = document.getElementById("card-error");
      if (errorAlert) {
        errorAlert.classList.remove("hidden");
      }
    }
  };

  return (
    <div className="flex h-screen w-full">
      {/* Lado Esquerdo - Conteúdo Visual (70%) */}
      <div className="flex w-[60%] bg-gray-900 text-white p-8 flex-col justify-between relative overflow-hidden">
        {/* Padrão de Grade no Background */}
        <div className="absolute inset-0 z-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(rgba(255,255,255,0.4) 1px, transparent 1px)",
              backgroundSize: "30px 30px",
            }}
          ></div>
        </div>

        {/* Círculos coloridos animados */}
        <div className="absolute -bottom-16 -left-16 w-72 h-72 bg-blue-500 rounded-full mix-blend-overlay filter blur-xl opacity-40 animate-blob z-0"></div>
        <div className="absolute -top-16 -right-16 w-72 h-72 bg-green-500 rounded-full mix-blend-overlay filter blur-xl opacity-40 animate-blob animation-delay-2000 z-0"></div>
        <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-purple-500 rounded-full mix-blend-overlay filter blur-xl opacity-40 animate-blob animation-delay-4000 z-0"></div>

        {/* Conteúdo Sobreposto */}
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-1">
            Sistema de Monitoramento de Hosts
          </h1>
          <p className="text-gray-300 text-lg mb-8">
            Monitore seus serviços em tempo real com análises detalhadas e
            alertas inteligentes.
          </p>
        </div>

        {/* Features do Sistema */}
        <div className="grid grid-cols-2 gap-6 relative z-10">
          <div className="flex items-start space-x-3">
            <div className="bg-gray-800 p-2 rounded-lg">
              <Activity className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <h3 className="font-medium text-white">
                Monitoramento em Tempo Real
              </h3>
              <p className="text-gray-400 text-sm">
                Acompanhe o desempenho dos seus hosts com métricas atualizadas
                em tempo real.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="bg-gray-800 p-2 rounded-lg">
              <BarChart2 className="h-6 w-6 text-green-400" />
            </div>
            <div>
              <h3 className="font-medium text-white">Análises Detalhadas</h3>
              <p className="text-gray-400 text-sm">
                Visualize estatísticas e gráficos para identificar padrões e
                problemas potenciais.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="bg-gray-800 p-2 rounded-lg">
              <Server className="h-6 w-6 text-purple-400" />
            </div>
            <div>
              <h3 className="font-medium text-white">Múltiplos Hosts</h3>
              <p className="text-gray-400 text-sm">
                Gerencie todos os seus servidores e endpoints em uma única
                interface.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="bg-gray-800 p-2 rounded-lg">
              <Shield className="h-6 w-6 text-red-400" />
            </div>
            <div>
              <h3 className="font-medium text-white">Certificados SSL</h3>
              <p className="text-gray-400 text-sm">
                Monitore a validade e segurança dos certificados SSL dos seus
                hosts.
              </p>
            </div>
          </div>
        </div>

        <div className="relative z-10 mt-12">
          <p className="text-gray-400 text-sm text-center">
            © 2025 Sistema de Monitoramento. Todos os direitos reservados.
          </p>
        </div>
      </div>

      {/* Lado Direito - Formulário de Login (30%) */}
      <div className="w-[40%] flex items-center justify-center p-8 bg-black">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-1">
              Bem-vindo(a) de volta
            </h2>
            <p className="text-gray-400">Acesse sua conta para continuar</p>
          </div>

          <Alert
            id="card-error"
            className="mb-4 mt-4 hidden border-red-800 bg-red-950"
          >
            <AlertTitle className="text-red-400">
              Ops, tivemos um problema!
            </AlertTitle>
            <AlertDescription className="text-red-100">
              E-mail ou senha inválidos.
            </AlertDescription>
          </Alert>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleLogin({ username, password });
            }}
            className="space-y-6 mt-8"
          >
            <div className="space-y-2">
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                E-mail
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-500" />
                </div>
                <Input
                  id="username"
                  type="email"
                  name="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Digite seu e-mail"
                  className="pl-10 bg-gray-900 border-gray-700 text-white w-full"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                Senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-500" />
                </div>
                <Input
                  id="password"
                  type="password"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite sua senha"
                  className="pl-10 bg-gray-900 border-gray-700 text-white w-full"
                  minLength={8}
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md transition-colors"
            >
              Entrar
            </Button>
          </form>

          <div className="text-center mt-6">
            <p className="text-gray-400">Não tem uma conta?</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="text-blue-400 hover:text-blue-300 font-medium mt-1"
            >
              Cadastre-se agora!
            </button>
          </div>
        </div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[700px] bg-gray-900 text-white border-gray-700">
          <RegisterForm />
        </DialogContent>
      </Dialog>
    </div>
  );
}
