import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

async function migrate() {
  try {
    console.log("🐕 Criando paciente Caramelo...");

    // Get or create owner
    console.log("Buscando tutores existentes...");
    const ownersResponse = await api.get("/owners");
    let ownerId;

    if (ownersResponse.data.length > 0) {
      ownerId = ownersResponse.data[0].id;
      console.log(
        `✅ Usando tutor existente: ${ownersResponse.data[0].first_name}`
      );
    } else {
      const newOwner = await api.post("/owners", {
        first_name: "Maria",
        last_name: "Santos",
        email: `maria.santos.${Date.now()}@email.com`,
      });
      ownerId = newOwner.data.id;
      console.log("✅ Novo tutor criado");
    }

    // Create patient Caramelo
    const caramelo = await api.post("/patients", {
      name: "Caramelo",
      species: "Cachorro",
      breed: "Vira-lata",
      age_years: 3,
      age_months: 6,
      weight_kg: 12.5,
      motive: "Internação para tratamento clínico",
      owner_id: ownerId,
    });
    console.log(`✅ Paciente Caramelo criado (ID: ${caramelo.data.id})`);

    // Get templates and measures
    console.log("Buscando modelo 'Internação Clínica'...");
    const templatesResponse = await api.get("/templates");
    const clinicalTemplate = templatesResponse.data.find(
      (t: any) => t.name === "Internação Clínica"
    );

    if (!clinicalTemplate) {
      throw new Error(
        "Modelo 'Internação Clínica' não encontrado. Execute a migração de medidas primeiro."
      );
    }
    console.log(`✅ Modelo encontrado (ID: ${clinicalTemplate.id})`);

    // Get all measures
    const measuresResponse = await api.get("/measures");
    const measures = measuresResponse.data;

    const findMeasure = (name: string) =>
      measures.find((m: any) => m.name === name);

    // Create treatment session
    console.log("Criando sessão de tratamento...");
    const session = await api.post("/sessions", {
      patient_id: caramelo.data.id,
      template_id: clinicalTemplate.id,
      status: "active",
      notes: "Paciente internado para tratamento clínico de gastroenterite",
    });
    console.log(`✅ Sessão criada (ID: ${session.data.id})`);

    // Create logs for the last 5 days
    console.log("Criando registros de tratamento para os últimos 5 dias...");

    const measureTemp = findMeasure("Temperatura");
    const measureHR = findMeasure("Frequência Cardíaca");
    const measureRR = findMeasure("Frequência Respiratória");
    const measureAppetite = findMeasure("Apetite");
    const measureHydration = findMeasure("Estado de Hidratação");
    const measureSkinTurgor = findMeasure("Turgor Cutâneo");
    const measureUrine = findMeasure("Volume Urinário");
    const measureFeces = findMeasure("Características das Fezes");
    const measureVomit = findMeasure("Vômito");

    // Day 1 - Worse condition
    await api.post(`/sessions/${session.data.id}/logs`, {
      notes: "Dia 1 - Admissão: Paciente apresentando vômito e diarreia",
      values: [
        { measure_id: measureTemp?.id, value: "39.5" },
        { measure_id: measureHR?.id, value: "145" },
        { measure_id: measureRR?.id, value: "32" },
        { measure_id: measureAppetite?.id, value: "Ausente" },
        { measure_id: measureHydration?.id, value: "Moderada desidratação" },
        { measure_id: measureSkinTurgor?.id, value: "Reduzido" },
        { measure_id: measureUrine?.id, value: "50" },
        { measure_id: measureFeces?.id, value: "Diarreia" },
        { measure_id: measureVomit?.id, value: "Presente - Alimento" },
      ].filter((v) => v.measure_id),
    });

    // Day 2 - Slight improvement
    await api.post(`/sessions/${session.data.id}/logs`, {
      notes: "Dia 2 - Ligeira melhora, hidratação iniciada",
      values: [
        { measure_id: measureTemp?.id, value: "39.2" },
        { measure_id: measureHR?.id, value: "138" },
        { measure_id: measureRR?.id, value: "28" },
        { measure_id: measureAppetite?.id, value: "Ausente" },
        { measure_id: measureHydration?.id, value: "Leve desidratação" },
        { measure_id: measureSkinTurgor?.id, value: "Reduzido" },
        { measure_id: measureUrine?.id, value: "75" },
        { measure_id: measureFeces?.id, value: "Diarreia" },
        { measure_id: measureVomit?.id, value: "Presente - Bile" },
      ].filter((v) => v.measure_id),
    });

    // Day 3 - Improving
    await api.post(`/sessions/${session.data.id}/logs`, {
      notes: "Dia 3 - Melhora progressiva, vômitos cessaram",
      values: [
        { measure_id: measureTemp?.id, value: "38.8" },
        { measure_id: measureHR?.id, value: "125" },
        { measure_id: measureRR?.id, value: "24" },
        { measure_id: measureAppetite?.id, value: "Reduzido" },
        { measure_id: measureHydration?.id, value: "Normal" },
        { measure_id: measureSkinTurgor?.id, value: "Normal" },
        { measure_id: measureUrine?.id, value: "120" },
        { measure_id: measureFeces?.id, value: "Diarreia" },
        { measure_id: measureVomit?.id, value: "Ausente" },
      ].filter((v) => v.measure_id),
    });

    // Day 4 - Much better
    await api.post(`/sessions/${session.data.id}/logs`, {
      notes: "Dia 4 - Boa evolução, começou a se alimentar",
      values: [
        { measure_id: measureTemp?.id, value: "38.5" },
        { measure_id: measureHR?.id, value: "115" },
        { measure_id: measureRR?.id, value: "22" },
        { measure_id: measureAppetite?.id, value: "Reduzido" },
        { measure_id: measureHydration?.id, value: "Normal" },
        { measure_id: measureSkinTurgor?.id, value: "Normal" },
        { measure_id: measureUrine?.id, value: "150" },
        { measure_id: measureFeces?.id, value: "Normal" },
        { measure_id: measureVomit?.id, value: "Ausente" },
      ].filter((v) => v.measure_id),
    });

    // Day 5 - Almost recovered
    await api.post(`/sessions/${session.data.id}/logs`, {
      notes: "Dia 5 - Quase recuperado, apto para alta em breve",
      values: [
        { measure_id: measureTemp?.id, value: "38.3" },
        { measure_id: measureHR?.id, value: "110" },
        { measure_id: measureRR?.id, value: "20" },
        { measure_id: measureAppetite?.id, value: "Normal" },
        { measure_id: measureHydration?.id, value: "Normal" },
        { measure_id: measureSkinTurgor?.id, value: "Normal" },
        { measure_id: measureUrine?.id, value: "180" },
        { measure_id: measureFeces?.id, value: "Normal" },
        { measure_id: measureVomit?.id, value: "Ausente" },
      ].filter((v) => v.measure_id),
    });

    console.log("✅ 5 registros de tratamento criados");
    console.log("🎉 Migração do paciente Caramelo concluída com sucesso!");
  } catch (error: any) {
    console.error("❌ Erro durante a migração:", error.message);
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

migrate();
