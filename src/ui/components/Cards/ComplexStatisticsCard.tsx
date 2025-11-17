import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

interface Props {
  color?: "primary" | "secondary" | "info" | "success" | "warning" | "error" | "dark";
  icon: string;
  title: string;
  count: string | number;
  percentage?: {
    color: "success" | "error" | "warning";
    amount: string;
    label: string;
  };
}

function ComplexStatisticsCard({ color = "info", title, count, percentage, icon }: Props) {
  return (
    <Card sx={{ p: 2 }}>
      <Box display="flex" alignItems="center">
        <Box
          sx={{
            width: 48,
            height: 48,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "md",
            bgcolor: `${color}.main`,
            color: "white",
            mr: 2,
          }}
        >
          <Icon>{icon}</Icon>
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary" fontWeight="bold">
            {title}
          </Typography>
          <Typography variant="h6">{count}</Typography>
        </Box>
      </Box>
      {percentage && (
        <Box mt={2}>
          <Typography variant="caption" color={percentage.color}>
            {percentage.amount}{" "}
            <Typography component="span" variant="caption" color="text.secondary">
              {percentage.label}
            </Typography>
          </Typography>
        </Box>
      )}
    </Card>
  );
}

export default ComplexStatisticsCard;
