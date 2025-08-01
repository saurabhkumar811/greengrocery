import axios from 'axios';
import dotenv from 'dotenv';

// Load .env variables
dotenv.config();

// The Gemini chat model you are using
const GEMINI_MODEL = 'gemini-2.5-flash';

/**
 * Calls the Gemini API with the user's chat message using a refined system prompt.
 * @param {string} userMessage - The user's message for the chatbot.
 * @returns {Promise<string>} The chatbot's reply.
 */
async function callGeminiAPI(userMessage) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('Missing GEMINI_API_KEY in environment variables.');

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

  // Refined system prompt for specific, professional, and concise responses
 const payload = {
  contents: [
    {
      parts: [
        {
text: `
You are the official customer support assistant for GreenGrocery, an eco-friendly online grocery store.

FACTS about GreenGrocery:
- GreenGrocery sells only groceries in these main categories:
  • Vegetables
  • Fruits
  • Drinks
  • Instant foods
  • Dairy products
  • Bakery items
  • Grains
  • [Add any other categories here]
- GreenGrocery does NOT sell sports equipment, electronics, or non-grocery items (including cricket bats, balls, or cricket products of any kind).
- Payment methods: ONLY Cash on Delivery (COD) and Credit/Debit Card (online) are accepted. No PayPal, Apple Pay, UPI, wallets, or others.

INSTRUCTIONS:
- When asked about product availability, ONLY mention grocery categories as above.
- If asked about products not in these categories (electronics, cricket, sports, etc.), politely state "Sorry, we only sell groceries such as vegetables, fruits, drinks, instant foods, dairy products, bakery items, and grains."
- When asked about payment, always say ONLY "Cash on Delivery (COD)" and "Credit/Debit Card" are accepted; mention no others.
- For any off-topic question, give a polite, brief answer and offer to help with groceries.

EXAMPLES:
Q: Are cricket products available?
A: Sorry, we do not sell cricket products. GreenGrocery only offers groceries such as vegetables, fruits, drinks, instant foods, dairy, bakery, and grains.

Q: Do you sell sports equipment?
A: No, we only sell groceries.

Q: What are the payment modes?
A: GreenGrocery accepts only two payment methods: Cash on Delivery (COD) and credit/debit cards.

User: ${userMessage}
`


        }
      ]
    }
  ]
};


  const response = await axios.post(endpoint, payload, {
    headers: { 'Content-Type': 'application/json' }
  });

  if (
    response.data &&
    response.data.candidates &&
    response.data.candidates.length > 0 &&
    response.data.candidates[0].content &&
    response.data.candidates[0].content.parts &&
    response.data.candidates[0].content.parts.length > 0 &&
    typeof response.data.candidates[0].content.parts[0].text === 'string'
  ) {
    return response.data.candidates[0].content.parts[0].text;
  } else {
    throw new Error('Invalid response format from Gemini API.');
  }
}

/**
 * Express controller for chat requests.
 * Expects POST body: { message: string }
 * Responds with JSON: { reply: string }
 */
export const chatHandler = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ error: 'A non-empty message is required.' });
    }

    const reply = await callGeminiAPI(message.trim());
    res.json({ reply });

  } catch (error) {
    if (error.response) {
      console.error('Gemini API response error:', error.response.status, error.response.data);
    } else if (error.request) {
      console.error('Gemini API request error:', error.request);
    } else {
      console.error('Gemini API unknown error:', error.message);
    }
    res.status(500).json({ error: 'The AI service is temporarily unavailable or credits are exhausted for this demo.' });
  }
};
