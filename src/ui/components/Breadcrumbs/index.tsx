import React from "react";
import { useLocation, Link as RouterLink } from "react-router-dom";
import { Breadcrumbs as MuiBreadcrumbs } from "@mui/material";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import Typography from "@mui/material/Typography";
import Link from "@mui/material/Link";
import MDBox from "../MDBox";
import MDTypography from "../MDTypography";

const Breadcrumbs = () => {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);

  return (
    <MDBox px={4} py={2} bgcolor="#F8FAFC">
      <MuiBreadcrumbs
        aria-label="breadcrumb"
        separator={<NavigateNextIcon fontSize="small" />}
        sx={{
          "& .MuiBreadcrumbs-separator": { color: "primary.main", opacity: 0.7 },
          "& a": {
            color: "primary.main",
            fontWeight: 500,
            textTransform: "capitalize",
            "&:hover": { textDecorationColor: "primary.main" },
          },
        }}
      >
        <Link component={RouterLink} underline="hover" color="inherit" to="/">
          Accueil
        </Link>
        {pathnames.map((value, index) => {
          const to = `/${pathnames.slice(0, index + 1).join("/")}`;
          const label = decodeURIComponent(value.replace(/-/g, " "));
          const isLast = index === pathnames.length - 1;
          return isLast ? (
            <Typography key={to} color="text.secondary" sx={{ textTransform: "capitalize", fontWeight: 600 }}>
              {label}
            </Typography>
          ) : (
            <Link key={to} component={RouterLink} underline="hover" color="inherit" to={to}>
              {label}
            </Link>
          );
        })}
      </MuiBreadcrumbs>

      <MDTypography
        variant="h6"
        fontWeight="bold"
        mt={1}
        textTransform="capitalize"
        color="primary.main"
      >
        {pathnames[pathnames.length - 1]?.replace(/-/g, " ") || "Accueil"}
      </MDTypography>
    </MDBox>
  );
};

export default Breadcrumbs;
