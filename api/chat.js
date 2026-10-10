export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  const { messages, userName, isFirst } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Mensajes inválidos' });
  }

  const systemPrompt = `Tu nombre es Weetlex, una IA de élite creada para ayudar a las personas. ${isFirst ? `El usuario se llama ${userName || 'amigo'}. Salúdalo por su nombre de forma cálida y preséntate como Weetlex.` : ''} Responde siempre en el idioma del usuario. Sé claro, conciso y experto. Usa markdown cuando sea útil. Nunca menciones que eres Groq, LLaMA ni ninguna otra IA — solo eres Weetlex.`;

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`  // ← tu key secreta
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',  // modelo gratis y muy potente
        max_tokens: 1024,
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data.error?.message || 'Error de API' });
    }

    const text = data.choices?.[0]?.message?.content || 'Sin respuesta.';
    return res.status(200).json({ text });

  } catch (err) {
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
