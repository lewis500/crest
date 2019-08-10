import React, { Dispatch } from "react";
import { params } from "src/constants";
import mo from "memoize-one";
import { createSelector as CS } from "reselect";
import get from "lodash/fp/get";
import { scaleLinear } from "d3-scale";

export const initialState = {
  play: false,
  x: 20,
  v: 18,
  v0: 18,
  time: 0,
  connected: false,
  g1: 0.3,
  g2: -0.3,
  l: params.total * 0.3
};
type Mapper = (v: number) => number;

export type State = typeof initialState;
type ActionTypes =
  | {
      type: "TICK";
      payload: number;
    }
  | { type: "SET_V0"; payload: number }
  | { type: "SET_G1"; payload: number }
  | { type: "SET_G2"; payload: number }
  | { type: "SET_L"; payload: number }
  | { type: "SET_X"; payload: number }
  | { type: "RESTART" }
  | { type: "RESET" }
  | { type: "SET_PLAY"; payload: boolean };

export const reducer = (state: State, action: ActionTypes): State => {
  switch (action.type) {
    case "TICK":
      // let connected = getConnected(state);
      let connected = true;
      let dt = action.payload;
      return {
        ...state,
        v: !connected ? state.v0 : state.v - dt * params.a,
        x: state.x + dt * state.v + (connected ? -dt * dt * params.a * 0.5 : 0),
        time: state.time + dt
      };
    case "SET_PLAY":
      return {
        ...state,
        play: action.payload
      };
    case "SET_V0":
      return {
        ...state,
        v0: action.payload
      };
    case "SET_G1":
      return {
        ...state,
        g1: action.payload
      };
    case "SET_G2":
      return {
        ...state,
        g2: action.payload
      };
    case "SET_L":
      return {
        ...state,
        l: action.payload
      };
    case "SET_X":
      return {
        ...state,
        x: action.payload
      };
    case "RESTART":
      return {
        ...state,
        time: 0,
        x: 0,
        v: state.v0
      };
    case "RESET":
      return {
        ...state,
        time: 0,
        x: 0,
        v: state.v0
      };
    default:
      return state;
  }
};

const getA = CS<State, number, number, number, number>(
    [get("g1"), get("g2"), get("l")],
    (g1, g2, l) => (g2 - g1) / 2 / l
  ),
  getX0 = CS<State, number, number, number, number>(
    [get("g1"), get("g2"), get("l")],
    (g1, g2, l) => (-params.total * g2) / (g1 - g2) - l / 2
  ),
  getY0 = CS<State, number, number, number>(
    [get("g1"), getX0],
    (g1, x0) => g1 * x0
  ),
  getGetY = CS<State, number, number, number, number, number, Mapper>(
    [get("g1"), get("g2"), get("l"), getA, getY0],
    (g1, g2, l, a, y0) => (x: number) => {
      if (x < 0) return x * g1;
      if (x > l) return x * g2;
      return x * x * a + g1 * x + y0;
    }
  ),
  getXMax = CS<State, number, number, number, number>(
    [getX0, get("g1"), getA],
    (x0, g1, a) => x0 - g1 / a / 2
  ),
  getGetRRadians = CS<State, number, number, number, number, Mapper>(
    [get("g1"), get("g2"), get("l"), getA],
    (g1, g2, l, a) => {
      const f = (x: number) => {
        if (x < 0) return g1;
        if (x > l) return g2;
        return 2 * x * a + g1;
      };
      return x => Math.atan(f(x));
    }
  ),
  getGetRDegrees = CS<State, Mapper, Mapper>(
    getGetRRadians,
    getRRadians => (x: number) => (getRRadians(x) * 180) / Math.PI
  ),
  getXScale = mo((width: number, x0: number) =>
    scaleLinear()
      .range([0, width])
      .domain([-x0, params.total - x0])
  ),
  getYScale = mo((height: number, width: number, y0: number) => {
    return scaleLinear()
      .range([height, 0])
      .domain([0, (params.total * height) / width]);
  }),
  getRoadPath = (() => {
    const range: number[] = Array.apply(null, { length: 50 }).map(
      (d: any, i: number, k: any[]) => (i / k.length) * params.total
    );
    return mo(
      (xScale: Mapper, yScale: Mapper, getY: Mapper) =>
        "M" + range.map(x => [xScale(x), yScale(getY(x))]).join("L") + "Z"
    );
  })();
export {
  getXMax,
  getGetRDegrees,
  getGetY,
  getXScale,
  getYScale,
  getX0,
  getRoadPath,
  getY0
};

// getGetRRadians = (s: State) => {
//   let f = getGetRGrade(s);
//   return (x: number) => Math.atan(f(x));
// };
// getGetRDegrees = CS<State,number,number,number>(
//   [getGetRGrade, ]
// )

// export const getR = mo((state: State, x?: number) => {
//   let x0 = getX0(state);
//   x = typeof x === "undefined" ? state.x : x;
//   if (x < x0) return state.g1;
//   if (x > x0 + state.l) return state.g2;
//   return 2 * (x - x0) * getA(state) + state.g1;
// });

// Math.
// export const getRDegrees = mo(
//   (state: State, x?: number) => (Math.atan(getR(state, x)) * 180) / Math.PI
// );
// export const getRRadians = mo((state: State) => Math.atan(getR(state)));

// export const getY = mo((state: State, cx?: number) => {
//   let x0 = getX0(state),
//     x = typeof cx === "undefined" ? state.x : cx;
//   if (x < x0) return x * state.g1;
//   if (x > x0 + state.l) return state.g2 * (x - params.total);
//   return (x - x0) * (x - x0) * getA(state) + state.g1 * x;
// });

// export const getXMax = mo(
//   (state: State) => getX0(state) - state.g1 / getA(state) / 2
// );

// export const getXs = mo((state: State) => {
//   const x0 = getX0(state),
//     { g1 } = state,
//     a = getA(state),
//     { mt: m, xt, yt } = getTangent(state),
//     y0 = yt - m * xt,
//     h2 = params.block.height;
//   return (
//     (2 * a * x0 -
//       g1 +
//       m -
//       Math.sqrt(
//         -4 * a * g1 * x0 -
//           4 * a * h2 +
//           4 * a * m * x0 +
//           4 * a * y0 +
//           g1 * g1 -
//           2 * g1 * m +
//           m * m
//       )) /
//     (2 * a)
//   );
// });

// export const getConnected = mo((state: State) => {
//   let xb = params.block.x;
//   let yb = getY(state, xb) + params.block.height;
//   let { mt, x, y, xt } = getTangent(state);
//   return (xb - x) * mt + y < yb || xb < xt;
// });

// export const getBlockTangent = mo((state: State) => {
//   let x = params.block.x;
//   let y = getY(state, x) + params.block.height;
//   let a = getA(state);
//   let b = state.g1;
//   let x0 = getX0(state);
//   let xt = x + Math.sqrt((a * (x - x0) * (x - x0) + b * x - y) / a);
//   let yt = getY(state, xt);
//   let mt = (yt - y) / (xt - x);
// });

// export const getTangent = mo((state: State) => {
//   let r = getRRadians(state);
//   let x =
//     state.x +
//     (Math.cos(r) * params.car.width) / 2 -
//     params.car.height * Math.sin(r);
//   let y =
//     getY(state) +
//     (Math.sin(r) * params.car.width) / 2 +
//     params.car.height * Math.cos(r);
//   let a = getA(state);
//   let b = state.g1;
//   let x0 = getX0(state);
//   let xt = x + Math.sqrt((a * (x - x0) * (x - x0) + b * x - y) / a);
//   let yt = getY(state, xt);
//   let mt = (yt - y) / (xt - x);
//   // let
//   return { x, y, xt, yt, mt };
// });

export const AppContext = React.createContext<{
  state: State;
  dispatch?: Dispatch<ActionTypes>;
}>({ state: initialState, dispatch: null });

// export const getxssd = mo(
//   (v0: number) => v0 * params.tp + (v0 * v0) / 2 / params.a
// );
