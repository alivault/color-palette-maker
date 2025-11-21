import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { GradientSlider } from "./GradientSlider";
import {
  getHueGradient,
  getSatGradient,
  getLightGradient,
} from "@/lib/color-utils";
import { Trash2, GripVertical, Plus, Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { v4 as uuidv4 } from "uuid";
import type { ColorStop } from "@/lib/color-utils";
import Color from "colorjs.io";

export type ControlsProps = {
  numTiles: number;
  onNumTilesChange: (value: number) => void;
  colors: ColorStop[];
  setColors: (colors: ColorStop[]) => void;
  selectedColorId: string | null;
  setSelectedColorId: (id: string | null) => void;
  takeLongWay: boolean;
  setTakeLongWay: (value: boolean) => void;
};

export function Controls({
  numTiles,
  onNumTilesChange,
  colors,
  setColors,
  selectedColorId,
  setSelectedColorId,
  takeLongWay,
  setTakeLongWay,
}: ControlsProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setColors(
        arrayMove(
          colors,
          colors.findIndex((item) => item.id === active.id),
          colors.findIndex((item) => item.id === over.id),
        ),
      );
    }
  };

  const addColor = () => {
    const lastColor = colors[colors.length - 1];
    const newColor: ColorStop = {
      id: uuidv4(),
      h: lastColor.h,
      s: lastColor.s,
      l: lastColor.l,
    };
    setColors([...colors, newColor]);
    setSelectedColorId(newColor.id);
  };

  const removeColor = (id: string) => {
    if (colors.length <= 2) return;
    const newColors = colors.filter((c) => c.id !== id);
    setColors(newColors);
    if (selectedColorId === id) {
      setSelectedColorId(null);
    }
  };

  const updateColor = (id: string, updates: Partial<ColorStop>) => {
    setColors(colors.map((c) => (c.id === id ? { ...c, ...updates } : c)));
  };

  const selectedColor = colors.find((c) => c.id === selectedColorId);

  const hueGradient = getHueGradient();
  const satGradient = selectedColor ? getSatGradient(selectedColor.h) : "";
  const lightGradient = selectedColor
    ? getLightGradient(selectedColor.h, selectedColor.s)
    : "";

  return (
    <div className="flex flex-col h-full">
      <div className="space-y-4 flex-none p-5 border-b">
        <div className="flex justify-between items-center">
          <Label>Number of colors</Label>
          <span className="font-mono text-sm">{numTiles}</span>
        </div>
        <Slider
          value={[numTiles]}
          onValueChange={(v) => onNumTilesChange(v[0])}
          min={2}
          max={100}
          step={1}
        />
        <div className="flex items-center justify-between pt-4">
          <div className="flex items-center gap-2">
            <Label htmlFor="long-way-switch">Rainbow mode</Label>
            <Tooltip delayDuration={0}>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-[200px]">
                  Force the gradient to take the long route around the color wheel, effectively creating a rainbow.
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
          <Switch
            id="long-way-switch"
            checked={takeLongWay}
            onCheckedChange={setTakeLongWay}
          />
        </div>
      </div>

      <div className="shrink min-h-0 overflow-y-auto p-5">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold">Colors</h3>
          </div>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={colors.map((c) => c.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {colors.map((color) => (
                  <SortableColorItem
                    key={color.id}
                    color={color}
                    isSelected={color.id === selectedColorId}
                    onClick={() =>
                      setSelectedColorId(
                        color.id === selectedColorId ? null : color.id,
                      )
                    }
                    onDelete={() => removeColor(color.id)}
                    canDelete={colors.length > 2}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          <Button onClick={addColor} className="w-full" variant="outline">
            <Plus className="w-4 h-4 mr-2" /> Add Color
          </Button>
        </div>
      </div>

      {selectedColor && (
        <div className="flex-none border-t px-5 pt-5 pb-10 space-y-6 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm">Edit Color</h3>
            <div
              className="w-6 h-6 rounded-full border border-border shadow-sm"
              style={{
                backgroundColor: `hsl(${selectedColor.h}, ${selectedColor.s * 100}%, ${selectedColor.l * 100}%)`,
              }}
            />
          </div>

          {/* Hue */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label className="text-xs">Hue</Label>
              <span className="font-mono text-xs">
                {Math.round(selectedColor.h)}
              </span>
            </div>
            <GradientSlider
              value={[selectedColor.h]}
              onValueChange={(v) => updateColor(selectedColor.id, { h: v[0] })}
              min={0}
              max={360}
              step={1}
              background={hueGradient}
              thumbColor={`hsl(${selectedColor.h}, 100%, 50%)`}
            />
          </div>

          {/* Saturation */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label className="text-xs">Saturation</Label>
              <span className="font-mono text-xs">
                {selectedColor.s.toFixed(2)}
              </span>
            </div>
            <GradientSlider
              value={[selectedColor.s]}
              onValueChange={(v) => updateColor(selectedColor.id, { s: v[0] })}
              min={0}
              max={1}
              step={0.01}
              background={satGradient}
              thumbColor={`hsl(${selectedColor.h}, ${selectedColor.s * 100}%, 50%)`}
            />
          </div>

          {/* Lightness */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label className="text-xs">Lightness</Label>
              <span className="font-mono text-xs">
                {selectedColor.l.toFixed(2)}
              </span>
            </div>
            <GradientSlider
              value={[selectedColor.l]}
              onValueChange={(v) => updateColor(selectedColor.id, { l: v[0] })}
              min={0}
              max={1}
              step={0.01}
              background={lightGradient}
              thumbColor={`hsl(${selectedColor.h}, ${selectedColor.s * 100}%, ${selectedColor.l * 100}%)`}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function SortableColorItem({
  color,
  isSelected,
  onClick,
  onDelete,
  canDelete,
}: {
  color: ColorStop;
  isSelected: boolean;
  onClick: () => void;
  onDelete: () => void;
  canDelete: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: color.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const hslString = `hsl(${color.h}, ${color.s * 100}%, ${color.l * 100}%)`;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 touch-none"
    >
      <div
        className={`flex-1 flex items-center gap-3 p-2 rounded-md border ${isSelected ? "border-primary ring-1 ring-primary" : "border-border"} bg-card hover:bg-accent/50 cursor-pointer transition-colors`}
        onClick={onClick}
      >
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 hover:bg-background rounded text-muted-foreground"
        >
          <GripVertical className="w-4 h-4" />
        </div>

        <div
          className="size-8 rounded border border-border shadow-sm"
          style={{ backgroundColor: hslString }}
        />

        <p className="flex text-xs text-muted-foreground font-mono">
          {new Color("hsl", [color.h, color.s * 100, color.l * 100]).to("srgb").toString({ format: "hex" })}
        </p>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="h-8 w-8 text-muted-foreground hover:text-destructive"
        disabled={!canDelete}
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  );
}
