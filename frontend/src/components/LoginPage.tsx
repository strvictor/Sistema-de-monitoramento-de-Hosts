import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "./ui/dialog"

import { RegisterForm } from "./RegisterForm";  // Importando o componente RegisterForm

export function LoginPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleLogin = (data: any) => {
    console.log("Login enviado:", data);
  };

  return (
    <div>
        <div>
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline">Edit Profile</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[625px]">
                <DialogHeader>
                <DialogTitle>Edit profile</DialogTitle>
                <DialogDescription>
                    Make changes to your profile here. Click save when you're done.
                </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                    Name
                    </Label>
                    <Input id="name" value="Pedro Duarte" className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="username" className="text-right">
                    Username
                    </Label>
                    <Input id="username" value="@peduarte" className="col-span-3" />
                </div>
                </div>
                <DialogFooter>
                <Button type="submit">Save changes</Button>
                </DialogFooter>
            </DialogContent>
            </Dialog>
        </div>




      <h1 className="text-2xl font-bold text-center mb-4">Login</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleLogin({
            email: e.target.email.value,
            password: e.target.password.value,
          });
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

      {/* O Dialog do ShadCN que agora inclui o RegisterForm */}
      <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <DialogContent  className="sm:max-w-[625px]">
            <RegisterForm />  {/* Exibindo o formulário de cadastro */}
        </DialogContent>
      </Dialog>
    </div>
  );
}
