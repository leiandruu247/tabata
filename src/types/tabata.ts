export type Exercise = {
  id: string;
  type: "exercise";
  name: string;
  duration: number;
  rest: number;
  repetitions: number;
};

export type Combo = {
  id: string;
  type: "combo";
  name: string;
  children: TabataItem[];
  repetitions: number;
};

export type TabataItem = Exercise | Combo;

export function isCombo(item: TabataItem): item is Combo {
  return item.type === "combo";
}
