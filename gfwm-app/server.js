const express = require('express');
const path = require('path');
const vite = require('vite');
const app = express();

// Middleware to parse incoming JSON requests
app.use(express.json()); // This ensures req.body is populated

// Serve API routes using Express
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from the Express API!' });
});

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

