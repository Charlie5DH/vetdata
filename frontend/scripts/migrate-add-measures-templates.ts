import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

async function migrate() {
  try {
    console.log("🔄 Iniciando migração de medidas e modelos...");

    // Create 15 new measures
    console.log("Criando 15 novas medidas...");

    const measurePressureS = await api.post("/measures", {
      name: "Pressão Arterial Sistólica",
      unit: "mmHg",
      data_type: "number",
    });
    const measurePressureD = await api.post("/measures", {
      name: "Pressão Arterial Diastólica",
      unit: "mmHg",
      data_type: "number",
    });
    const measureSaturation = await api.post("/measures", {
      name: "Saturação de Oxigênio",
      unit: "%",
      data_type: "number",
    });
    const measureGlucose = await api.post("/measures", {
      name: "Glicemia",
      unit: "mg/dL",
      data_type: "number",
    });
    const measurePainLevel = await api.post("/measures", {
      name: "Nível de Dor",
      data_type: "select",
      options: ["Ausente", "Leve", "Moderada", "Severa"],
    });
    const measureHydration = await api.post("/measures", {
      name: "Estado de Hidratação",
      data_type: "select",
      options: [
        "Normal",
        "Leve desidratação",
        "Moderada desidratação",
        "Severa desidratação",
      ],
    });
    const measureCapillaryRefill = await api.post("/measures", {
      name: "Tempo de Reperfusão Capilar",
      unit: "segundos",
      data_type: "number",
    });
    const measurePulseQuality = await api.post("/measures", {
      name: "Qualidade do Pulso",
      data_type: "select",
      options: ["Forte", "Normal", "Fraco", "Filiforme"],
    });
    const measureConsciousness = await api.post("/measures", {
      name: "Nível de Consciência",
      data_type: "select",
      options: ["Alerta", "Sonolento", "Estuporoso", "Comatoso"],
    });
    const measureAppetite = await api.post("/measures", {
      name: "Apetite",
      data_type: "select",
      options: ["Normal", "Reduzido", "Ausente", "Voraz"],
    });
    const measureUrine = await api.post("/measures", {
      name: "Volume Urinário",
      unit: "mL",
      data_type: "number",
    });
    const measureFeces = await api.post("/measures", {
      name: "Características das Fezes",
      data_type: "select",
      options: ["Normal", "Diarreia", "Constipação", "Sangue presente"],
    });
    const measureVomit = await api.post("/measures", {
      name: "Vômito",
      data_type: "select",
      options: [
        "Ausente",
        "Presente - Alimento",
        "Presente - Bile",
        "Presente - Sangue",
      ],
    });
    const measureAbdomen = await api.post("/measures", {
      name: "Palpação Abdominal",
      data_type: "select",
      options: ["Normal", "Sensível", "Distendido", "Massa palpável"],
    });
    const measureSkinTurgor = await api.post("/measures", {
      name: "Turgor Cutâneo",
      data_type: "select",
      options: ["Normal", "Reduzido", "Muito reduzido"],
    });

    console.log("✅ 15 novas medidas criadas");

    // Get existing measures for template creation
    console.log("Buscando medidas existentes...");
    const measuresResponse = await api.get("/measures");
    const allMeasures = measuresResponse.data;

    const findMeasure = (name: string) =>
      allMeasures.find((m: any) => m.name === name)?.id;

    // Create 5 new treatment templates
    console.log("Criando 5 novos modelos de tratamento...");

    await api.post("/templates", {
      name: "Internação em UTI",
      description: "Monitoramento completo para pacientes em terapia intensiva",
      measure_ids: [
        findMeasure("Frequência Cardíaca"),
        findMeasure("Frequência Respiratória"),
        findMeasure("Temperatura"),
        findMeasure("Mucosas"),
        measurePressureS.data.id,
        measurePressureD.data.id,
        measureSaturation.data.id,
        measureGlucose.data.id,
        measurePainLevel.data.id,
        measureHydration.data.id,
        measureConsciousness.data.id,
        measureUrine.data.id,
      ].filter(Boolean),
    });

    await api.post("/templates", {
      name: "Pós-Operatório",
      description: "Acompanhamento de recuperação pós-cirúrgica",
      measure_ids: [
        findMeasure("Temperatura"),
        findMeasure("Frequência Cardíaca"),
        findMeasure("Frequência Respiratória"),
        measurePainLevel.data.id,
        measureAppetite.data.id,
        measureVomit.data.id,
        measureUrine.data.id,
        measureFeces.data.id,
      ].filter(Boolean),
    });

    await api.post("/templates", {
      name: "Emergência",
      description: "Avaliação rápida de pacientes em situação crítica",
      measure_ids: [
        findMeasure("Frequência Cardíaca"),
        findMeasure("Frequência Respiratória"),
        findMeasure("Temperatura"),
        findMeasure("Mucosas"),
        measureCapillaryRefill.data.id,
        measurePulseQuality.data.id,
        measureConsciousness.data.id,
        measureAbdomen.data.id,
      ].filter(Boolean),
    });

    await api.post("/templates", {
      name: "Internação Clínica",
      description: "Monitoramento diário de pacientes internados",
      measure_ids: [
        findMeasure("Temperatura"),
        findMeasure("Frequência Cardíaca"),
        findMeasure("Frequência Respiratória"),
        measureAppetite.data.id,
        measureHydration.data.id,
        measureSkinTurgor.data.id,
        measureUrine.data.id,
        measureFeces.data.id,
        measureVomit.data.id,
      ].filter(Boolean),
    });

    await api.post("/templates", {
      name: "Controle de Diabetes",
      description: "Monitoramento de pacientes diabéticos",
      measure_ids: [
        measureGlucose.data.id,
        measureAppetite.data.id,
        measureUrine.data.id,
        measureHydration.data.id,
        findMeasure("Temperatura"),
      ].filter(Boolean),
    });

    console.log("✅ 5 novos modelos de tratamento criados");
    console.log("🎉 Migração concluída com sucesso!");
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
