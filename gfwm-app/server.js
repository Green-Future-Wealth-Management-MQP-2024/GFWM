const express = require("express");
const path = require("path");
const vite = require("vite");
const app = express();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
let { PythonShell } = require("python-shell");

// Middleware to parse incoming JSON requests
app.use(express.json());

// Middleware to integrate Vite with Express in development
if (process.env.NODE_ENV !== "production") {
  (async () => {
    const viteServer = await vite.createServer({
      server: { middlewareMode: true },
    });
    app.use(viteServer.middlewares);
  })();
} else {
  // Serve static files from the Vite build folder
  app.use(express.static(path.join(__dirname, "dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "dist", "index.html"));
  });
}

// Start the server
const port = process.env.PORT || 5500;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// Serve API routes using Express
app.get("/api/hello", (req, res) => {
  res.json({ message: "Hello from the Express API!" });
});

// submit form data to the server
app.post("/submitForm", async (req, res) => {
  console.log("received client responses");

  const clientResponses = {};

  // Iterate over each key in the req.body object and parse the values as integers
  for (const [key, value] of Object.entries(req.body)) {
    clientResponses[key] = parseInt(value, 10); // Base 10 parsing
  }

  const data = {
    environmental:
      (clientResponses.fossilFuels + clientResponses.environment) / 2,
    social: (clientResponses.weapons + clientResponses.social) / 2,
    governance: clientResponses.governance,
  };

  console.log(data);

  try {
    // Use Prisma's create method to add new item to the database
    const newResponse = await prisma.SurveyResponse.create({
      data: data,
    });
    let msg = "Questionnaire responses saved";
    console.log(msg);
    res.json(msg);
  } catch (error) {
    let msg = "Error with saving responses to database";
    console.error(msg, error);
    res.status(500).json({ message: msg });
  }

  //run python script
  
  const scriptPath = "pqp_prototype.py";

  let options = {
    mode: "text",
    pythonPath:
      "C:/Users/User/AppData/Local/Programs/Python/Python312/python.exe",
    pythonOptions: ["-u"], // get print results in real-time
    scriptPath: "data_science/",
    args: [data.environmental, data.social, data.governance],
  };

  PythonShell.run(scriptPath, options).then(results=>{
    // results is an array consisting of messages collected during execution
    console.log('results: %j', results);
  });

});
