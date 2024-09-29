import React, { useState } from 'react';
import './Landing.css';

const questions = [
  { id: 'fossil-fuels', text: 'Minimizing investment in fossil fuel producers:' },
  { id: 'weapons', text: 'Minimizing investment in weapons manufacturers:' },
  { id: 'environment', text: 'Investing in environmentally friendly companies:' },
  { id: 'social', text: 'Investing in companies with positive social impacts:' },
  { id: 'governance', text: 'Investing in companies with strong governance:' },
];

const LandingPage = () => {
  
  //responses is a object {fossil-fuels: #, weapons : #, etc}
  const [responses, setResponses] = useState(
    questions.reduce((acc, question) => {
      acc[question.id] = ''; //init object with empty responses
      return acc;
    }, {})
  );

  const handleChange = (questionId, value) => {
    setResponses((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(responses); // TODO Handle form submission (send data to server)
  };

  return (
    <div className="landing-page">
      <TopBar />
      <div className="body-content">
        <h1>Welcome to Our ESG Questionnaire!</h1>
        <p>Thank you for taking the time to answer these questions.</p>
        <p>Using this information, we will estimate the long term performance deviations between a portfolio reflective of your values and the S&P 500. 
          <br/>If you so choose, you will also be able to contact Green Future Wealth Management to book a complimentary initial consultation today to review your current portfolio.
          <br/>Rank each cause below from not important to very important on a scale 1-5.</p>
        
        <form className="esg-form" onSubmit={handleSubmit}>
          {questions.map(({ id, text }) => (
            <div key={id} className="form-group">
              <label htmlFor={id}>{text}</label>
              <div id={id} className="radio-group">
                {["1 (not important)", 2, 3, 4, "5 (very important)"].map((value) => ( //possible responses to each question
                  <label key={value}>
                    <input
                      type="radio"
                      name={id}
                      value={value}
                      checked={responses[id] === String(value)}
                      onChange={() => handleChange(id, String(value))}
                      required
                    />
                    {value}
                  </label>
                ))}
              </div>
            </div>
          ))}
          <button type="submit">Next</button>
        </form>
      </div>
      <FooterBar />
    </div>
  );
};

const TopBar = () => {
  return (
    <header className="top-bar">
      <h2>My Website</h2>
      <nav>
        <a href="/">Home</a>
        <a href="/about">About</a>
        <a href="/contact">Contact</a>
      </nav>
    </header>
  );
};

const FooterBar = () => {
  return (
    <footer className="footer-bar">
      <p>&copy; 2024 My Website. All rights reserved.</p>
    </footer>
  );
};

export default LandingPage;
