import React, {
  createElement as CE,
  FunctionComponent,
  useContext,
  memo
} from "react";
import { params } from "src/constants";
import { colors } from "@material-ui/core";
import { scaleLinear } from "d3-scale";
import { makeStyles } from "@material-ui/styles";
import memoizeone from "memoize-one";
import { AppContext, State } from "src/ducks";
import { constants } from "http2";
import useStyles from "./styleVis";

const EMPTY = {};
const WIDTH = 500,
  HEIGHT = WIDTH / 4,
  scale = scaleLinear()
    .range([0, WIDTH])
    .domain([0, params.total]),
  yScale = scaleLinear()
    .range([HEIGHT, 0])
    .domain([0, params.total / 4]);

const CAR_WIDTH = scale(params.car.width),
  CAR_HEIGHT = HEIGHT-yScale(params.car.height),
  BLOCK_WIDTH = scale(params.block.width),
  BLOCK_HEIGHT = HEIGHT-yScale(params.block.height);

const range: number[] = Array.apply(null, { length: 80 }).map(
  (d: any, i: number) => (i / 80) * params.total
);

const getA = memoizeone((state: State) => (state.g2 - state.g1) / 2 / state.l);
const getX0 = memoizeone(
  (state: State) =>
    (-params.total * state.g2) / (state.g1 - state.g2) - state.l / 2
);
const getR = memoizeone((state: State, x?: number) => {
  let x0 = getX0(state);
  x = typeof x === "undefined" ? state.x : x;
  if (x < x0) return state.g1;
  if (x > x0 + state.l) return state.g2;
  return 2 * (x - x0) * getA(state) + state.g1;
});
const getRDegrees = memoizeone(
  (state: State, x?: number) => (Math.atan(getR(state, x)) * 180) / Math.PI
);
const getRRadians = memoizeone((state: State) => Math.atan(getR(state)));

const getY = memoizeone((state: State, cx?: number) => {
  let x0 = getX0(state);
  let x = typeof cx === "undefined" ? state.x : cx;
  if (x < x0) return x * state.g1;
  if (x > x0 + state.l) return state.g2 * (x - params.total);
  let a = getA(state);
  return (x - x0) * (x - x0) * a + state.g1 * x;
});

const getPath = memoizeone(
  (state: State) =>
    "M" + range.map(x => [scale(x), yScale(getY(state, x))]).join("L") + "Z"
);

export const Car: FunctionComponent<{
  x: number;
  y: number;
  r: number;
  className?: string;
}> = ({ x, y, r, className }) => {
  return CE("rect", {
    width: CAR_WIDTH,
    height: CAR_HEIGHT,
    className: className || "",
    y: -CAR_HEIGHT,
    x: -CAR_WIDTH * 0.5,
    transform: `translate(${x},${y}) rotate(${r}) `
  });
};
const Block: FunctionComponent<{
  x: number;
  y: number;
  r: number;
  className?: string;
}> = ({ x, y, r, className }) => {
  return CE("rect", {
    width: BLOCK_WIDTH,
    height: BLOCK_HEIGHT,
    className: className || "",
    y: -BLOCK_HEIGHT,
    x: -BLOCK_WIDTH * 0.5,
    transform: `translate(${x},${y}) rotate(${r}) `
  });
};

const getTangentPath = memoizeone((state: State) => {
  let r = getRRadians(state);
  let x =
    state.x +
    (Math.cos(r) * params.car.width) / 2 -
    params.car.height * Math.cos(Math.PI / 2 - r);
  let y =
    getY(state) +
    (Math.sin(r) * params.car.width) / 2 +
    params.car.height * Math.sin(Math.PI / 2 - r);
  let a = getA(state);
  let b = state.g1;
  let x0 = getX0(state);
  let xt = x + Math.sqrt((a * (x - x0) * (x - x0) + b * x - y) / a);
  let yt = getY(state, xt);
  return `M${scale(x)},${yScale(y)}L${scale(2 * xt)},${yScale(
    yt + ((yt - y) / (xt - x)) * xt
  )}`;
});

const Vis: FunctionComponent<{}> = () => {
  let { state } = useContext(AppContext);
  const classes = useStyles(EMPTY);
  return (
    <svg width={WIDTH} height={HEIGHT} className={classes.svg}>
      <path className={classes.road} d={getPath(state)} />
      <Car
        x={scale(state.x)}
        y={yScale(getY(state))}
        className={classes.car}
        r={-getRDegrees(state)}
      />
      <Block
        x={scale(params.block.x)}
        y={yScale(getY(state, params.block.x))}
        className={classes.block}
        r={-getRDegrees(state, params.block.x)}
      />
      <path d={getTangentPath(state)} className={classes.tangent} />
    </svg>
  );
};
export default Vis;
