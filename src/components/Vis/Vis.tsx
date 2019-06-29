import React, {
  createElement as CE,
  FunctionComponent,
  useContext
} from "react";
import { params } from "src/constants";
import { colors } from "@material-ui/core";
import { scaleLinear } from "d3-scale";
import { makeStyles } from "@material-ui/styles";
import memoizeone from "memoize-one";
import { AppContext, State } from "src/ducks";
import { constants } from "http2";
const EMPTY = {};
const useStyles = makeStyles({
  road: {
    fill: colors.grey["200"]
  },
  svg: {
    display: "inline-block",
    margin: "30px 0",
    "& text": {
      fontFamily: "Puritan, san-serif",
      fontSize: "13px"
    }
  },
  tangent: {
    stroke: colors.pink["A700"],
    strokeWidth: "2px",
    fill: "none"
  },
  text: {
    textAlign: "center",
    fontSize: "12px",
    fontFamily: "Puritan, sans-serif"
  },
  car: {
    fill: colors.lightBlue["A400"]
  }
});

const WIDTH = 500,
  HEIGHT = WIDTH/4,
  scale = scaleLinear()
    .range([0, WIDTH])
    .domain([0, params.total]),
  yScale = scaleLinear()
    .range([HEIGHT, 0])
    .domain([0, params.total/4 ]);

const CAR_WIDTH = scale(params.car.width),
  CAR_HEIGHT = scale(params.car.height);

const range: number[] = Array.apply(null, { length: 80 }).map(
  (d: any, i: number) => (i / 80) * params.total
);

const getA = memoizeone((state: State) => (state.g2 - state.g1) / 2 / state.l);
const getX0 = memoizeone((state: State) => {
  let res = (-params.total * state.g2) / (state.g1 - state.g2) - state.l / 2;
  return res;
});
const factor =
  ((((180 / Math.PI) * HEIGHT) / WIDTH) * scale.domain()[1]) /
  yScale.domain()[1];
const deg = (g: number) => Math.atan(g) *180/Math.PI;
const getR = memoizeone((state: State) => {
  let x0 = getX0(state);
  let { x } = state;
  if (x < x0) return -deg(state.g1);
  else if (x > x0 + state.l) return -deg(state.g2);
  let a = getA(state);
  return -deg(2 * (x - x0) * a + state.g1);
});

const deg2 = (g: number) => Math.atan(g);
const getR2 = memoizeone((state: State) => {
  let x0 = getX0(state);
  let { x } = state;
  if (x < x0) return deg2(state.g1);
  else if (x > x0 + state.l) return deg2(state.g2);
  let a = getA(state);
  return deg2(2 * (x - x0) * a + state.g1);
});
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

const r0 = Math.atan2(params.car.height, params.car.width / 2);
const z = Math.hypot(params.car.height, params.car.width / 2);
const Tangent = ({ state, className }: { state: State; className: string }) => {
  let r = getR2(state)
  let x = state.x + Math.cos(r) * params.car.width/2 - params.car.height * Math.cos(Math.PI/2 - r);
  let y = getY(state) + Math.sin(r) * params.car.width/2 + params.car.height * Math.sin(Math.PI/2 - r);
  let a = getA(state);
  let b = state.g1;
  let x0 = getX0(state);
  let xt = x + Math.sqrt((a * (x - x0) * (x - x0) + b * x - y) / a);
  let yt = getY(state, xt);

  return (
    <>
      {/* <circle r="1" cx={scale(x)} cy={yScale(y)} fill="black" /> */}
      <path
        d={`M${scale(x)},${yScale(y)}L${scale(2*xt)},${yScale(yt+(yt-y)/(xt-x)*xt) }`}
        className={className}
      />
    </>
  );
};

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
        r={getR(state)}
      />
      <Tangent state={state} className={classes.tangent} />
    </svg>
  );
};
export default Vis;
