import React, { FunctionComponent, useContext, useReducer } from "react";
import Button from "@material-ui/core/Button";
import Slider from "@material-ui/lab/Slider";
import { Toolbar, Typography as Text, colors } from "@material-ui/core";
import { withStyles, Theme } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import useTimer from "src/useTimerHook";
// import { TeX } from "react-katex";
import Vis from "src/components/Vis";
import Plot from "src/components/Plot";
import { params, widths } from "src/constants";
import { makeStyles } from "@material-ui/styles";
import { AppContext, getxssd, getxcl, reducer, initialState } from "src/ducks";
import TeX from "@matejmazur/react-katex";

const useStyles = makeStyles({
  "@global": {
    body: {
      margin: "0 !important",
      padding: "0 !important",
      fontFamily: " 'Puritan', sans-serif"
    }
  },
  main: {
    maxWidth: "900px",
    color: colors.grey["800"],
    margin: "0 auto",
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column"
  },
  red: {
    fill: colors.red["A400"]
  },
  paper: {
    maxWidth: "500px",
    margin: "auto",
    display: "flex",
    padding: "24px 36px",
    flexDirection: "column"
  },
  button: {
    alignSelf: "center"
  },
  visContainer: {
    margin: "0 auto"
  },
  sliderContainer: {
    width: "300px",
    padding: "20px",
    boxSizing: "border-box"
  }
});

// type setter = React.Dispatch<React.SetStateAction<number>>;
const Sliders = (() => {
  const StyleSlider = withStyles((theme: Theme) => ({
    root: {
      color: theme.palette.primary.main,
      marginBottom: "15px"
    }
  }))(Slider);
  const x0Text = (
    <Text variant="body1">
      <TeX math="x_0" /> (position when light turns green → yellow)
    </Text>
  );
  const v0Text = (
    <Text variant="body1">
      <TeX math="v_0" /> (speed when light changes green → yellow)
    </Text>
  );
  const yellowText = (
    <Text variant="body1">
      <TeX math="t_y" /> (yellow light duration)
    </Text>
  );

  return () => {
    const { state, dispatch } = useContext(AppContext);
    const { x0, v0, yellow } = state;
    return (
      <>
        {x0Text}
        <StyleSlider
          onChange={(e, payload: number) =>
            dispatch({ type: "SET_X0", payload })
          }
          value={x0}
          step={0.02}
          min={0}
          max={widths.start}
        />
        {v0Text}
        <StyleSlider
          onChange={(e, payload: number) =>
            dispatch({ type: "SET_V0", payload })
          }
          value={v0}
          step={0.1}
          min={0}
          max={params.v0Max}
        />
        {yellowText}
        <StyleSlider
          onChange={(e, payload: number) =>
            dispatch({ type: "SET_YELLOW", payload })
          }
          value={yellow}
          step={0.1}
          min={0}
          max={params.yellowMax}
        />
      </>
    );
  };
})();

const EMPTY = {};
const App: FunctionComponent<{}> = () => {
  const { state, dispatch } = useContext(AppContext);
  const { x0, v0, stopper, mover, time, play, yellow } = state;

  const classes = useStyles(EMPTY);
  const xssd = getxssd(v0);
  const xcl = getxcl(v0, yellow);

  useTimer((dt: number) => {
    dt /= params.delta;
    if (mover.x > widths.start - widths.total || stopper.v > 0) {
      dispatch({ type: "TICK", payload: { dt, xssd } });
    } else {
      setTimeout(() => {
        dispatch({ type: "RESTART" });
      }, 0);
    }
  }, play);

  return (
    <div className={classes.main}>
      <div className={classes.visContainer}>
        {Vis({
          mover,
          stopper,
          xcl,
          x0,
          lightColor:
            time < (widths.start - x0) / v0
              ? "green"
              : time - (widths.start - x0) / v0 < yellow
              ? "yellow"
              : "red",
          xssd
        })}
      </div>
      <Paper className={classes.paper} elevation={2}>
        <Sliders />
        <Button
          className={classes.button}
          variant="contained"
          color="secondary"
          onClick={() => dispatch({ type: "SET_PLAY", payload: !play })}
        >
          {play ? "PAUSE" : "PLAY"}
        </Button>
        <Button
          className={classes.button}
          style={{ marginTop: "10px" }}
          variant="contained"
          color="secondary"
          onClick={() => {
            dispatch({ type: "RESET" });
          }}
        >
          Reset
        </Button>
      </Paper>
      <div style={{ margin: "0 auto" }}>
        <Plot />
      </div>
    </div>
  );
};

export default () => {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      <App />
    </AppContext.Provider>
  );
};
