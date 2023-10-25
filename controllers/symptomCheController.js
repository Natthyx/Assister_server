const { OpenAI } = require("openai");
const prompts = require("../prompt/prompts")
const openai = new OpenAI({
  apiKey: process.env.API_KEY,
});

// Function to extract numeric values from a string
function extractNumericValues(str) {
  const regex = /-?\d+(\.\d+)?/g;
  const matches = str.match(regex);
  return matches ? matches.map(parseFloat) : [];
}
// Function to extract hospital name from response
function extractHospitalNameFromResponse(response) {
  const regex = /H-name: \s*(.*)/i;
  const match = response.match(regex);
  return match ? match[1] : null;
}

// Function to generate a response from the ChatGPT API
async function generateChatResponse(userSymptom) {
  try {
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content:prompts.symptomCheckerPromptTemplate},    
        { role: "user", content: userSymptom },
      ],
      model: "gpt-3.5-turbo",
      temperature: 0.0,
    });

    const responseContent = completion.choices[0].message.content;
    const responseParts = responseContent.split(/(Longitude|Latitude):\s+/i);



    // Extract the longitude and latitude
    let longitude;
    let latitude;
    let hospitalName;

    if (responseParts.length >= 3) {
      longitude = extractNumericValues(responseParts[2])[0];
      latitude = extractNumericValues(responseParts[4])[0];
      hospitalName = extractHospitalNameFromResponse(responseContent);
    }

    console.log(latitude," ", longitude, " ", hospitalName)
    return {
      response: responseContent,
      longitude,
      latitude,
      hospitalName
    };

  } catch (error) {
    console.error("Error generating chat response:", error);
    throw error;
  }
}

// Controller function for symptom checker
exports.checkSymptom = async (req, res) => {
  try {
    const userSymptom = req.body.message;

    // Generate a chat response based on the user's symptom
    const { response, longitude, latitude , hospitalName } = await generateChatResponse(userSymptom);

    res.json({ response, longitude, latitude , hospitalName });

  } catch (error) {
    console.error("Error generating chat response:", error);
    res.status(500).json({ error: "An error occurred" });
  }
};