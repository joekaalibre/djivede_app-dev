import React from "react";
import { Link } from "react-router-dom";
import { Card, CardMedia, Tooltip } from "@mui/material";
import MDBox from "../../MDBox";
import MDTypography from "../../MDTypography";
import MDButton from "../../MDButton";
import MDAvatar from "../../MDAvatar";

type ActionType = {
  type: "internal" | "external";
  route: string;
  label: string;
  color:
    | "primary"
    | "secondary"
    | "info"
    | "success"
    | "warning"
    | "error"
    | "light"
    | "dark"
    | "white";
};

type Author = {
  image: string;
  name: string;
};

type DefaultProjectCardProps = {
  image?: string;
  label?: string;
  title: string;
  description?: string;
  action?: ActionType;
  authors?: Author[];
};

const DefaultProjectCard: React.FC<DefaultProjectCardProps> = ({
  image = "",
  label = "",
  title,
  description = "",
  action,
  authors = [],
}) => {
  const renderAuthors = authors.map(({ image: avatar, name }) => (
    <Tooltip key={name} title={name} placement="bottom">
      <MDAvatar
        src={avatar}
        alt={name}
        size="xs"
        sx={({ borders: { borderWidth }, palette: { white } }) => ({
          border: `${borderWidth[2]} solid ${white.main}`,
          cursor: "pointer",
          position: "relative",
          ml: -1.25,
          "&:hover, &:focus": {
            zIndex: 10,
          },
        })}
      />
    </Tooltip>
  ));

  return (
    <Card
      sx={{
        display: "flex",
        flexDirection: "column",
        backgroundColor: "transparent",
        boxShadow: "none",
        overflow: "visible",
      }}
    >
      {image && (
        <MDBox position="relative" width="100.25%" shadow="xl" borderRadius="xl">
          <CardMedia
            component="img"
            image={image}
            alt={title}
            sx={{
              maxWidth: "100%",
              boxShadow: ({ boxShadows: { md } }) => md,
              objectFit: "cover",
              objectPosition: "center",
              borderRadius: "1rem",
            }}
          />
        </MDBox>
      )}

      <MDBox mt={1} mx={0.5}>
        {label && (
          <MDTypography variant="button" fontWeight="regular" color="text" textTransform="capitalize">
            {label}
          </MDTypography>
        )}

        <MDBox mb={1}>
          {action?.type === "internal" ? (
            <MDTypography
              component={Link}
              to={action.route}
              variant="h5"
              textTransform="capitalize"
            >
              {title}
            </MDTypography>
          ) : action?.type === "external" ? (
            <MDTypography
              component="a"
              href={action.route}
              target="_blank"
              rel="noreferrer"
              variant="h5"
              textTransform="capitalize"
            >
              {title}
            </MDTypography>
          ) : (
            <MDTypography variant="h5">{title}</MDTypography>
          )}
        </MDBox>

        <MDBox mb={3}>
          <MDTypography variant="button" fontWeight="light" color="text">
            {description}
          </MDTypography>
        </MDBox>

        {action && (
          <MDBox display="flex" justifyContent="space-between" alignItems="center">
            {action.type === "internal" ? (
              <MDButton component={Link} to={action.route} variant="outlined" size="small" color={action.color}>
                {action.label}
              </MDButton>
            ) : (
              <MDButton component="a" href={action.route} target="_blank" rel="noreferrer" variant="outlined" size="small" color={action.color}>
                {action.label}
              </MDButton>
            )}
            <MDBox display="flex">{renderAuthors}</MDBox>
          </MDBox>
        )}
      </MDBox>
    </Card>
  );
};

export default DefaultProjectCard;
