import Groq from "groq-sdk";
import dotenv from "dotenv";
dotenv.config();

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function test() {
  try {
    const resp = await client.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: "Hello Groq, are you working?" }],
    });

    console.log("Groq reply:", resp.choices[0].message);
  } catch (err) {
    console.error("Groq ERROR:", err);
  }
}

test();
