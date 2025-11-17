// src/theme/index.ts
import { createTheme } from "@mui/material/styles";
import colors from "assets/theme/base/colors";
import functions from "assets/theme/functions";
import borders from "assets/theme/base/borders";
import typography from "assets/theme/base/typography";
import boxShadows from "assets/theme/base/boxShadows";
import breakpoints from "assets/theme/base/breakpoints";

const theme = createTheme({
  breakpoints: { ...breakpoints },
  palette: { ...colors },
  typography: { ...typography },
  boxShadows: { ...boxShadows },
  borders: { ...borders },
  functions: { ...functions },
});

export default theme;
