import React, {
  createElement as CE,
  FunctionComponent,
  useContext
} from "react";
import { params } from "src/constants";
import { scaleLinear } from "d3-scale";
import mo from "memoize-one";
import { AppContext, State, getTangent, getRDegrees, getY } from "src/ducks";
import useStyles from "./styleVis";
import {} from "src/ducks";

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
  CAR_HEIGHT = HEIGHT - yScale(params.car.height),
  BLOCK_WIDTH = scale(params.block.width),
  BLOCK_HEIGHT = HEIGHT - yScale(params.block.height);

const getRoadPath = (() => {
  const range: number[] = Array.apply(null, { length: 50 }).map(
    (d: any, i: number, k: any[]) => (i / k.length) * params.total
  );

  return mo(
    (state: State) =>
      "M" + range.map(x => [scale(x), yScale(getY(state, x))]).join("L") + "Z"
  );
})();

export const Car: FunctionComponent<{
  x: number;
  y: number;
  r: number;
  className: string;
}> = ({ x, y, r, className }) => 
  CE("rect", {
    width: CAR_WIDTH,
    height: CAR_HEIGHT,
    className,
    y: -CAR_HEIGHT,
    x: -CAR_WIDTH * 0.5,
    transform: `translate(${x},${y}) rotate(${r}) `
  });

const Block: FunctionComponent<{
  x: number;
  y: number;
  r: number;
  className: string;
}> = ({ x, y, r, className }) => 
  CE("rect", {
    width: BLOCK_WIDTH,
    height: BLOCK_HEIGHT,
    className,
    y: -BLOCK_HEIGHT,
    x: -BLOCK_WIDTH * 0.5,
    transform: `translate(${x},${y}) rotate(${r}) `
  });


const getTangentPath = mo((state: State) => {
  let { x, y, xt, yt, mt } = getTangent(state);
  return `M${scale(x)},${yScale(y)}L${scale(2 * xt)},${yScale(yt + mt * xt)}`;
});

const Vis: FunctionComponent<{}> = () => {
  let { state } = useContext(AppContext);
  const classes = useStyles(EMPTY);
  return (
    <svg width={WIDTH} height={HEIGHT} className={classes.svg}>
      <path className={classes.road} d={getRoadPath(state)} />
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
