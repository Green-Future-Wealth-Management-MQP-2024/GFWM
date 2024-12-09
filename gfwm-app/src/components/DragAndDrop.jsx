import React, { useState } from "react";
import {
  DndContext,
  rectIntersection,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const DragAndDrop = ({ columns, setColumns, factor_text_map }) => {

  const [activeId, setActiveId] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  const handleDragStart = (event) => {
    setActiveId(event.active.id); // Set the active ID when dragging starts
  };


  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveId(null);

    if (over) {
        const activeColumnId = active.data.current.sortable.containerId;
        const overColumnId = over.id;
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
      collisionDetection={rectIntersection}
      onDragStart={handleDragStart}
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
            <DroppableColumn id={importance_level} title={importance_level} isDragging = {!!activeId}>
              {
                
                columns[importance_level].length > 0 ? (
                //populate the columns with their factors
                columns[importance_level].map((factor) => (
                  <DraggableItem key={factor} id={factor}>
                    {factor_text_map[factor]}
                  </DraggableItem>
                ))
              ) : (
                <div
                  style={{
                    textAlign: "center",
                    color: "gray",
                    padding: "10px 0",
                  }}
                >
                  Drag items here
                </div>
              )
            }
            </DroppableColumn>
          </SortableContext>
        ))}
      </div>


      <DragOverlay>
        {activeId ? (
          <div
            style={{
              padding: 10,
              backgroundColor: "#f1f1f1",
              boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
              borderRadius: 4,
            }}
          >
            {factor_text_map[activeId]}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

const DroppableColumn = ({ id, title, children, isDragging }) => {
  const { setNodeRef, isOver } = useDroppable({
    id, // The ID of the column as a droppable zone
  });

  return (
    <div
      ref = {setNodeRef}
      id={id}
      style={{
        margin: 20,
        border: "1px solid gray",
        padding: isDragging ? 20 : 10,
        width: 400, // Increased width
        minHeight: isDragging ? 220 : 200, // Optional: Increase height for more content
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
