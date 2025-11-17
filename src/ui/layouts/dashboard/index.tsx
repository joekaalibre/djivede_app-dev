import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import {
  Box,
  CssBaseline,
  useMediaQuery,
  Toolbar,
  ClickAwayListener,
} from "@mui/material";
import Topbar from "../../components/Topbar";
import Sidebar from "../../components/Sidebar";
import Footer from "../../components/Footer";
import Breadcrumbs from "../../components/Breadcrumbs";
import ThemeWrapper from "./ThemeWrapper"; // ✅ Ajouté

const SIDEBAR_WIDTH = 240;

const DashboardLayout = () => {
  const isMobile = useMediaQuery("(max-width:768px)");
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => setMobileOpen((prev) => !prev);

  const handleClickAway = () => {
    if (mobileOpen && isMobile) {
      setMobileOpen(false);
    }
  };

  return (
    <ThemeWrapper> {/* ✅ Fournit le thème uniquement dans le dashboard */}
      <ClickAwayListener onClickAway={handleClickAway}>
        <Box
          sx={{
            display: "flex",
            minHeight: "100vh",
            bgcolor: "#f5f6fa",
            fontFamily: "'Poppins', sans-serif",
          }}
        >
          <CssBaseline />

          {/* === SIDEBAR === */}
          <Sidebar
            mobileOpen={mobileOpen}
            onDrawerToggle={handleDrawerToggle}
            isMobile={isMobile}
          />

          {/* === MAIN AREA === */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              flexGrow: 1,
              ml: { xs: 0, md: `${SIDEBAR_WIDTH}px` },
              transition: "margin 0.3s ease-in-out",
            }}
          >
            <Topbar onMenuClick={handleDrawerToggle} />

            <Box
              component="main"
              sx={{
                flexGrow: 1,
                px: { xs: 2, md: 3 },
                py: { xs: 2, md: 4 },
                display: "flex",
                flexDirection: "column",
                minHeight: "calc(100vh - 64px)", // prend en compte la Topbar
              }}
            >
              <Toolbar />
              <Breadcrumbs />
              <Box sx={{ flexGrow: 1 }}>
                <Outlet />
              </Box>
              <Footer />
            </Box>
          </Box>
        </Box>
      </ClickAwayListener>
    </ThemeWrapper>
  );
};

export default DashboardLayout;
