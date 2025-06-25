const express = require("express");
const path = require("path");
const fs = require("fs");
const cors = require("cors");
require('dotenv').config();


const { exec } = require("child_process");

// const url = "https://futaa.onrender.com";
// exec(`start chrome --app="${url}"`);
"https://kc.kobotoolbox.org/media/original?media_file=aneehatprecious%2Fattachments%2Fb24eafc23d52430bba582f447039a9a3%2F3c9a0521-beef-4e7f-bb63-30f748310dc9%2F1749992017301.jpg"

const app = express();
const PORT = process.env.PORT || 3000;

const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI("AIzaSyAZLHFiKbHpPdBhDQNVWbmNnKdLy1NoPoc");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, "public")));

let nameOfBuildings;
fs.readFile('public/assets/shapefiles/bells_structures.geojson', 'utf8', (err, data) => {
  if (err) throw err;
  const geojson = JSON.parse(data);
  nameOfBuildings = geojson.features.map(f => f.properties["Name of Structure"] );
  console.log(nameOfBuildings);
});

app.get("/ask-ai", async (req, res) => {
    const userQuestion = req.query.message.toLowerCase();  // Get the question from frontend
    message = `
        you are playing the role of an ai agent for the federal university of tech akure, and your work is to check this data: ${nameOfBuildings} 
        thoroughly and look for the uniform name that matches this prompt request: ${userQuestion}.
        Note: you are to strictly return one building name that matches the prompt request and 
        nothing more or less.
        if the prompt request is conversational and doesn't require a response from the data, then you
        must have a conversational response with the user.
    `
    
    const result = await model.generateContent(message);
    let friendlyIntro = await model.generateContent(`i want you to give me a very short and concise sentence that introduces this input: '${userQuestion}' response, make sure to use emoJI. you must strictly return something that matces, if the impute does make sense, just send back a greeting`);
    console.log(friendlyIntro.response.text())
    res.json({ reply: result.response.text(),  friendlyIntro: friendlyIntro.response.text()});
    console.log(result.response.text())

});



app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
