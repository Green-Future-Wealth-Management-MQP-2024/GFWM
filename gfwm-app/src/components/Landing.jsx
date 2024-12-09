import React, { useState } from "react";
import RankingForm from "./RankingForm.jsx";

import "./Landing.css";

const LandingPage = () => {
  return (
    <div className="landing-page">
      <header className="top-bar">
      <h2 className="text-2xl font-bold">
        Green Future Wealth Management ESG Questionnaire
      </h2>

    </header>
      <div className="body-content">
        <h1>Welcome to Our ESG Questionnaire!</h1>
        <p>Thank you for taking the time to answer these questions.</p>
        <p>
          Classify each factor below from not important to very important to your investments.
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

const FooterBar = () => {
  return (
    <footer className="footer-bar">
      <p>2024 Green Future Wealth Managagement MQP</p>
      <p>Securities offered through Registered Representatives of Cambridge Investment Research, Inc., a broker dealer, member FINRA/SIPC. Advisory services offered through Cambridge Investment Research Advisors, Inc, a Registered Investment Adviser. Green Future Wealth Management and Cambridge are not affiliated. </p>
    </footer>
  );
};

export default LandingPage;
