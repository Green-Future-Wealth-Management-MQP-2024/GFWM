import React, { useState } from 'react';
import RankingForm from './RankingForm.jsx'

import './Landing.css';

const LandingPage = () => {

  return (
    <div className="landing-page">
      <TopBar />
      <div className="body-content">
        <h1>Welcome to Our ESG Questionnaire!</h1>
        <p>Thank you for taking the time to answer these questions.</p>
        <p>Using this information, we will estimate the long term performance deviations between a portfolio reflective of your values and the S&P 500. 
          <br/>If you so choose, you will also be able to contact Green Future Wealth Management to book a complimentary initial consultation today to review your current portfolio.
          <br/>Rank each cause below from not important to very important on a scale 1-5.</p>
        
        <RankingForm />
      </div>
      <FooterBar />
    </div>
  );
};

const TopBar = () => {
  return (
    <header className="top-bar">
      <h2 className='text-2xl font-bold'>Green Future Wealth Management MQP Prototype</h2>
      <nav>
        <a href="/">Home</a>
        <a href="https://www.greenfuturewealth.com/about">About</a>
        <a href="https://www.greenfuturewealth.com/contact">Contact</a>
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
