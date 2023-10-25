const { OpenAI } = require("openai");
const prompts = require("../prompt/prompts")

const openai = new OpenAI({
  apiKey: process.env.API_KEY,
});

async function generateEmergencyContact(city) {
  try {
    const prompt = `list 10 Emergency Contact Numbers in ${city} with their name and Phone number `;

    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content:prompts.emergencyListPromptTemplate,
        },
        { role: "user", content: prompt },
      ],
      model: "gpt-3.5-turbo",
    });

    const emergencyList = completion.choices[0].message.content;

    return emergencyList;

  } catch (error) {
    console.error("Error generating hospital data:", error);
    throw error;
  }
}

exports.getEmergencyContacts = async (req, res) => {
  try {
    const {city} = req.body.city;

    const contacts = await generateEmergencyContact(city);

    console.log(contacts)

    res.json({ contacts });
  } catch (error) {
    console.error("Error generating hospital data:", error);
    res.status(500).json({ error: "An error occurred" });
  }
};