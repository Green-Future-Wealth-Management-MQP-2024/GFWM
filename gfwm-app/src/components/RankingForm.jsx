import React, { useState } from "react";
import "./RankingForm.css"; // Import the CSS file
import RankingFormResults from "./RankingFormResults";

const RankingForm = () => {
  const questions = [
    {
      id: "fossilFuels",
      text: "Minimizing investment in fossil fuel producers:",
    },
    { id: "weapons", text: "Minimizing investment in weapons manufacturers:" },
    {
      id: "environment",
      text: "Investing in environmentally friendly companies:",
    },
    {
      id: "social",
      text: "Investing in companies with positive social impacts:",
    },
    {
      id: "governance",
      text: "Investing in companies with strong governance:",
    },
  ];

  const [responses, setResponses] = useState(
    questions.reduce((acc, question) => {
      acc[question.id] = "";
      return acc;
    }, {})
  );

  const [showResults, setShowResults] = useState(false);

  const handleChange = (questionId, value) => {
    setResponses((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Check if all questions are answered
    const allAnswered = Object.values(responses).every(
      (response) => response !== ""
    );

    if (!allAnswered) {
      alert("Please answer all questions before submitting.");
      return;
    }

    console.log(responses);

    // Send the data to the server
    fetch("/submitForm", {
      method: "POST", // or 'PUT' if updating existing data
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(responses),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Network response was not ok");
        }
        return res.json();
      })
      .then((data) => {
        console.log("Server response:", data); // Use the server response if needed
        setShowResults(true); // Show results after successful response
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="ranking-form">
        {questions.map((question) => (
          <div key={question.id} className="form-row">
            <label className="form-question">{question.text}</label>
            <div className="radio-group">
              <span className="rating-label">1 (Not Important)</span>
              {[1, 2, 3, 4, 5].map((rank) => (
                <label key={rank}>
                  <input
                    type="radio"
                    name={`question-${question.id}`}
                    value={rank}
                    checked={responses[question.id] === String(rank)}
                    onChange={() => handleChange(question.id, String(rank))}
                  />
                  {rank}
                </label>
              ))}
              <span className="rating-label">5 (Very Important)</span>
            </div>
          </div>
        ))}
        <button type="submit" className="submit-btn">
          Submit
        </button>
      </form>

      {showResults && <RankingFormResults responses={responses} />}
    </div>
  );
};

export default RankingForm;
