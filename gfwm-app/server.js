const express = require("express");
const path = require("path");
const vite = require("vite");
const app = express();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
let { PythonShell } = require("python-shell");
const dotenv = require("dotenv");

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
    console.log("Responses saved to database");
  } catch (error) {
    let msg = "Error with saving responses to database";
    console.error(msg, error);
  }

  //run python script

  const scriptPath = "pqp_prototype.py";

  let options = {
    mode: "text",
    pythonPath: process.env.PYTHON_PATH, // path to python3
    pythonOptions: ["-u"], // get print results in real-time
    scriptPath: "data_science/",
    args: [data.environmental, data.social, data.governance],
  };

  PythonShell.run(scriptPath, options).then((results) => {
    // results is an array consisting of messages collected during execution

    const headers = ["symbol", "name", "score", "growth_estimate_5_yrs)"];

    const jsonResult = [];

    for (let i = 1; i < results.length; i++) {
      //at least two spaces between columns
      const columns = results[i].split("  ").filter((item) => item !== "");

      let rowObject = [];

      //symbol
      rowObject[headers[0]] = columns[1].trim();

      //company name
      rowObject[headers[1]] = columns[2];

      //compatibility score
      rowObject[headers[2]] = columns[4];

      //growth estimate
      rowObject[headers[3]] = columns[3];

      jsonResult.push(rowObject);
    }

    //console.log(jsonResult)

    res.status(200).json({ message: JSON.stringify(jsonResult) });
  });
});
