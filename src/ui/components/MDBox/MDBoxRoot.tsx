// 📁 src/ui/components/MDBox/MDBoxRoot.tsx
import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";

const MDBoxRoot = styled(Box)(({ theme, ownerState }) => {
  const { palette, functions, shape, shadows } = theme;
  const { variant, bgColor, color, opacity, borderRadius, shadow, coloredShadow } = ownerState;

  const { gradients, grey } = palette;
  const { linearGradient } = functions;

  // Couleurs grises disponibles
  const greyColors = {
    "grey-100": grey[100],
    "grey-200": grey[200],
    "grey-300": grey[300],
    "grey-400": grey[400],
    "grey-500": grey[500],
    "grey-600": grey[600],
    "grey-700": grey[700],
    "grey-800": grey[800],
    "grey-900": grey[900],
  };

  // Détermination de la couleur de fond
  let backgroundValue = bgColor;
  if (variant === "gradient" && gradients?.[bgColor]) {
    backgroundValue = linearGradient(gradients[bgColor].main, gradients[bgColor].state);
  } else if (palette[bgColor]?.main) {
    backgroundValue = palette[bgColor].main;
  } else if (greyColors[bgColor]) {
    backgroundValue = greyColors[bgColor];
  }

  // Couleur du texte
  const colorValue = palette[color]?.main || greyColors[color] || color;

  // Bordures arrondies
  const borderRadiusValue = typeof borderRadius === "string"
    ? shape.borderRadius
    : borderRadius;

  // Ombres
  const boxShadowValue =
    typeof shadow === "number"
      ? shadows[shadow]
      : shadows[0];

  return {
    opacity,
    background: backgroundValue,
    color: colorValue,
    borderRadius: borderRadiusValue,
    boxShadow: boxShadowValue,
  };
});

export default MDBoxRoot;
