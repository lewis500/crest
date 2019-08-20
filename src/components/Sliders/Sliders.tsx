import React, { useContext } from "react";
import { withStyles, Theme } from "@material-ui/core/styles";
import { AppContext } from "src/ducks";
import Slider from "@material-ui/core/Slider";
import { Typography as Text, colors } from "@material-ui/core";
import makeStyles from "@material-ui/styles/makeStyles";
import TeX from "@matejmazur/react-katex";
import { params } from "src/constants";
import "katex/dist/katex.min.css";

const StyleSlider = withStyles((theme: Theme) => ({
  root: {
    color: theme.palette.primary.main,
    marginBottom: "15px"
  }
}))(Slider);

const v0Text = (
    <Text variant="body1">
      <TeX math="v_0" /> (initial speed)
    </Text>
  ),
  g1Text = (
    <Text variant="body1">
      <TeX math="g_1" /> (initial grade)
    </Text>
  ),
  g2Text = (
    <Text variant="body1">
      <TeX math="g_2" /> (final grade)
    </Text>
  ),
  lText = (
    <Text variant="body1">
      <TeX math="l" /> (curve length)
    </Text>
  ),
  xText = (
    <Text variant="body1">
      <TeX math="x" /> (car position)
    </Text>
  );

export default () => {
  const { state, dispatch } = useContext(AppContext);
  const { l, v0, g1, g2, x } = state;
  return (
    <>
      {xText}
      <StyleSlider
        onChange={(e, payload: number) => dispatch({ type: "SET_X", payload })}
        value={x}
        step={0.25}
        min={0}
        max={params.total}
      />
      <Text variant="body1">
        <TeX math="v_0" /> (initial speed)
      </Text>
      <StyleSlider
        onChange={(e, payload: number) => dispatch({ type: "SET_V0", payload })}
        value={v0}
        step={0.02}
        min={0}
        max={params.v0Max}
      />
      {g1Text}
      <StyleSlider
        onChange={(e, payload: number) => dispatch({ type: "SET_G1", payload })}
        value={g1}
        step={0.01}
        min={0}
        max={0.4}
      />
      {g2Text}
      <StyleSlider
        onChange={(e, payload: number) => dispatch({ type: "SET_G2", payload })}
        value={g2}
        step={0.01}
        min={-0.3}
        max={0.1}
      />
      {lText}
      <StyleSlider
        onChange={(e, payload: number) => dispatch({ type: "SET_L", payload })}
        value={l}
        step={1}
        min={0}
        max={params.total}
      />
    </>
  );
};
