import React, { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const DragAndDrop = ({ columns, setColumns, factor_text_map }) => {

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
        const activeColumnId = active.data.current.sortable.containerId;
        const overColumnId = over.data.current.sortable.containerId
    //   const activeColumn = columns[active.data.current.sortable.containerId];
    //   const overColumn = columns[over.data.current.sortable.containerId];
      const updatedColumns = { ...columns };

      // Remove the factor from the active column
      updatedColumns[activeColumnId] = updatedColumns[activeColumnId].filter(
        (item) => item !== active.id
      );

      // Add the factor to the over column
      updatedColumns[overColumnId] = [...updatedColumns[overColumnId], active.id];

      // Update the state in the parent component
      setColumns(updatedColumns);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-evenly",
          width: "100%",
        }}
      >
        {Object.keys(columns).map((importance_level) => (
          <SortableContext
            key={importance_level}
            items={columns[importance_level]} // The items within the column
            id={importance_level} // This assigns the column's ID
            strategy={verticalListSortingStrategy}
          >
            <DroppableColumn id={importance_level} title={importance_level}>
              {
                //populate the columns with their factors
                columns[importance_level].map((factor) => (
                  <DraggableItem key={factor} id={factor}>
                    {factor_text_map[factor]}
                  </DraggableItem>
                ))
              }
            </DroppableColumn>
          </SortableContext>
        ))}
      </div>
    </DndContext>
  );
};

const DroppableColumn = ({ id, title, children }) => {
  const { setNodeRef, isOver } = useDroppable({
    id, // The ID of the column as a droppable zone
  });

  return (
    <div
      id={id}
      style={{
        margin: 20,
        border: "1px solid gray",
        padding: 10,
        width: 400, // Increased width
        minHeight: 200, // Optional: Increase height for more content
        backgroundColor: isOver ? "#d1ffd6" : "#f9f9f9", // Highlight when a factor is dragged over
        position: "relative", // Prevent overlap during drag
        overflow: "hidden", // Prevent content overflow when dragging
      }}
    >
      <h4>{title.replace(/([A-Z])/g, " $1").toUpperCase()}</h4>
      {children}
    </div>
  );
};

const DraggableItem = ({ id, children }) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    padding: 10,
    margin: "5px 0",
    backgroundColor: "#f1f1f1",
    zIndex: transform ? 10 : 1, // Apply higher z-index during drag, when transform is truthy
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </div>
  );
};

export default DragAndDrop;
