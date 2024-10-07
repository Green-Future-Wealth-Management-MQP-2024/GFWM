import React from "react";

const RankingFormResults = ({ data }) => {
    return (
        <div className="ranking-form-results">
        <h2>Results</h2>
        <ul>
            {Object.entries(data).map(([key, data]) => (
            <li key={key}>
                 <strong>{key}</strong>{data}
            </li>
            ))}
        </ul>
        </div>
    );
    }


    export default RankingFormResults;