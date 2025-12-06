import Groq from "groq-sdk";
import dotenv from "dotenv";
dotenv.config();

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function testEmbed() {
  try {
    const result = await client.embeddings.create({
      model: "text-embedding-3-large",
      input: "two pointer technique",
    });

    console.log("Embedding length:", result.data[0].embedding.length);
  } catch (err) {
    console.error("Embed ERROR:", err);
  }
}

testEmbed();
