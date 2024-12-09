import React, { useState } from "react";
import RankingForm from "./RankingForm.jsx";

const LandingPage = () => {
  return (
    <div className="landing-page">
      <header className="top-bar">
        <h2 className="text-2xl font-bold">Green Future Wealth Management ESG Questionnaire</h2>
      </header>
      <div className="body-content">
        <RankingForm />
      </div>

      <footer className="footer-bar">
        <p>2024 Green Future Wealth Managagement MQP</p>
        <p>
          Securities offered through Registered Representatives of Cambridge Investment Research, Inc., a broker dealer,
          member FINRA/SIPC. Advisory services offered through Cambridge Investment Research Advisors, Inc, a Registered
          Investment Adviser. Green Future Wealth Management and Cambridge are not affiliated.{" "}
        </p>
      </footer>
    </div>
  );
};

export default LandingPage;
