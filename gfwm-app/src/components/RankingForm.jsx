import React, { useState } from "react";
import "./RankingForm.css"; // Import the CSS file
import RankingFormResults from "./RankingFormResults";
import { useRef } from "react";

// factors to get answers for:
// environment,
//social: community, human_rights, product_responsibility, workforce,
//governance: management, shareholders
// flexibility, risk

const RankingForm = () => {
  const questions = [
    {
      id: "environment",
      text: "Environmental protection",
      link: "https://www.greenfuturewealth.com/environmental",
    },
    {
      id: "human_rights",
      text: "Respecting fundamental human rights conventions",
    },
    {
      id: "community",
      text: "Respecting business ethics, protecting public health, commitment to being good citizens",
    },
    {
      id: "workforce",
      text: "Promoting job satisfaction, healthy and safe workplaces, diversity, and development opportunities",
    },
    {
      id: "product_responsibility",
      text: "Producing quality products, incorporating customer health and safety, maintaining data privacy, marketing responsibly",
    },
    {
      id: "shareholders",
      text: "Equal treatment of shareholders and protection from hostile takeovers",
    },
    {
      id: "management",
      text: "Maintaining best practices in management",
    },
    {
      id: "flexibility",
      text: "Rate your flexibility with the preferences submitted.",
    },
    {
      id: "risk_appetite",
      text: "Rate your risk appetite.",
    }];

  const formRefs = useRef(
    questions.reduce((acc, question) => {
      acc[question.id] = React.createRef();
      return acc;
    }, {})
  );

  const [returnData, setReturnData] = useState({});

  const [showResults, setShowResults] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    // read user responses and collect in responses object: {question_id : selected_value}
    const responses = questions.reduce((acc, question) => {
      const selectedOption = formRefs.current[
        question.id
      ].current.querySelector(
        'input[name="question-' + question.id + '"]:checked'
      );
      acc[question.id] = selectedOption ? selectedOption.value : "";
      return acc;
    }, {});

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
    fetch(`//${import.meta.env.VITE_API_DOMAIN}/submitForm/`, {
      method: "POST", // or 'PUT' if updating existing data
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(responses),
    })
      .then((res) => {
        if (!res.ok) {
          console.log(res);
          throw new Error("Network response was not ok");
        }
        return res.json();
      })
      .then((data) => {
        setReturnData(data);
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
          <div
            key={question.id}
            className="form-row"
            ref={formRefs.current[question.id]}
          >
            <label className="form-question">
              {question.text}{" "}
              {question.link && ( //show more info if link is provided
                <a
                  href={question.link}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  (Learn more)
                </a>
              )}
            </label>
            <div className="radio-group">
              <span className="rating-label">1 (Low)</span>
              {[1, 2, 3, 4, 5].map((rank) => (
                <label key={rank}>
                  <input
                    type="radio"
                    name={`question-${question.id}`}
                    value={rank}
                    defaultChecked={rank === 3}
                  />
                  {rank}
                </label>
              ))}
              <span className="rating-label">5 (High)</span>
            </div>
          </div>
        ))}
        <button type="submit" className="submit-btn">
          Get Results
        </button>
      </form>

      {showResults && <RankingFormResults results={returnData} />}
    </div>
  );
};

export default RankingForm;
