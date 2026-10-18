import Svg, { Circle, Ellipse, G, Path, Rect } from "react-native-svg";

import { BLOOM_COLORS, colorHex, MAX_STAGE, POT_COLORS, PlantConfig } from "./catalog";

const LEAF = "#4F8A5B";
const LEAF_LIGHT = "#6BAA75";
const LEAF_DARK = "#3F7449";
const TRUNK = "#7A5A3A";
const SOIL = "#4A382B";

type Props = {
  config: PlantConfig;
  stage: number;
  size?: number;
};

// y coordinate of the top of the stem, per stage (the soil is at y = 172).
const STEM_TOP = [172, 150, 128, 105, 82, 62];
const TREE_TOP = [172, 150, 132, 108, 92, 82];

function Leaf({ x, y, angle, length, width = 0.34, color = LEAF }: {
  x: number;
  y: number;
  angle: number;
  length: number;
  width?: number;
  color?: string;
}) {
  const half = length * width;
  return (
    <G transform={`translate(${x} ${y}) rotate(${angle})`}>
      <Path
        d={`M0 0 Q${length / 2} ${-half} ${length} 0 Q${length / 2} ${half} 0 0 Z`}
        fill={color}
      />
    </G>
  );
}

function Seed() {
  return (
    <G>
      <Ellipse cx={100} cy={168} rx={7} ry={4.5} fill="#8A6A44" />
      <Path d="M95 166 Q100 160 105 166" stroke="#B89A6C" strokeWidth={1.5} fill="none" />
    </G>
  );
}

function Stem({ stage, color }: { stage: number; color: string }) {
  const top = STEM_TOP[stage];
  const pairs = [0, 1, 2, 3, 3, 4][stage];
  const length = 20 + stage * 3;
  const leaves = [];
  for (let i = 0; i < pairs; i += 1) {
    const y = 160 - i * 17;
    if (y < top + 6) {
      break;
    }
    leaves.push(
      <Leaf key={`r${i}`} x={100} y={y} angle={-35} length={length} color={i % 2 ? LEAF_LIGHT : LEAF} />,
      <Leaf key={`l${i}`} x={100} y={y} angle={215} length={length} color={i % 2 ? LEAF : LEAF_LIGHT} />
    );
  }
  return (
    <G>
      <Path d={`M100 172 L100 ${top}`} stroke={color} strokeWidth={stage > 3 ? 5 : 4} strokeLinecap="round" />
      {stage <= 2 ? (
        <>
          <Leaf x={100} y={top} angle={-40} length={14 + stage * 4} />
          <Leaf x={100} y={top} angle={220} length={14 + stage * 4} color={LEAF_LIGHT} />
        </>
      ) : null}
      {leaves}
    </G>
  );
}

function Daisy({ stage, bloom }: { stage: number; bloom: string }) {
  const top = STEM_TOP[stage];
  return (
    <G>
      <Stem stage={stage} color={LEAF_DARK} />
      {stage === 3 || stage === 4 ? (
        <Ellipse cx={100} cy={top - 4} rx={stage === 3 ? 6 : 9} ry={stage === 3 ? 8 : 12} fill={bloom} opacity={0.85} />
      ) : null}
      {stage === 5 ? (
        <G>
          {Array.from({ length: 10 }).map((_, i) => (
            <G key={i} transform={`translate(100 ${top}) rotate(${i * 36})`}>
              <Ellipse cx={0} cy={-15} rx={5.5} ry={12} fill={bloom} stroke="#00000014" strokeWidth={0.5} />
            </G>
          ))}
          <Circle cx={100} cy={top} r={8} fill="#8A5A2B" />
        </G>
      ) : null}
    </G>
  );
}

function Tulip({ stage, bloom }: { stage: number; bloom: string }) {
  const top = STEM_TOP[stage];
  return (
    <G>
      <Stem stage={stage} color={LEAF_DARK} />
      {stage === 3 || stage === 4 ? (
        <Ellipse cx={100} cy={top - 6} rx={stage === 3 ? 6 : 9} ry={stage === 3 ? 10 : 14} fill={bloom} />
      ) : null}
      {stage === 5 ? (
        <G>
          <Path
            d={`M86 ${top + 8} C82 ${top - 8} 88 ${top - 20} 92 ${top - 26} L100 ${top - 10} L108 ${top - 26} C112 ${top - 20} 118 ${top - 8} 114 ${top + 8} Q100 ${top + 18} 86 ${top + 8} Z`}
            fill={bloom}
          />
          <Path d={`M100 ${top - 10} L100 ${top + 12}`} stroke="#00000022" strokeWidth={1.5} />
        </G>
      ) : null}
    </G>
  );
}

const CANOPY: number[][][] = [
  [],
  [],
  [[100, -8, 20]],
  [[100, -14, 26], [82, 0, 20], [118, 0, 20]],
  [[100, -20, 30], [78, -2, 24], [122, -2, 24], [100, 4, 24]],
  [[100, -24, 32], [74, -6, 27], [126, -6, 27], [100, 2, 28], [86, -22, 24], [114, -22, 24]],
];

const BLOSSOMS: number[][] = [
  [-30, -8], [-18, -30], [4, -40], [26, -26], [34, -4], [16, 4], [-8, -12],
  [-26, 10], [10, -18], [-4, -30], [22, -12], [-14, 2], [30, -18], [-34, -20],
];

function Tree({ stage, bloom }: { stage: number; bloom: string }) {
  if (stage <= 1) {
    return <Stem stage={stage} color={TRUNK} />;
  }
  const top = TREE_TOP[stage];
  const blossoms = stage === 5 ? BLOSSOMS.length : stage === 4 ? 6 : 0;
  const shades = [LEAF, LEAF_LIGHT, LEAF_DARK];
  return (
    <G>
      <Path d={`M94 172 L106 172 L103 ${top} L97 ${top} Z`} fill={TRUNK} />
      {stage >= 3 ? (
        <>
          <Path d={`M100 ${top + 40} L84 ${top + 22}`} stroke={TRUNK} strokeWidth={4} strokeLinecap="round" />
          <Path d={`M100 ${top + 28} L116 ${top + 8}`} stroke={TRUNK} strokeWidth={4} strokeLinecap="round" />
        </>
      ) : null}
      {CANOPY[stage].map(([cx, dy, r], i) => (
        <Circle key={i} cx={cx} cy={top + dy} r={r} fill={shades[i % 3]} />
      ))}
      {BLOSSOMS.slice(0, blossoms).map(([dx, dy], i) => (
        <Circle key={`b${i}`} cx={100 + dx} cy={top + dy} r={stage === 5 ? 4.2 : 3.6} fill={bloom} />
      ))}
      {stage === 5 ? (
        <>
          <Circle cx={84} cy={170} r={2.4} fill={bloom} />
          <Circle cx={118} cy={171} r={2.4} fill={bloom} />
          <Circle cx={108} cy={169} r={2} fill={bloom} />
        </>
      ) : null}
    </G>
  );
}

function Cactus({ stage, bloom }: { stage: number; bloom: string }) {
  const heights = [0, 22, 38, 54, 70, 76];
  const h = heights[stage];
  const w = stage === 1 ? 24 : 34;
  const baseY = 172;
  return (
    <G>
      <Rect x={100 - w / 2} y={baseY - h} width={w} height={h + 4} rx={w / 2} fill={LEAF} />
      {[-8, 0, 8].map((dx) => (
        <Path
          key={dx}
          d={`M${100 + dx} ${baseY - h + 8} L${100 + dx} ${baseY}`}
          stroke={LEAF_DARK}
          strokeWidth={1.4}
          opacity={0.6}
        />
      ))}
      {stage >= 3 ? (
        <Path
          d={`M${100 - w / 2 + 2} ${baseY - h * 0.45} L76 ${baseY - h * 0.45} L76 ${baseY - h * 0.45 - 18}`}
          stroke={LEAF}
          strokeWidth={11}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      ) : null}
      {stage >= 4 ? (
        <Path
          d={`M${100 + w / 2 - 2} ${baseY - h * 0.6} L124 ${baseY - h * 0.6} L124 ${baseY - h * 0.6 - 16}`}
          stroke={LEAF}
          strokeWidth={11}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      ) : null}
      {stage === 5 ? (
        <G>
          {Array.from({ length: 6 }).map((_, i) => (
            <G key={i} transform={`translate(100 ${baseY - h - 2}) rotate(${i * 60})`}>
              <Ellipse cx={0} cy={-8} rx={4} ry={8} fill={bloom} />
            </G>
          ))}
          <Circle cx={100} cy={baseY - h - 2} r={3.5} fill="#E8B83D" />
          <Circle cx={76} cy={baseY - h * 0.45 - 20} r={4} fill={bloom} />
        </G>
      ) : null}
    </G>
  );
}

export default function PlantView({ config, stage, size = 200 }: Props) {
  const safeStage = Math.max(0, Math.min(MAX_STAGE, stage));
  const bloom = colorHex(BLOOM_COLORS, config.bloom);
  const pot = colorHex(POT_COLORS, config.pot);

  let plant = null;
  if (safeStage === 0) {
    plant = null;
  } else if (config.species === "daisy") {
    plant = <Daisy stage={safeStage} bloom={bloom} />;
  } else if (config.species === "tree") {
    plant = <Tree stage={safeStage} bloom={bloom} />;
  } else if (config.species === "cactus") {
    plant = <Cactus stage={safeStage} bloom={bloom} />;
  } else {
    plant = <Tulip stage={safeStage} bloom={bloom} />;
  }

  return (
    <Svg width={size} height={size * 1.2} viewBox="0 0 200 240">
      <Ellipse cx={100} cy={230} rx={52} ry={6} fill="#00000014" />
      {plant}
      <Ellipse cx={100} cy={173} rx={34} ry={6} fill={SOIL} />
      {safeStage === 0 ? <Seed /> : null}
      <Rect x={62} y={172} width={76} height={14} rx={4} fill={pot} />
      <Path d="M68 186 L132 186 L122 228 L78 228 Z" fill={pot} />
      <Path d="M68 186 L132 186 L131 191 L69 191 Z" fill="#00000022" />
    </Svg>
  );
}
