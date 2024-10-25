import React, { useState } from "react";
import RankingForm from "./RankingForm.jsx";

import "./Landing.css";

const LandingPage = () => {
  return (
    <div className="landing-page">
      <TopBar />
      <div className="body-content">
        <h1>Welcome to Our ESG Questionnaire!</h1>
        <p>Thank you for taking the time to answer these questions.</p>
        <p>
          Rank each cause below from not important to very important on a scale
          1-5.
          <br />
          If you so choose, you will also be able to contact Green Future Wealth
          Management to book a complimentary initial consultation today to
          review your current portfolio.
        </p>

        <RankingForm />
      </div>
      <FooterBar />
    </div>
  );
};

const TopBar = () => {
  return (
    <header className="top-bar">
      <h2 className="text-2xl font-bold">
        Green Future Wealth Management ESG Questionnaire
      </h2>
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
      <p>2024 Green Future Wealth Managagement MQP</p>
    </footer>
  );
};

export default LandingPage;
