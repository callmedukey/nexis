"use client";

import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import { GripVertical, Plus, X } from "lucide-react";
import { useContext, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { Context } from "../_providers/ContextProvider";

export default function ProductOptions() {
  const [context, setContext] = useContext(Context);
  const [newOption, setNewOption] = useState("");

  const handleAddOption = () => {
    if (!newOption.trim()) return;
    setContext((prev) => ({
      ...prev,
      options: [...prev.options, newOption.trim()],
    }));
    setNewOption("");
  };

  const handleRemoveOption = (index: number) => {
    setContext((prev) => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index),
    }));
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(context.options);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setContext((prev) => ({
      ...prev,
      options: items,
    }));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <Label htmlFor="option" className="text-sm font-medium">
            옵션
          </Label>
          <Input
            id="option"
            value={newOption}
            onChange={(e) => setNewOption(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddOption();
              }
            }}
            placeholder="옵션을 입력하세요"
          />
        </div>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={handleAddOption}
        >
          <Plus className="size-4" />
        </Button>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="options">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-2"
            >
              {context.options.map((option, index) => (
                <Draggable
                  key={option + index}
                  draggableId={option + index}
                  index={index}
                >
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className="flex items-center gap-2 rounded-lg border bg-background p-2"
                    >
                      <div
                        {...provided.dragHandleProps}
                        className="cursor-grab p-1 hover:text-foreground/80"
                      >
                        <GripVertical className="size-4" />
                      </div>
                      <span className="flex-1">{option}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-6"
                        onClick={() => handleRemoveOption(index)}
                      >
                        <X className="size-4" />
                      </Button>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}
