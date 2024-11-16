import React, { useState } from "react";
import styled from "@emotion/styled";
import { DragDropContext, Droppable } from "react-beautiful-dnd";
import { Grid, Box } from "@mui/material";
import Divider from "@mui/material/Divider";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import { columnsFromBackend } from "./FormData";
import OptionCard from "./OptionCard";
import "./RankingForm.css"; // Import the CSS file
import RankingFormResults from "./RankingFormResults";
import { useRef } from "react";

const Container = styled("div")(() => ({
  display: "flex",
  flexDirection: "row",
}));

const TaskList = styled("div")(() => ({
  minHeight: "100px",
  display: "flex",
  flexDirection: "column",
  background: "#d7dce8",
  minWidth: "341px",
  borderRadius: "5px",
  padding: "15px 15px",
  marginRight: "45px",
}));

const TaskColumnStyles = styled("div")(() => ({
  margin: "8px",
  display: "flex",
  width: "100%",
  minHeight: "80vh",
}));
const Title = styled("span")(() => ({
  fontWeight: "bold",
  color: "#333333",
  fontSize: 16,
  marginBottom: "1.5px",
}));
const FilterIcon = styled("span")(() => ({
  marginBottom: "1.5px",
  color: "text.secondary",
}));



const RankingForm = () => {
  const [columns, setColumns] = useState(columnsFromBackend);
  const questions = [
    {
      id: "fossilFuels",
      text: "Minimizing investment in fossil fuel producers",
      link: "",
    },
    { id: "weapons", text: "Minimizing investment in weapons manufacturers" },
    {
      id: "environment",
      text: "Investing in environmentally friendly companies",
      link: "https://www.greenfuturewealth.com/environmental",
    },
    {
      id: "social",
      text: "Investing in companies with positive social impacts",
      link: "https://www.greenfuturewealth.com/social",
    },
    {
      id: "governance",
      text: "Investing in companies with strong governance",
      link: "https://www.greenfuturewealth.com/governance",
    },
  ];


  // 
  const formRefs = useRef(
    questions.reduce((acc, question) => {
      acc[question.id] = React.createRef();
      return acc;
    }, {})
  );
  // no change
  const [returnData, setReturnData] = useState({});

  const [showResults, setShowResults] = useState(false);


  // handle once submit is clicked
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
    


    // NO TOUCH
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

  const onDragEnd = (result, columns, setColumns) => {
    if (!result.destination) return;
    const { source, destination } = result;
    if (source.droppableId !== destination.droppableId) {
      const sourceColumn = columns[source.droppableId];
      const destColumn = columns[destination.droppableId];
      const sourceItems = [...sourceColumn.items];
      const destItems = [...destColumn.items];
      const [removed] = sourceItems.splice(source.index, 1);
      destItems.splice(destination.index, 0, removed);
      setColumns({
        ...columns,
        [source.droppableId]: {
          ...sourceColumn,
          items: sourceItems,
        },
        [destination.droppableId]: {
          ...destColumn,
          items: destItems,
        },
      });
    } else {
      const column = columns[source.droppableId];
      const copiedItems = [...column.items];
      const [removed] = copiedItems.splice(source.index, 1);
      copiedItems.splice(destination.index, 0, removed);
      setColumns({
        ...columns,
        [source.droppableId]: {
          ...column,
          items: copiedItems,
        },
      });
    }
  };

  return (
    <div>
    <DragDropContext
      onDragEnd={(result) => {
        onDragEnd(result, columns, setColumns);
      }}
    >
      <Container>
        <TaskColumnStyles>
          {Object.entries(columns).map(([columnId, column], index) => {
            return (
              <Droppable key={index} droppableId={columnId}>
                {(provided, snapshot ) => (
                  <TaskList
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                  >
                    <Box sx={{ width: "100%" }}>
                      <Grid
                        container
                        rowSpacing={1}
                        columnSpacing={{ xs: 1, sm: 2, md: 3 }}
                      >
                        <Grid item xs={10} key={index}>
                          <Title>{column.title}</Title>
                        </Grid>
                        <Grid
                          item
                          xs={2}
                          key={index}
                          display="flex"
                          alignContent="flex-end"
                          justifyContent="flex-end"
                        >
                          <FilterIcon>
                            <FilterAltIcon />
                          </FilterIcon>
                        </Grid>
                      </Grid>
                    </Box>
                    <Divider />

                    {column.items.map((item, index) => (
                      <TaskCard key={index} item={item} index={index} />
                    ))}
                    {provided.placeholder}
                  </TaskList>
                )}
              </Droppable>
            );
          })}
        </TaskColumnStyles>
      </Container>
    </DragDropContext>
      {showResults && <RankingFormResults data={returnData} />}
    </div>
  );
};

export default RankingForm;
