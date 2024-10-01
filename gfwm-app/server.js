const express = require('express');
const path = require('path');
const vite = require('vite');
const app = express();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const pythonShell = require('python-shell');

// submit form data to the server
app.post('/api/submit', async (req, res) => {
  console.log(req.body);
  res.json({ message: 'Data received!' });
//post data to the database using prisma

    try {
      const newResponse = await prisma.SurveyResponse.create({
        data: {
          environmental: req.body.environmental,
          social: req.body.social,
          governance: req.body.governance,
        },
      });
      res.json("data saved");
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'An error occurred!' });
    }

    //run python script
    const scriptPath = 'path/to/script.py';
    const args = req.body;
    pythonShell.run(scriptPath, {args}, function (err, results) {
      if (err) throw err;
      console.log('results: %j', results);
    });

  });


<<<<<<< Updated upstream
// Middleware to parse incoming JSON requests
app.use(express.json()); // This ensures req.body is populated

// Serve API routes using Express
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from the Express API!' });
});
=======
>>>>>>> Stashed changes

// Middleware to integrate Vite with Express in development
if (process.env.NODE_ENV !== 'production') {
  (async () => {
    const viteServer = await vite.createServer({
      server: { middlewareMode: true }
    });
    app.use(viteServer.middlewares);
  })();
} else {
  // Serve static files from the Vite build folder
  app.use(express.static(path.join(__dirname, 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
}

// Start the server
const port = process.env.PORT || 5500;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

app.post('/submitForm', (req, res) => {
  const clientResponses = req.body;

  console.log(clientResponses)
  
  // Process the form data here (e.g., save to a database)

  const environmentalScore = (clientResponses.fossilFuels + clientResponses.environmental)/2;
  const socialScore = (clientResponses.weapons + clientResponses.social)/2;
  const governanceScore = clientResponses.governance;

  console.log(environmentalScore, socialScore, governanceScore)

  res.status(200).json({ message: 'Questionnaire responses saved successfully!' });
});

