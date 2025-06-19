import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const chatHandler = async (req, res) => {
  const { message } = req.body;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: "system",
          content: "You are a helpful customer support assistant for GreenGrocery, an eco-friendly e-commerce store. Answer questions about products, orders, shipping, returns, and sustainability. Keep responses concise and helpful."
        },
        {
          role: "user",
          content: message
        }
      ],
      max_tokens: 150,
      temperature: 0.7,
    });

    const reply = completion.choices[0].message.content;
    res.json({ reply });
  } catch (error) {
    // Always return your custom message
    const errorMsg = "Zero Credits in API key. This is a student project demo.";
    res.status(500).json({ error: errorMsg });
  }
};
