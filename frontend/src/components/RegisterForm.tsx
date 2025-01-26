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

export function RegisterForm() {
//   const handleRegister = (data: any) => {
//     console.log("Cadastro enviado:", data);
//   };

  return (
    <div>
       <DialogHeader>
        <div className="flex flex-col w-auto text-center gap-1.5">
          <DialogTitle className="text-2xl">Cadastro</DialogTitle>
            <DialogDescription>
              Faça seu cadastro aqui. É simples e Seguro!
            </DialogDescription>
        </div>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-2">
            <Label htmlFor="name">Nome</Label>
            <Input id="name" placeholder="Digite seu nome" type="text" className="col-span-4" required/>
        </div>
        <div className="grid grid-cols-4 items-center gap-2">
          <Label htmlFor="email">E-mail</Label>
          <Input id="email" placeholder="Seu melhor e-mail" type="email" className="col-span-4" required/>
        </div>
        <div className="grid grid-cols-4 items-center gap-2">
          <Label htmlFor="email">Senha:</Label>
          <Input id="password" placeholder="Crie uma senha" type="password" className="col-span-4" minLength={8} required/>
        </div>
        <div className="grid grid-cols-4 items-center gap-2">
          <Label htmlFor="email">Confirme sua senha:</Label>
          <Input id="password" placeholder="Confirma a sua senha" type="password" className="col-span-4" minLength={8} required/>
        </div>
      </div>
    
      <DialogFooter className="w-full">
          <Button type="submit" className="w-full">Criar Conta</Button>
      </DialogFooter>
    </div>
  );
}
