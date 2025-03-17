import { useState, useEffect } from "react";
import api from "@/axiosConfig";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  Clock,
  Calendar,
  Award,
  Lock,
  Fingerprint,
  Layers,
  Star,
} from "lucide-react";

interface SSLCertInfoProps {
  selectedHost: string;
}

interface CertificateInfo {
  success: boolean;
  host: string;
  not_before: string;
  not_after: string;
  days_remaining: number;
  is_valid: boolean;
  status: string;
  issuer?: {
    name: string;
    organization: string;
  };
  signature_algorithm?: string;
  key_bits?: number;
  security_level?: string;
  is_wildcard?: boolean;
  subject_cn?: string;
  is_ev?: boolean;
  error?: string;
}

export function SSLCertInfo({ selectedHost }: SSLCertInfoProps) {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [certInfo, setCertInfo] = useState<CertificateInfo | null>(null);

  useEffect(() => {
    const fetchCertificateInfo = async () => {
      if (!selectedHost) {
        setCertInfo(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await api.get(`/ssl-certificate/${selectedHost}`);
        setCertInfo(response.data);
      } catch (err: any) {
        console.error("Erro ao buscar informações do certificado SSL:", err);
        setError(
          err.response?.data?.error ||
            "Não foi possível obter informações do certificado SSL"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCertificateInfo();
  }, [selectedHost]);

  // Renderizar ícone baseado no status
  const renderStatusIcon = () => {
    if (!certInfo) return null;

    switch (certInfo.status) {
      case "expirado":
        return <ShieldAlert className="h-12 w-12 text-red-500" />;
      case "crítico":
        return <ShieldAlert className="h-12 w-12 text-red-400" />;
      case "atenção":
        return <Shield className="h-12 w-12 text-yellow-400" />;
      case "válido":
        return <ShieldCheck className="h-12 w-12 text-green-500" />;
      default:
        return <Shield className="h-12 w-12 text-gray-400" />;
    }
  };

  // Renderizar classe de cor baseado no status
  const getStatusColorClass = () => {
    if (!certInfo) return "text-gray-500";

    switch (certInfo.status) {
      case "expirado":
        return "text-red-500";
      case "crítico":
        return "text-red-400";
      case "atenção":
        return "text-yellow-500";
      case "válido":
        return "text-green-500";
      default:
        return "text-gray-500";
    }
  };

  // Renderizar classe de cor baseado no nível de segurança
  const getSecurityLevelColorClass = (level?: string) => {
    switch (level) {
      case "Alto":
        return "text-green-500";
      case "Médio":
        return "text-yellow-500";
      case "Baixo":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  return (
    <Card className="overflow-hidden h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium text-center">
          Certificado SSL
        </CardTitle>
        <CardDescription className="text-center">
          Acompanhe o status do certificado SSL do seu host
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-40 text-center gap-2">
            <ShieldAlert className="h-12 w-12 text-red-500" />
            <p className="text-red-500">{error}</p>
          </div>
        ) : !certInfo ? (
          <div className="flex flex-col items-center justify-center h-40 text-center text-gray-500">
            <Shield className="h-12 w-12 mb-2" />
            <p>
              Selecione um host para visualizar as informações do certificado
              SSL
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                {renderStatusIcon()}
                <div>
                  <h3 className="text-lg font-medium">
                    Certificado {certInfo.is_valid ? "Válido" : "Inválido"}
                  </h3>
                  <p className={`text-sm ${getStatusColorClass()}`}>
                    {certInfo.status === "válido"
                      ? `Válido por mais ${certInfo.days_remaining} dias`
                      : certInfo.status === "expirado"
                      ? "Certificado expirado!"
                      : certInfo.status === "crítico"
                      ? `Expira em ${certInfo.days_remaining} dias!`
                      : `Expira em ${certInfo.days_remaining} dias`}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 pt-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Válido a partir de</p>
                  <p className="font-medium">{certInfo.not_before}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Válido até</p>
                  <p className="font-medium">{certInfo.not_after}</p>
                </div>
              </div>
            </div>

            <div className="border-t border-border pt-4 mt-4">
              <h4 className="text-sm font-medium mb-3">Detalhes técnicos</h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {certInfo.issuer && (
                  <div className="flex items-start gap-2">
                    <Award className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Emitido por</p>
                      <p className="font-medium text-sm">
                        {certInfo.issuer.organization}
                      </p>
                    </div>
                  </div>
                )}

                {certInfo.signature_algorithm && (
                  <div className="flex items-start gap-2">
                    <Fingerprint className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Algoritmo</p>
                      <p className="font-medium text-sm">
                        {certInfo.signature_algorithm}
                      </p>
                    </div>
                  </div>
                )}

                {certInfo.key_bits && (
                  <div className="flex items-start gap-2">
                    <Lock className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Tamanho da chave</p>
                      <p className="font-medium text-sm">
                        {certInfo.key_bits} bits
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-2">
                  <Layers className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Tipo</p>
                    <p className="font-medium text-sm">
                      {certInfo.is_ev ? "EV" : "Padrão"}
                      {certInfo.is_wildcard ? ", Wildcard" : ""}
                    </p>
                  </div>
                </div>

                {certInfo.security_level && (
                  <div className="flex items-start gap-2 col-span-full">
                    <Star className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">
                        Nível de segurança
                      </p>
                      <p
                        className={`font-medium text-sm ${getSecurityLevelColorClass(
                          certInfo.security_level
                        )}`}
                      >
                        {certInfo.security_level}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
