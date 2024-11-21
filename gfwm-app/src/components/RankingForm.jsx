import React, { useState } from "react";
import { useRef } from "react";

import RankingFormResults from "./RankingFormResults";
import DragAndDrop from "./DragAndDrop";
import BinaryChoice from "./BinaryChoice";

// factors to get answers for:
// environment,
//social: community, human_rights, product_responsibility, workforce,
//governance: management, shareholders
// flexibility, risk

const RankingForm = () => {
  //no longer used
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
    },
  ];

  const factor_text_map = {
    environment: "Environmental protection",
    human_rights: "Respecting fundamental human rights conventions",
    community:
      "Respecting business ethics, protecting public health, commitment to being good citizens",
    workforce:
      "Promoting job satisfaction, safe workplaces, diversity, and development opportunities",
    product_responsibility:
      "Producing quality products, incorporating customer health and safety, maintaining data privacy, marketing responsibly",
    shareholders:
      "Equal treatment of shareholders and protection from hostile takeovers",
    management: "Maintaining best practices in management",
  };

  const [columns, setColumns] = useState({
    notImportant: ["community", "shareholders", "management"],
    midImportance: ["product_responsibility", "workforce", "human_rights"],
    highImportance: ["environment"],
  });

  const weighing_scheme_choices = {
    choice1: "Equal Weights",
    choice2: "Markowitz Optimized",
  };

  const [volatilitySlider, setVolatilitySliderValue] = useState(10);
  const [flexibilitySlider, setFlexibilitySliderValue] = useState(1);
  const [weighingScheme, setWeighingScheme] = useState("choice1");

  const formRefs = useRef(
    questions.reduce((acc, question) => {
      acc[question.id] = React.createRef();
      return acc;
    }, {})
  );

  const [returnData, setReturnData] = useState({});

  const [showResults, setShowResults] = useState(false);

  const importance_level_mapper = (level) => {
    switch (level) {
      case "notImportant":
        return 0;
      case "midImportance":
        return 5;
      case "highImportance":
        return 10;
    }

    return -1;
  };

  //TODO update to read new values
  const handleSubmit = (e) => {
    e.preventDefault();

    let results = {};

    // Iterate through each column
    for (const importance_level in columns) {
      // For each factor in the current column, map it to the column name
      columns[importance_level].forEach((factor) => {
        results[factor] = importance_level_mapper(importance_level);
      });
    }
    //for the time being until we added another slider
    results["flexibility"] = 0;
    results["risk_appetite"] = volatilitySlider / 100.0;
    results["weighing_scheme"] = weighing_scheme_choices[weighingScheme];
    console.log("submitted: ", results); // or send to an API or other destinations

    // Send the data to the server
    fetch(`//${import.meta.env.VITE_API_DOMAIN}/submitForm/`, {
      method: "POST", // or 'PUT' if updating existing data
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(results),
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
        <DragAndDrop
          columns={columns}
          setColumns={setColumns}
          factor_text_map={factor_text_map}
        />

        {/* Sliders 
          flexiblity*/}
        <p>Rate your flexibility with these ESG preferences.</p>
        <div className="w-3/4 flex items-center space-x-4">
          <span className="text-gray-600 text-lg whitespace-nowrap">Not flexible</span>
          <input
            type="range"
            min="0"
            max="20"
            value={flexibilitySlider}
            onChange={(e) => setFlexibilitySliderValue(e.target.value)}
            className="mx-4 w-full h-2 appearance-none bg-gray-300 rounded-full focus:outline-none slider-thumb"
          />
          <span className="text-gray-600 text-lg whitespace-nowrap">Most flexible</span>
        </div>
        <p>Rate your risk level.</p>
        {/* volatility / risk slider */}
        <div className="w-3/4 flex items-center space-x-4">
          <span className="text-gray-600 text-lg whitespace-nowrap">Conservative</span>
          <input
            type="range"
            min="5"
            max="16"
            value={volatilitySlider}
            onChange={(e) => setVolatilitySliderValue(e.target.value)}
            className="mx-4 w-full h-2 appearance-none bg-gray-300 rounded-full focus:outline-none slider-thumb"
          />
          <span className="text-gray-600 text-lg whitespace-nowrap">Aggressive growth</span>
          {/* <div>Selected Value: {volatilitySlider}%</div> */}
        </div>

        <div className="flex justify-left space-x-4">
          {Object.entries(weighing_scheme_choices).map(([key, value]) => (
            <label key={key} className="flex items-center space-x-2">
              <input
                type="radio"
                name="binaryChoice"
                value={key}
                checked={weighingScheme === key}
                onChange={() => setWeighingScheme(key)}
                className="form-radio"
              />
              <span>{value}</span>
            </label>
          ))}
        </div>

        <button type="submit" className="hover:opacity-75 bg-green-700 text-white px-4 py-2 rounded mb-4">
          Get Results
        </button>
      </form>

      {showResults && <RankingFormResults results={returnData} />}
    </div>
  );
};

export default RankingForm;
