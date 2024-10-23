import React, { useState } from "react";
import "./RankingForm.css"; // Import the CSS file
import RankingFormResults from "./RankingFormResults";
import { useRef } from "react";

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
      const selectedOption = formRefs.current[question.id].current.querySelector(
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
    fetch(`//${process.env.API_DOMAIN}/submitForm/`, {
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
          <div key={question.id} className="form-row" ref={formRefs.current[question.id]}>
            <label className="form-question">{question.text}</label>
            <div className="radio-group">
              <span className="rating-label">1 (Not Important)</span>
              {[1, 2, 3, 4, 5].map((rank) => (
                <label key={rank}>
                  <input
                    type="radio"
                    name={`question-${question.id}`}
                    value={rank}
            
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

{ showResults && <RankingFormResults data={returnData} />}
    </div>
  );
};

export default RankingForm;
