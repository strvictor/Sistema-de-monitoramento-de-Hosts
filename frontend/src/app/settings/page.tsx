"use client";

import { useState, useEffect } from "react";
import { Bell, Mail } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import api from "@/axiosConfig";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { Separator } from "@/components/ui/separator";

import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

import { AppSidebar } from "../../components/app-sidebar";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface AlertSettings {
  emailAlerts: boolean;
  email: string;
  downTimeThreshold: string;
  responseTimeThreshold: string;
  notifyOnStatus: string[];
}

export default function SettingsPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string>("");
  const [settings, setSettings] = useState<AlertSettings>({
    emailAlerts: false,
    email: "",
    downTimeThreshold: "5",
    responseTimeThreshold: "2000",
    notifyOnStatus: ["500", "502", "503", "504"],
  });

  useEffect(() => {
    // Carregar configurações do usuário
    const loadSettings = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Buscar as configurações do usuário no backend
        const response = await api.get("/settings/");
        if (response.data && response.data.user) {
          setUserEmail(response.data.user.email || "");
        }

        // Atualizar as configurações com os dados do backend
        setSettings({
          ...settings,
          ...response.data,
          // Garantir que sempre tenhamos valores padrão para propriedades que podem estar ausentes
          downTimeThreshold: response.data.downTimeThreshold || "5",
          responseTimeThreshold: response.data.responseTimeThreshold || "2000",
          notifyOnStatus: response.data.notifyOnStatus || [
            "500",
            "502",
            "503",
            "504",
          ],
        });

        setIsLoading(false);
      } catch (error) {
        console.error("Erro ao carregar configurações:", error);
        setError(
          "Falha ao carregar configurações. Por favor, tente novamente mais tarde."
        );
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);

  const handleSaveSettings = async () => {
    // Reiniciar estados
    setError(null);
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      // Enviar configurações para o backend
      const response = await api.post("/settings/", {
        ...settings,
        // Garantir que o email da conta seja usado para as notificações
        email: userEmail,
      });


      // Mostrar feedback de sucesso
      setSaveSuccess(true);

      toast({
        title: "Configurações salvas",
        description:
          "Suas preferências de alerta foram atualizadas com sucesso.",
      });

      // Reset do estado de sucesso após alguns segundos
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (error) {
      console.error("Erro ao salvar configurações:", error);
      setError("Não foi possível salvar suas configurações. Tente novamente.");

      toast({
        title: "Erro ao salvar",
        description:
          "Não foi possível salvar suas configurações. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (error) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="flex flex-col items-center justify-center min-h-screen">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardDescription className="text-red-500">Erro</CardDescription>
              </CardHeader>
              <CardContent>
                <p>{error}</p>
                <Button
                  className="mt-4"
                  onClick={() => window.location.reload()}
                >
                  Tentar Novamente
                </Button>
              </CardContent>
            </Card>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <h1 className="text-2xl font-bold">Configurações</h1>
          </div>
          <div className="flex items-center gap-4 ml-auto px-4">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href="/cadastro-host">Hosts</BreadcrumbLink>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <div className="flex flex-1 flex-col p-4 pt-0">
          <div className="min-h-[100vh] flex-1 rounded-xl bg-background md:min-h-min p-4">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <p>Carregando configurações...</p>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Alertas e Notificações
                  </h2>
                  <div className="flex items-center gap-2">
                    {saveSuccess && (
                      <div className="text-green-500 flex items-center gap-1 animate-fade-in">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        <span>Salvo com sucesso!</span>
                      </div>
                    )}
                    <Button onClick={handleSaveSettings} disabled={isSaving}>
                      {isSaving ? (
                        <>
                          <svg
                            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Salvando...
                        </>
                      ) : (
                        "Salvar Alterações"
                      )}
                    </Button>
                  </div>
                </div>

                <Card>
                  <CardHeader>
                    <CardDescription>
                      Configure como e quando você deseja receber alertas sobre
                      seus hosts
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Email Alerts */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-base">Alertas por Email</Label>
                          <p className="text-sm text-muted-foreground">
                            Receba notificações por email quando houver
                            problemas
                          </p>
                        </div>
                        <Switch
                          checked={settings.emailAlerts}
                          onCheckedChange={(checked) =>
                            setSettings({ ...settings, emailAlerts: checked })
                          }
                        />
                      </div>

                      {settings.emailAlerts && (
                        <div className="p-3 bg-muted rounded-md">
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <p className="text-sm">
                              Alertas serão enviados para{" "}
                              <span className="font-medium">
                                {userEmail || "seu email de login"}
                              </span>
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Alert Thresholds */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">
                        Limites para Alertas
                      </h3>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="downtime">
                            Tempo de Inatividade (minutos)
                          </Label>
                          <Input
                            id="downtime"
                            type="number"
                            min="1"
                            value={settings.downTimeThreshold}
                            onChange={(e) =>
                              setSettings({
                                ...settings,
                                downTimeThreshold: e.target.value,
                              })
                            }
                          />
                          <p className="text-sm text-muted-foreground">
                            Alerta após X minutos offline
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="responsetime">
                            Tempo de Resposta (milissegundos)
                          </Label>
                          <Input
                            id="responsetime"
                            type="number"
                            min="100"
                            value={settings.responseTimeThreshold}
                            onChange={(e) =>
                              setSettings({
                                ...settings,
                                responseTimeThreshold: e.target.value,
                              })
                            }
                          />
                          <p className="text-sm text-muted-foreground">
                            Alerta se resposta maior que X ms
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Status Codes */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Códigos de Status</h3>
                      <div className="space-y-2">
                        <Label>Notificar para os status</Label>
                        <div className="flex flex-wrap gap-2">
                          {["500", "502", "503", "504"].map((status) => {
                            const isSelected =
                              settings.notifyOnStatus.includes(status);
                            return (
                              <Button
                                key={status}
                                type="button"
                                className={
                                  isSelected
                                    ? undefined
                                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                                }
                                onClick={() => {
                                  const newStatus = isSelected
                                    ? settings.notifyOnStatus.filter(
                                        (s) => s !== status
                                      )
                                    : [...settings.notifyOnStatus, status];
                                  setSettings({
                                    ...settings,
                                    notifyOnStatus: newStatus,
                                  });
                                }}
                              >
                                {status}
                              </Button>
                            );
                          })}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Selecione os códigos de status que devem gerar alertas
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
