import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

async function seed() {
  try {
    console.log("🌱 Iniciando o seed do banco de dados...");

    // 1. Create Owners
    console.log("Criando Tutores...");
    const timestamp = Date.now();
    const owner1 = await api.post("/owners", {
      first_name: "João",
      last_name: "Silva",
      email: `joao.silva.${timestamp}@email.com`,
    });
    console.log("✅ Tutores criados");

    // 2. Create Patients
    console.log("Criando Pacientes...");
    const patient1 = await api.post("/patients", {
      name: "Max",
      species: "Cachorro",
      breed: "Golden Retriever",
      age_years: 5,
      weight_kg: 33.5,
      owner_id: owner1.data.id,
    });
    console.log("✅ Pacientes criados");

    // 3. Create Measures
    console.log("Criando Medidas...");
    const measureHR = await api.post("/measures", {
      name: "Frequência Cardíaca",
      unit: "bpm",
      data_type: "number",
    });
    const measureRR = await api.post("/measures", {
      name: "Frequência Respiratória",
      unit: "rpm",
      data_type: "number",
    });
    const measureTemp = await api.post("/measures", {
      name: "Temperatura",
      unit: "°C",
      data_type: "number",
    });
    const measureMucosa = await api.post("/measures", {
      name: "Mucosas",
      data_type: "select",
      options: ["Rosadas", "Pálidas", "Cianóticas", "Ictéricas"],
    });
    console.log("✅ Medidas criadas");

    // 4. Create Templates
    console.log("Criando Modelos...");
    const templateAnesthesia = await api.post("/templates", {
      name: "Monitoramento Anestésico",
      description: "Protocolo padrão de monitoramento anestésico",
      measure_ids: [
        measureHR.data.id,
        measureRR.data.id,
        measureTemp.data.id,
        measureMucosa.data.id,
      ],
    });
    console.log("✅ Modelos criados");

    // 5. Create Treatment Sessions
    console.log("Criando Sessões de Tratamento...");
    const session1 = await api.post("/sessions", {
      patient_id: patient1.data.id,
      template_id: templateAnesthesia.data.id,
      status: "active",
      notes: "Limpeza dental de rotina",
    });
    console.log("✅ Sessões de Tratamento criadas");

    // 6. Create Treatment Logs
    console.log("Criando Registros de Tratamento...");
    await api.post(`/sessions/${session1.data.id}/logs`, {
      notes: "Indução",
      values: [
        { measure_id: measureHR.data.id, value: "125" },
        { measure_id: measureRR.data.id, value: "22" },
        { measure_id: measureTemp.data.id, value: "38.5" },
        { measure_id: measureMucosa.data.id, value: "Rosadas" },
      ],
    });

    await api.post(`/sessions/${session1.data.id}/logs`, {
      notes: "Manutenção - 15 min",
      values: [
        { measure_id: measureHR.data.id, value: "115" },
        { measure_id: measureRR.data.id, value: "18" },
        { measure_id: measureTemp.data.id, value: "38.2" },
        { measure_id: measureMucosa.data.id, value: "Rosadas" },
      ],
    });
    console.log("✅ Registros de Tratamento criados");

    console.log("🎉 Banco de dados populado com sucesso!");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("❌ Erro ao popular o banco de dados:", error.message);
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.error("Sem resposta recebida:", error.request);
    } else {
      console.error("Detalhes do erro:", error);
    }
  }
}

seed();
