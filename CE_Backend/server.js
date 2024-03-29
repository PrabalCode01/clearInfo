const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const PORT = 8080;


const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");
const genAI = new GoogleGenerativeAI("AIzaSyCsrlEI_WO6__0_rdumCg4bkQaZu9F-Peg");



app.use(bodyParser.json({ limit: '100mb' }));

app.post('/extension/userinterface' , (req,res)=>{
    const requestData = req.body;
    const screenshot = requestData.screenshotUrl;
    run(screenshot).then(text => {
        res.send(text);
    }).catch(error => {
        console.error("Error generating text:", error);
        res.status(500).send("Error generating text");
    });
})
  
app.post('/extension/urgency' , (req, res)=>{
    const requestData = req.body;
    const body = requestData.bodyText;
    const bodyarr = body.split('\n')
    textrun(bodyarr).then(text =>{
        res.send(text);
    }).catch(error => {
        console.error("Error generating text:", error);
        res.status(500).send("Error generating text");
    });
})

// Converts local file information to a GoogleGenerativeAI.Part object.
function fileToGenerativePart(path, mimeType) {
    let indexOfFirstComma = path.indexOf(',');
    path = path.substring(indexOfFirstComma + 1);
   return {
     inlineData: {
       data:path,
       mimeType
     },
   };
 }

 function fileToGenerativePart2(path, mimeType) {
    return {
      inlineData: {
        data: Buffer.from(fs.readFileSync(path)).toString("base64"),
        mimeType
      },
    };
  }

async function run(path) {
    // For text-and-image input (multimodal), use the gemini-pro-vision model
    const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });
  
    const prompt = "You are tasked for analyzing screenshots of webpages given in the image to detect instances of user interface deception (UID) commonly known as dark patterns. You should determine whether the provided screenshot in the image exhibits deceptive UI practices and provide detailed feedback if detected. If no deceptive patterns are observed, you should confidently state that no dark patterns are present. Instructions: 1. Input:The input will be a screenshot image of a webpage obtained from an e-commerce platform. 2. Output: - If you detects user interface deception, you should provide specific details regarding the observed dark pattern(s) - If no dark patterns are detected, you should confidently state that no deceptive UI practices are present. Criteria for Detection: You should consider various types of user interface deception, including but not limited to misleading button placements, ambiguous messaging, forced actions, hidden costs, fake urgency indicators, and subscription traps.You should analyze the layout, design elements, textual content, and overall user experience to identify deceptive patterns. Accuracy and Precision:Strive for accuracy and precision in detecting user interface deception, minimizing false positives and false negatives. Try to detect dark pattern very sensitively if there is any chance then report it";


    // const prompt = "You are tasked for analyzing screenshots of webpages given in second image to detect instances of user interface deception (UID) commonly known as dark patterns which are described in the first image as example  image. You should determine whether the provided screenshot in second image exhibits deceptive UI practices and provide detailed feedback if detected. If no deceptive patterns are observed, you should confidently state that no dark patterns are present. Instructions: 1. Input:The input will be a screenshot image of a webpage obtained from an e-commerce platform. 2. Output: - If you detects user interface deception, you should provide specific details regarding the observed dark pattern(s) - If no dark patterns are detected, you should confidently state that no deceptive UI practices are present. Criteria for Detection: You should consider various types of user interface deception, including but not limited to misleading button placements, ambiguous messaging, forced actions, hidden costs, fake urgency indicators, and subscription traps.You should analyze the layout, design elements, textual content, and overall user experience to identify deceptive patterns. Accuracy and Precision:Strive for accuracy and precision in detecting user interface deception, minimizing false positives and false negatives. Try to detect dark pattern very sensitively if there is any chance then report it";

    const imageParts = [
     // fileToGenerativePart2("example.png","image/png"),
      fileToGenerativePart(path, "image/png"),
    ];
    console.log('prompt send');
    const result = await model.generateContent([prompt, ...imageParts]);
    const response = await result.response;
    const text = response.text();
    console.log(text);
    return text;
}

async function textrun(body){
    const model = genAI.getGenerativeModel({ model: "gemini-pro"});

    const prompt = `You have to do classification of input texts into two fields: 1. Urgency (some examples: 1-FLASH SALE | LIMITED TIME ONLY,  2-HURRY! EXCLUSIVE DEAL FOR YOU, 3-Offer ends in etc ..) and 
    2. Scarcity (some examples: 1-Hurry! Only 2 left in stock, 2-In Stock 3-Deal of the Day etc). 
    Classify the following keywords send to you in {${body}}.`
    console.log('Text promt Send' , body);
  
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    console.log(text);
    return text;
}

app.listen(PORT , ()=>{
    console.log('Server started');
})