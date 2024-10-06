import React from "react";

const RankingFormResults = ({ responses }) => {
    return (
        <div className="ranking-form-results">
        <h2>Results</h2>
        <ul>
            {Object.entries(responses).map(([key, response]) => (
            <li key={key}>
                 {response}
            </li>
            ))}
        </ul>
        </div>
    );
    }


    export default RankingFormResults;