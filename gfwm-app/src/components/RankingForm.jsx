import React, { useState } from "react";

import RankingFormResults from "./RankingFormResults";
import DragAndDrop from "./DragAndDrop";
import BinaryChoice from "./BinaryChoice";

// factors to get answers for:
// environment,
//social: community, human_rights, product_responsibility, workforce,
//governance: management, shareholders
// flexibility, risk

const RankingForm = () => {

  //map factor name to the text shown in the drag and drop box
  const factor_text_map = {
    environment: 
      "Environmental protection",
    human_rights: 
      "Respecting fundamental human rights conventions",
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

  //initial setup: 3 3 1 split
  //if columns start blank it might block clients from dragging factors into them
  const [columns, setColumns] = useState({
    notImportant: ["community", "shareholders", "management"],
    midImportance: ["product_responsibility", "workforce", "human_rights"],
    highImportance: ["environment"],
  });

  const [fossilFuelsChecked, setFossilFuelsChecked] = useState(true);
  const [weaponsChecked, setWeaponsChecked] = useState(true);

  const handleFossilFuelsCheckboxChange = () => {
    // simple toggle checkbox
    setFossilFuelsChecked(!fossilFuelsChecked);
  };

  const handleWeaponsCheckboxChange = () => {
    setWeaponsChecked(!weaponsChecked);
  };

  const [volatilitySlider, setVolatilitySliderValue] = useState(10);
  const [flexibilitySlider, setFlexibilitySliderValue] = useState(5);

  const weighing_scheme_choices = {
    choice1: "Equal Weights",
    choice2: "Markowitz Optimized",
  };
  const [weighingScheme, setWeighingScheme] = useState("choice1"); //equal weights as the default

  const [returnData, setReturnData] = useState({});

  const [showResults, setShowResults] = useState(false);

  //map columns to value used in filtering
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

  const handleSubmit = (e) => {
    e.preventDefault();

    let results = {};

    // collect dict of esg results from importance columns
    for (const importance_level in columns) {
      // For each factor in the current column, map it to the column name
      columns[importance_level].forEach((factor) => {
        results[factor] = importance_level_mapper(importance_level);
      });
    }
    results["avoid_fossil_fuels"] = fossilFuelsChecked;
    results["avoid_weapons"] = weaponsChecked;
    results["flexibility"] = flexibilitySlider / 100.0;
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

        {/* fossil fuels checkbox */}
      <label className="flex items-center space-x-2">
        <input
          type="checkbox"
          checked={fossilFuelsChecked}
          onChange={handleFossilFuelsCheckboxChange}
          className="h-4 w-4 text-green-700 focus:ring-green-800 border-gray-300 rounded"
        />
        <span className="text-gray-700">Avoid investing in fossil fuels?</span>
      </label>

      {/* weapons manufacturers checkbox */}
      <label className="flex items-center space-x-2">
        <input
          type="checkbox"
          checked={weaponsChecked}
          onChange={handleWeaponsCheckboxChange}
          className="h-4 w-4 text-green-700 focus:ring-green-800 border-gray-300 rounded"
        />
        <span className="text-gray-700">Avoid investing in weapons manufacturers?</span>
      </label>


        {/* Sliders 
          flexiblity*/}
        <p>Rate your flexibility with these ESG preferences.</p>
        <div className="w-3/4 flex items-center space-x-4">
          <span className="text-gray-600 text-lg whitespace-nowrap">Not flexible</span>
          <input
            type="range"
            min="0"
            max="30"
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
          <span className="text-gray-600 text-lg whitespace-nowrap">Growth</span>
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

      {showResults && <RankingFormResults results={returnData} columns = {columns} />}
    </div>
  );
};

export default RankingForm;
