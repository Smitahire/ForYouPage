import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

/**
 * Helper function to create the AI prompt
 */
const createMasterPrompt = (data) => {
  const previousPrompts = data && data.length
    ? data.map((p, i) => `${i + 1}. ${p}`).join("\n")
    : "No previous prompts provided.";

  return `
You are an expert AI prompt creator for image generation models like Stable Diffusion and Midjourney.

Below is a list of image prompts that the user has already used:
${previousPrompts}

Your task:
- Generate **5 new, creative, and high-quality image prompts** that are:
  - Thematically related.
  - Unique, not repetitive.
  - Similar to list of image prompts.
  - Do not make prompts long.
  
Return your response in **pure JSON format**:

\`\`\`json
{
  "new_prompts": [
    "prompt 1",
    "prompt 2",
    "prompt 3",
    "prompt 4",
    "prompt 5"
  ]
}
\`\`\`
`;
};

/**
 * Express route handler version
 */
export const generatePrompts = async (req, res) => {
  try {
    const { data } = req.body;

    if (!data || !Array.isArray(data)) {
      return res.status(400).json({ error: "Invalid input. 'data' must be an array of previous prompts." });
    }

    const prompt = createMasterPrompt(data);
    const result = await model.generateContent(prompt);
    const response = await result.response;

    let analysisJson;
    try {
      let rawText = response.candidates[0].content.parts[0].text;
      rawText = rawText.replace(/(^```(json)?\s*|\s*```$)/g, "").trim();
      analysisJson = JSON.parse(rawText);
    } catch (err) {
      console.error("AI raw response:", response.candidates[0].content.parts[0].text);
      return res.status(500).json({ error: "AI response was not valid JSON" });
    }

    return res.status(200).json(analysisJson);
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return res.status(500).json({ error: "Error generating related image prompts." });
  }
};
