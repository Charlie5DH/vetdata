# Documentação do Projeto VetData

Este projeto consiste em uma aplicação para veterinários gerenciarem tratamentos e procedimentos, fornecendo fichas (templates) prontas e permitindo a coleta de medidas ao longo do tempo.

O sistema foca em flexibilidade, permitindo a criação de novos modelos (templates) de tratamento e medidas personalizadas.

---

## Estrutura do Sistema (C4 Model - Contexto)

O diagrama abaixo ilustra o contexto do sistema, seus usuários e o banco de dados.

```mermaid
flowchart TD
    %% Estilos
    classDef person fill:#08427b,stroke:#052e56,color:#fff,stroke-width:2px,rx:10,ry:10;
    classDef system fill:#1168bd,stroke:#0b4884,color:#fff,stroke-width:2px,rx:10,ry:10;
    classDef db fill:#2f85e9,stroke:#1168bd,color:#fff,stroke-width:2px,rx:10,ry:10;
    classDef ext fill:#999,stroke:#666,color:#fff,stroke-width:2px,rx:10,ry:10;

    subgraph Users ["Usuários"]
        direction TB
        vet("👤 Veterinário<br/><small>Gerencia tratamentos</small>"):::person
        admin("👤 Administrador<br/><small>Gerencia templates</small>"):::person
    end

    subgraph SystemContext ["Sistema Veterinário"]
        direction TB
        vetApp("💻 Aplicação Veterinária<br/><small>Gestão de fichas e logs</small>"):::system
        database[("🗄️ Banco de Dados<br/><small>PostgreSQL</small>")]:::db
    end

    %% Relacionamentos
    vet -->|Usa - HTTPS| vetApp
    admin -->|Configura - HTTPS| vetApp
    vetApp -->|Lê/Escreve - SQL| database
```

---

## Esquema do Banco de Dados

O esquema atual foi desenhado para suportar a flexibilidade de templates e medidas dinâmicas. Abaixo está o diagrama de Entidade-Relacionamento (ER) seguido pela descrição detalhada das tabelas.

### Diagrama ER

```mermaid
erDiagram
    Tutores ||--|{ patients : "possui"
    patients ||--|{ treatment_sessions : "tem"
    templates ||--|{ treatment_sessions : "define"
    templates ||--|{ template_measures : "contém"
    measures ||--|{ template_measures : "usada em"
    treatment_sessions ||--|{ treatment_logs : "possui"
    treatment_logs ||--|{ log_values : "contém"
    measures ||--|{ log_values : "referencia"

    Tutores {
        uuid id PK
        text first_name
        text last_name
        text email
        timestamptz created_at
    }

    patients {
        uuid id PK
        text name
        text species
        text breed
        int age_years
        int age_months
        numeric weight_kg
        uuid owner_id FK
        text notes
        timestamptz created_at
    }

    templates {
        uuid id PK
        text name
        text description
        timestamptz created_at
    }

    measures {
        uuid id PK
        text name
        text unit
        text data_type
        jsonb options
        timestamptz created_at
    }

    template_measures {
        uuid id PK
        uuid template_id FK
        uuid measure_id FK
        int display_order
    }

    treatment_sessions {
        uuid id PK
        uuid patient_id FK
        uuid template_id FK
        text status
        timestamptz started_at
        timestamptz completed_at
        text notes
    }

    treatment_logs {
        uuid id PK
        uuid treatment_session_id FK
        timestamptz logged_at
        text notes
    }

    log_values {
        uuid id PK
        uuid treatment_log_id FK
        uuid measure_id FK
        text value
    }
```

### Detalhamento das Tabelas

Abaixo descrevemos o propósito de cada tabela e seus principais campos.

#### 1. `owners` (Proprietários/Tutores)

Armazena as informações das pessoas ou entidades responsáveis pelos animais.

- **id**: Identificador único.
- **first_name**, **last_name**: Nome do responsável.
- **email**: Contato principal.

#### 2. `patients` (Pacientes)

Armazena os dados dos animais atendidos.

- **id**: Identificador único.
- **owner_id**: Chave estrangeira ligando ao dono/proprietário.
- **species**, **breed**: Espécie e raça do animal.
- **age_years**, **age_months**: Idade detalhada.
- **weight_kg**: Peso do animal.

#### 3. `templates` (Modelos de Tratamento)

Define os tipos de tratamento disponíveis (ex: "Transfusão Sanguínea").

- **id**: Identificador único.
- **name**: Nome do tratamento.
- **description**: Descrição do procedimento.

#### 4. `measures` (Medidas)

Biblioteca de medidas que podem ser coletadas (ex: "Frequência Cardíaca", "Temperatura").

- **id**: Identificador único.
- **name**: Nome da medida.
- **unit**: Unidade de medida (ex: "bpm", "°C").
- **data_type**: Tipo do dado (texto, número, booleano, opção).
- **options**: Opções válidas se o tipo for seleção.

#### 5. `template_measures` (Medidas do Modelo)

Tabela de ligação que define quais medidas compõem um determinado template.

- **template_id**: O template.
- **measure_id**: A medida incluída.
- **display_order**: A ordem em que esta coluna aparece na ficha.

#### 6. `treatment_sessions` (Sessões de Tratamento)

Representa uma ficha "ativa" de um tratamento sendo aplicado a um paciente.

- **patient_id**: O paciente recebendo o tratamento.
- **template_id**: O modelo de tratamento sendo seguido.
- **status**: Estado atual (ex: "Em andamento", "Finalizado").

#### 7. `treatment_logs` (Registros/Linhas)

Cada entrada nesta tabela representa um momento no tempo onde medições foram feitas (uma linha na tabela do frontend).

- **treatment_session_id**: A sessão a qual este registro pertence.
- **logged_at**: Data e hora da medição.
- **notes**: Observações gerais sobre este momento.

#### 8. `log_values` (Valores)

Armazena o valor específico de uma medida em um determinado registro (uma célula na tabela do frontend).

- **treatment_log_id**: O registro temporal.
- **measure_id**: Qual medida está sendo registrada.
- **value**: O valor coletado (armazenado como texto para flexibilidade).

---

## Relacionamentos e Fluxo de Dados

Esta seção detalha como as tabelas interagem para suportar o fluxo de trabalho da clínica.

### 1. Gestão de Pacientes (`owners` ↔ `patients`)

- **Relacionamento**: Um para Muitos (1:N).
- **Explicação**: Um tutor (`owners`) pode ter vários animais (`patients`), mas cada animal pertence a apenas um responsável principal no cadastro.

### 2. Definição de Fichas (`templates` ↔ `measures`)

- **Relacionamento**: Muitos para Muitos (M:N), resolvido pela tabela `template_measures`.
- **Explicação**:
  - Um **Template** (ex: Transfusão) é composto por várias **Medidas** (ex: Frequência Cardíaca, Pressão).
  - Uma mesma **Medida** (ex: Frequência Cardíaca) pode ser reutilizada em diferentes Templates (ex: Anestesia, Transfusão).
  - A tabela `template_measures` une os dois, permitindo definir a ordem específica (`display_order`) das colunas para cada ficha.

### 3. Aplicação do Tratamento (`treatment_sessions`)

- **Relacionamento**: Conecta `patients` e `templates`.
- **Explicação**: Quando um médico inicia um tratamento, cria-se uma **Sessão** ligando um Paciente específico a um Template. Isso cria a "instância" da ficha para aquele animal.

### 4. Coleta de Dados (`treatment_sessions` ↔ `treatment_logs` ↔ `log_values`)

- **Estrutura Hierárquica**:
  1. **Sessão** (`treatment_sessions`): O documento do tratamento completo.
  2. **Log/Linha** (`treatment_logs`): Um registro temporal (ex: medição feita às 10:00). Uma Sessão terá muitos Logs ao longo do tempo (1:N).
  3. **Valor/Célula** (`log_values`): O dado individual. Um Log terá vários Valores (1:N), um para cada medida configurada no template.
- **Metadados**: Cada `log_value` aponta diretamente para a definição da `measure`, garantindo integridade e permitindo saber que o valor "120" refere-se a "BPM", por exemplo.

---

## Exemplo Visual com Dados (Instâncias)

Para facilitar o entendimento de como os dados se conectam na prática, o diagrama abaixo simula **uma linha** de cada tabela para um cenário real:
_O cachorro **Thor**, da tutora **Ana**, passando por uma **Anestesia**, onde foi medido **110 bpm** de Frequência Cardíaca às **10:15**._

```mermaid
flowchart LR
    %% Estilos para diferenciar os tipos de dados
    classDef master fill:#e1f5fe,stroke:#01579b,color:#000;
    classDef config fill:#f3e5f5,stroke:#4a148c,color:#000;
    classDef trans fill:#fff3e0,stroke:#e65100,color:#000;

    subgraph Config ["Configuração (Admin)"]
        direction TB
        Template["<b>templates</b><br/>id: TPL-01<br/>nome: Anestesia"]:::config
        MeasureA["<b>measures</b><br/>id: MEA-01<br/>nome: Freq. Cardíaca<br/>unidade: bpm"]:::config
        TplMeasure["<b>template_measures</b><br/>template_id: TPL-01<br/>measure_id: MEA-01<br/>ordem: 1"]:::config

        Template --> TplMeasure
        MeasureA --> TplMeasure
    end

    subgraph Cadastro ["Cadastros Básicos"]
        direction TB
        Owner["<b>owners</b><br/>id: OWN-99<br/>nome: Ana Souza"]:::master
        Patient["<b>patients</b><br/>id: PAT-50<br/>nome: Thor<br/>espécie: Cão"]:::master

        Owner --> Patient
    end

    subgraph Operacao ["Operação (Dia a Dia)"]
        direction TB
        Session["<b>treatment_sessions</b><br/>id: SES-200<br/>paciente: PAT-50<br/>template: TPL-01<br/>status: Em andamento"]:::trans
        Log["<b>treatment_logs</b><br/>id: LOG-500<br/>sessão: SES-200<br/>hora: 10:15"]:::trans
        Value["<b>log_values</b><br/>id: VAL-999<br/>log: LOG-500<br/>medida: MEA-01<br/>valor: '110'"]:::trans

        Patient -.-> Session
        Template -.-> Session
        Session --> Log
        Log --> Value
        MeasureA -.-> Value
    end
```

---

## Protótipos (Wireframes)

Abaixo estão os esboços da interface do usuário para as principais funcionalidades.

![Wireframe](./docs/images/wireframe.png)
