const express = require("express");
const path = require("path");
const vite = require("vite");
const app = express();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const pythonShell = require("python-shell");

// Middleware to parse incoming JSON requests
app.use(express.json());

// submit form data to the server
app.post("/api/submit", async (req, res) => {
  const clientResponses = req.body;

  const data = {
    environmentalScore:
      (clientResponses.fossilFuels + clientResponses.environmental) / 2,
    socialScore: (clientResponses.weapons + clientResponses.social) / 2,
    governanceScore: clientResponses.governance,
  };

  //console.log(environmentalScore, socialScore, governanceScore);

  //post data to the database using prisma
  try {
    const newResponse = await prisma.SurveyResponse.create({
      data: data,
    });
    res.json("Questionnaire responses saved");
  } catch (error) {
    console.error("error with saving responses to database", error);
    res
      .status(500)
      .json({ message: "Saving questionnaire responses to database failed" });
  }

  //run python script
  const scriptPath = "path/to/script.py";
  pythonShell.run(scriptPath, { data }, function (err, results) {
    if (err) {
      console.log("error with python script", err);
      res.status(500).json("Python script failed");
    }
    console.log("python results: %j", results);

    // Create an object with keys as "line1", "line2", etc.
    const pythonResults = results.reduce((acc, line, index) => {
      acc[`line${index + 1}`] = line;
      return acc;
    }, {});

    //by this point everything went well!
    res.status(200).json({
      message: "Questionnaire responses saved and Python results provided!",
      results: pythonResults,
    });
  });
});

// Serve API routes using Express
app.get("/api/hello", (req, res) => {
  res.json({ message: "Hello from the Express API!" });
});

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

app.post("/submitForm", (req, res) => {
  const clientResponses = req.body;

  console.log(clientResponses);
});
