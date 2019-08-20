import React, {
  createElement as CE,
  FunctionComponent,
  useContext,
  useRef,
  useMemo
} from "react";
import { params } from "src/constants";
import mo from "memoize-one";
import {
  AppContext,
  State,
  getRoadPath,
  getGetY,
  getX0,
  getGetRDegrees,
  getXScale,
  getYScale,
  getY0,
  getXMax,
  getT,
  Xs
} from "src/ducks";
import clsx from "clsx";
import useStyles from "./styleVis";
import { createSelector as CS } from "reselect";
import useElementSize from "src/useElementSizeHook";
// import { makeStyles } from "@material-ui/styles";
import makeStyles from "@material-ui/styles/makeStyles";
import * as colors from "@material-ui/core/colors";
import range from "lodash.range";

const EMPTY = {},
  M = {
    top: 20,
    bottom: 20,
    left: 20,
    right: 10
  },
  gTranslate = `translate(${M.left},${M.top})`,
  marginer = ({ width, height }: { width: number; height: number }) => ({
    width: Math.max(width - M.left - M.right, 0),
    height: Math.max(height - M.top - M.bottom, 0)
  });

// export const Car: FunctionComponent<{
//   x: number;
//   y: number;
//   r: number;
//   className: string;
// }> = ({ x, y, r, className }) =>
//   CE("rect", {
//     width: CAR_WIDTH,
//     height: CAR_HEIGHT,
//     className,
//     y: -CAR_HEIGHT,
//     x: -CAR_WIDTH * 0.5,
//     transform: `translate(${x},${y}) rotate(${r}) `
//   });

// const Block: FunctionComponent<{
//   x: number;
//   y: number;
//   r: number;
//   className: string;
// }> = ({ x, y, r, className }) =>
//   CE("rect", {
//     width: BLOCK_WIDTH,
//     height: BLOCK_HEIGHT,
//     className,
//     y: -BLOCK_HEIGHT,
//     x: -BLOCK_WIDTH * 0.5,
//     transform: `translate(${x},${y}) rotate(${r}) `
//   });

const Tangent = (state: State, xScale: Mapper, yScale: Mapper) => {
  let t = getT(state);
  let { x, y, xt, yt, mt } = getT(state);

  return CE("path", {
    d: `M${xScale(x)},${yScale(y)}L${xScale(3 * xt)},${yScale(
      yt + 2 * mt * xt
    )}`,
    strokeWidth: "1px",
    stroke: "black"
  });
};

type Mapper = (v: number) => number;
type RoadProps = {
  x: Mapper;
  y: Mapper;
  getY: Mapper;
  x0: number;
  l: number;
};
const Road = (() => {
  const useStyleRoad = makeStyles({
    curve: {
      fill: "none",
      strokeWidth: "2px",
      stroke: colors.lightBlue["A400"]
    },
    road: {
      fill: colors.grey["200"]
    }
  });

  return React.memo(({ x, y, getY, x0, l }: RoadProps) => {
    const classes = useStyleRoad(EMPTY),
      roadPath =
        "M" +
        range(0, params.total, params.total / 100)
          .map(d => [x(d), y(getY(d))])
          .join("L") +
        "Z",
      curvePath =
        "M" +
        range(x0, x0 + l, l / 50)
          .map(d => [x(d), y(getY(d))])
          .join("L");
    return (
      <g>
        {CE("path", { className: classes.road, d: roadPath })}
        {CE("path", { className: classes.curve, d: curvePath })}
      </g>
    );
  });
})();

export default () => {
  const { state } = useContext(AppContext),
    classes = useStyles(EMPTY),
    containerRef = useRef<HTMLDivElement>(),
    { width, height } = marginer(useElementSize(containerRef)),
    xScale = getXScale(width),
    yScale = getYScale(height, width),
    carWidth = xScale(params.car.width),
    carHeight = xScale(params.car.height),
    blockWidth = xScale(params.block.width),
    blockHeight = xScale(params.block.height),
    getY = getGetY(state);
  // console.log(width, height);
  // { x, y, xt, yt, mt } = getTangent(state);

  return (
    <div ref={containerRef} className={classes.container}>
      <svg className={classes.svg}>
        {/* <path className={classes.road} d={getRoadPath(xScale, yScale, getY)} /> */}
        {CE(Road, {
          x: xScale,
          y: yScale,
          x0: getX0(state),
          getY,
          l: state.l
        })}
        {CE("rect", {
          width: carWidth,
          height: carHeight,
          className: classes.car,
          y: -carHeight,
          x: -carWidth * 0.5,
          transform: `translate(${xScale(state.x)},${yScale(
            getY(state.x)
          )}) rotate(${getGetRDegrees(state)(state.x)}) `
        })}
        {CE("rect", {
          width: blockWidth,
          height: blockHeight,
          className: classes.block,
          y: -blockHeight,
          x: -blockWidth * 0.5,
          transform: `translate(${xScale(params.block.x)},${yScale(
            getY(params.block.x)
          )}) rotate(${getGetRDegrees(state)(params.block.x)}) `
        })}
        {Tangent(state, xScale, yScale)}
        {/* <Car
          x={xScale(state.x)}
          y={yScale(getY(state.x))}
          className={classes.car}
          r={-getGetRDegrees(state)(state.x)}
        /> */}
        {/* <Block
          x={xScale(params.block.x)}
          y={yScale(getGetY(state)(params.block.x))}
          className={classes.block}
          r={-getGetRDegrees(state)(params.block.x)}
        /> */}
        { (
          <line
            x1={xScale(Xs(state))}
            x2={xScale(Xs(state))}
            y1={0}
            y2={height}
            stroke="black"
          />
        )}
        {/*
      <path
        d={getTangentPath(state)}
        className={clsx(
          classes.tangent,
          getConnected(state) && classes.connected
        )}
      /> */}
      </svg>
    </div>
  );
};
