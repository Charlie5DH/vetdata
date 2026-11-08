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
import { Spinner } from "@/components/ui/spinner";
import { CheckIcon, OwnerIcon } from "@/components/icons/vetdata-icons";
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
    <PageLayout title="Novo tutor">
      <form onSubmit={handleSubmit} className="w-full max-w-3xl">
        <Card className="gap-0 py-0">
          <CardHeader className="border-b py-4">
            <div className="flex items-center gap-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-mint-300 text-forest-900">
                <OwnerIcon size={16} />
              </span>
              <div className="flex flex-col gap-0.5">
                <CardTitle className="text-base">Informações pessoais</CardTitle>
                <CardDescription>
                  Dados de identificação e contato do tutor
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="py-5">
            <div className="grid grid-cols-1 gap-x-4 gap-y-3 md:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="firstName">Nome *</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Digite o nome..."
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="lastName">Sobrenome *</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Digite o sobrenome..."
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(00) 00000-0000"
                  className="tabular-nums"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="cpf">CPF</Label>
                <Input
                  id="cpf"
                  value={cpf}
                  onChange={(e) => setCpf(e.target.value)}
                  placeholder="000.000.000-00"
                  className="tabular-nums"
                />
              </div>

              <div className="flex flex-col gap-1.5 md:col-span-2">
                <Label htmlFor="email">E-mail *</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="exemplo@email.com"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  * Campos obrigatórios
                </p>
              </div>
            </div>
          </CardContent>
          <div className="flex items-center justify-end gap-2 border-t border-border px-5 py-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate(-1)}
              disabled={createOwner.isPending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="cta"
              disabled={!canSubmit}
              className="min-w-32"
            >
              {createOwner.isPending ? (
                <>
                  <Spinner />
                  Criando...
                </>
              ) : (
                <>
                  <CheckIcon />
                  Criar tutor
                </>
              )}
            </Button>
          </div>
        </Card>
      </form>
    </PageLayout>
  );
}
