export type PlantSpecies = "daisy" | "tulip" | "tree" | "cactus";

export const SPECIES: PlantSpecies[] = ["tulip", "daisy", "tree", "cactus"];

export type ColorOption = { id: string; hex: string };

// Colors of the flowers (or blossoms and fruits on the tree).
export const BLOOM_COLORS: ColorOption[] = [
  { id: "rose", hex: "#E58FA6" },
  { id: "red", hex: "#C9524B" },
  { id: "yellow", hex: "#E8B83D" },
  { id: "purple", hex: "#8D6BB8" },
  { id: "blue", hex: "#5B84C4" },
  { id: "white", hex: "#F7F4EC" },
];

export const POT_COLORS: ColorOption[] = [
  { id: "clay", hex: "#B8704A" },
  { id: "lapis", hex: "#1F3560" },
  { id: "green", hex: "#3E7C73" },
  { id: "cream", hex: "#D9CFBC" },
];

export type PlantConfig = {
  species: PlantSpecies;
  bloom: string; // id from BLOOM_COLORS
  pot: string; // id from POT_COLORS
};

export const DEFAULT_PLANT: PlantConfig = { species: "tulip", bloom: "rose", pot: "clay" };

// Number of different artworks needed to reach each growth stage (index = stage).
export const STAGE_THRESHOLDS = [0, 1, 4, 10, 20, 35];
export const MAX_STAGE = STAGE_THRESHOLDS.length - 1;

export function stageFor(count: number): number {
  let stage = 0;
  for (let i = 0; i < STAGE_THRESHOLDS.length; i += 1) {
    if (count >= STAGE_THRESHOLDS[i]) {
      stage = i;
    }
  }
  return stage;
}

// Artworks needed for the next stage, or null when the plant is fully grown.
export function nextThreshold(stage: number): number | null {
  return stage >= MAX_STAGE ? null : STAGE_THRESHOLDS[stage + 1];
}

export function colorHex(options: ColorOption[], id: string): string {
  return (options.find((option) => option.id === id) ?? options[0]).hex;
}

export function isValidConfig(value: unknown): value is PlantConfig {
  if (!value || typeof value !== "object") {
    return false;
  }
  const config = value as Record<string, unknown>;
  return (
    SPECIES.includes(config.species as PlantSpecies) &&
    BLOOM_COLORS.some((option) => option.id === config.bloom) &&
    POT_COLORS.some((option) => option.id === config.pot)
  );
}
