import React, { useState } from "react";
import "./RankingForm.css"; // Import the CSS file
import RankingFormResults from "./RankingFormResults";
import { useRef } from "react";

const RankingForm = () => {
  const questions = [
    {
      id: "environment",
      text: "How important is environmental protection to you?",
      link: "https://www.greenfuturewealth.com/environmental",
    },
    { 
      id: "humanRights",
       text: "How important is human rights protection to you? " 
      },
    {
      id: "employeeSatisfaction",
      text: "How important is employee satisfaction to you?",
    },
    {
      id: "productResponsibility",
      text: "How important is product responsibility (Data privacy, Responsible Marketing, Product Quality) to you?",
    },
    {
      id: "governance",
      text: "How important is shareholder satisfaction to you?",
    },
    {
      id: "community",
      text: "How important is community involvement (Respecting business ethics, protecting public health, and being a good citizen) to you?",
    },
    {
    id: "bestPractices",
    text: "How important is best practices and corporate governance to you?",
    },
    {
    id: "risk",
    text: "What is the risk you are willing to take?",
    },
    {
    id: "flexibility",
    text: "How flexible are you with your preferences? ",
    }

    
  ];

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
              {question.text} {" "}
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
              <span className="rating-label">1 (Not Important)</span>
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
              <span className="rating-label">5 (Very Important)</span>
            </div>
          </div>
        ))}
        <button type="submit" className="submit-btn">
          Submit
        </button>
      </form>

      {showResults && <RankingFormResults results={returnData} />}
    </div>
  );
};

export default RankingForm;
