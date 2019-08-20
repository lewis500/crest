import { makeStyles, colors } from "@material-ui/core";
export default makeStyles({
  road: {
    fill: colors.grey["200"]
  },
  svg: {
    display: "inline-block",
    margin: "30px 0",
    width: '100%',
    height: '100%',
    "& text": {
      fontFamily: "Puritan, san-serif",
      fontSize: "13px"
    }
  },
  container: {
    position: "relative",
    width: "100%",
    height: "100%"
  },
  tangent: {
    stroke: colors.pink["A700"],
    strokeWidth: "2px",
    fill: "none"
  },
  connected: {
    stroke: colors.pink["A200"],
    strokeDasharray: "2, 2"
  },
  text: {
    textAlign: "center",
    fontSize: "12px",
    fontFamily: "Puritan, sans-serif"
  },
  car: {
    fill: colors.purple["A400"]
  },
  block: {
    fill: colors.green["A700"]
  }
});
