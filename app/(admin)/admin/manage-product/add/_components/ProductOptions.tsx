"use client";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, X } from "lucide-react";
import { useState, useContext } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { Context } from "../_providers/ContextProvider";

interface SortableItemProps {
  id: string;
  option: string;
  onDelete: () => void;
}

const SortableItem = ({ id, option, onDelete }: SortableItemProps) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id,
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2"
    >
      <div className="flex items-center gap-2">
        <button
          className="cursor-grab text-gray-400 hover:text-gray-600"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="size-4" />
        </button>
        <span>{option}</span>
      </div>
      <button onClick={onDelete} className="text-gray-500 hover:text-gray-700">
        <X className="size-4" />
      </button>
    </div>
  );
};

const ProductOptions = () => {
  const [context, setContext] = useContext(Context);
  const [optionInput, setOptionInput] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleAddOption = () => {
    if (!optionInput.trim()) return;

    setContext({
      ...context,
      options: context.options
        ? [...context.options, optionInput.trim()]
        : [optionInput.trim()],
    });
    setOptionInput("");
  };

  const handleDeleteOption = (indexToDelete: number) => {
    setContext({
      ...context,
      options: (context.options ?? []).filter(
        (_, index) => index !== indexToDelete
      ),
    });
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = context.options.findIndex(
        (item) => `${item}` === active.id
      );
      const newIndex = context.options.findIndex(
        (item) => `${item}` === over.id
      );

      const newOptions = [...context.options];
      const [removed] = newOptions.splice(oldIndex, 1);
      newOptions.splice(newIndex, 0, removed);

      setContext({
        ...context,
        options: newOptions,
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          value={optionInput}
          onChange={(e) => setOptionInput(e.target.value)}
          placeholder="옵션을 입력해주세요"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAddOption();
            }
          }}
        />
        <Button onClick={handleAddOption} className="whitespace-nowrap">
          추가
        </Button>
      </div>

      {context.options && context.options.length > 0 && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={context.options.map((item) => `${item}`)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {context.options.map((option, index) => (
                <SortableItem
                  key={option}
                  id={`${option}`}
                  option={option}
                  onDelete={() => handleDeleteOption(index)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
};

export default ProductOptions;
