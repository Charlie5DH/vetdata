import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCreateOwner } from "@/api/owners";
import { PageLayout } from "@/components/layout/page-layout";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { themeAccentClasses } from "@/lib/theme-styles";
import { IconUser, IconLoader2, IconCheck } from "@tabler/icons-react";
import { toast } from "sonner";

export default function TutorCreate() {
  const navigate = useNavigate();
  const createOwner = useCreateOwner();

  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [cpf, setCpf] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!firstName || !lastName || !email) {
      toast.error("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Por favor, insira um e-mail válido.");
      return;
    }

    try {
      const newOwner = await createOwner.mutateAsync({
        first_name: firstName,
        last_name: lastName,
        email: email,
        phone: phone || undefined,
        cpf: cpf || undefined,
      });

      toast.success("Tutor criado com sucesso!");
      navigate(`/tutors/${newOwner.id}`);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao criar tutor. Tente novamente.");
    }
  };

  const canSubmit = firstName && lastName && email && !createOwner.isPending;

  return (
    <PageLayout title="Novo Tutor">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div
                className={`rounded-lg p-2 ${themeAccentClasses.chart5.icon}`}
              >
                <IconUser className="h-5 w-5" />
              </div>
              <div>
                <CardTitle>Informações Pessoais</CardTitle>
                <CardDescription>
                  Dados de identificação e contato do tutor
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="firstName">Nome *</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Digite o nome..."
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Sobrenome *</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Digite o sobrenome..."
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(00) 00000-0000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cpf">CPF</Label>
                <Input
                  id="cpf"
                  value={cpf}
                  onChange={(e) => setCpf(e.target.value)}
                  placeholder="000.000.000-00"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="email">E-mail *</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="exemplo@email.com"
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
                disabled={createOwner.isPending}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={!canSubmit} className="min-w-32">
                {createOwner.isPending ? (
                  <>
                    <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                    Criando...
                  </>
                ) : (
                  <>
                    <IconCheck className="mr-2 h-4 w-4" />
                    Criar Tutor
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </PageLayout>
  );
}
