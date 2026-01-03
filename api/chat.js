export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      res.statusCode = 405;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ reply: "Metodo non consentito." }));
      return;
    }

    // Leggi body in modo robusto
    let body = "";
    await new Promise((resolve) => {
      req.on("data", (chunk) => (body += chunk));
      req.on("end", resolve);
    });

    const parsed = body ? JSON.parse(body) : {};
    const message = (parsed.message || "").toString();
    const mode = (parsed.mode || "mattino").toString();

    const system =
      "Sei Clara. Rispondi in italiano. Tono calmo, umano, senza giudicare. " +
      "Devi SEMPRE ridurre la pressione. Risposte brevi e pratiche. " +
      "Formato consigliato: poche righe + 1-3 punti massimo. " +
      "Se l'utente è confuso, scegli una sola cosa semplice.\n\n" +
      "Modalità: " + mode + ".\n" +
      "- mattino: 'Oggi conta questo' + 'Può aspettare'.\n" +
      "- pomeriggio: check leggero, una sola cosa piccola.\n" +
      "- sera: chiusura gentile, niente sensi di colpa.";

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: system },
          { role: "user", content: message }
        ],
        temperature: 0.7
      })
    });

    const data = await response.json();
    const reply = data?.choices?.[0]?.message?.content || "Non ho ricevuto risposta. Riprova.";

    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ reply }));
  } catch (e) {
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ reply: "Ora restiamo semplici. Riprova tra poco." }));
  }
}

  

