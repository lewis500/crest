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
  // getTangent,
  getGetY,
  getX0,
  getGetRDegrees,
  getXScale,
  getYScale,
  getY0,
  // getConnected,
  getXMax
  // getXs,
  // getX0
} from "src/ducks";
import clsx from "clsx";
import useStyles from "./styleVis";
import { createSelector as CS } from "reselect";
import useElementSize from "src/useElementSizeHook";

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

// const getTangentPath = mo((state: State) => {
//   let { x, y, xt, yt, mt } = getTangent(state);
//   return `M${scale(x)},${yScale(y)}L${scale(3 * xt)},${yScale(
//     yt + 2 * mt * xt
//   )}`;
// });

export default () => {
  const { state } = useContext(AppContext),
    classes = useStyles(EMPTY),
    containerRef = useRef<HTMLDivElement>(),
    { width, height } = marginer(useElementSize(containerRef)),
    xScale = getXScale(width),
    yScale = getYScale(height, width),
    [carWidth, carHeight] = [8, 4];
    console.log(getX0(state))
  // [carWidth, carHeight] = useMemo(() => {
  //   return [xScale(params.car.width), xScale(params.car.height)];
  // }, [xScale]);
  const getY = getGetY(state);

  return (
    <div ref={containerRef} className={classes.container}>
      <svg className={classes.svg}>
        <path className={classes.road} d={getRoadPath(xScale, yScale, getY)} />

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
        {/* {state.x < getXMax(state) && ( */}
        {/* <line x1={scale(getXs(state))} x2={scale(getXs(state)) } y1={0} y2={HEIGHT} stroke="black"/>
      <path
        d={getTangentPath(state)}
        className={clsx(
          classes.tangent,
          getConnected(state) && classes.connected
        )}
      /> */}
        {/* )} */}
      </svg>
    </div>
  );
};
