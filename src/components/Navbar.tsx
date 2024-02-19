import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import MenuIcon from "@mui/icons-material/Menu";
import Container from "@mui/material/Container";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import MenuItem from "@mui/material/MenuItem";
import AdbIcon from "@mui/icons-material/Adb";
import Link from "next/link";
import Image from "next/image";
import logo from "../../public/logo.webp";

const pages = [
  {
    name: "Home",
    link: "/",
  },
  {
    name: "Auth Mode",
    link: "/edit_groups",
  },
];

export default function Navbar() {
  const titleFontWeight = 600;
  const title = "Salt and Light";

  const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(
    null
  );

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  return (
    <AppBar
      position="static"
      sx={{
        backgroundColor: "#89CFF0",
        height: "10vh",
        justifyContent: "center",
      }}
    >
      <Container maxWidth="xl">
        {/* When window is big */}
        <div className="justify-between items-center w-xl hidden sm:flex">
          {/* <Typography
            variant="h6"
            noWrap
            component="a"
            href="/"
            sx={{
              mr: 2,
              display: { xs: "none", md: "flex" },
              flexGrow: 1,
              fontFamily: "monospace",
              fontWeight: titleFontWeight,
              color: "inherit",
              textDecoration: "none",
            }}
          >
            {title}
          </Typography> */}
          <div className="bg-white rounded-lg">
            <Image src={logo} alt="logo" className="h-[8vh] w-auto"></Image>
          </div>

          <Box className="space-x-6 flex">
            {pages.map((page) => (
              <Link key={page.name} href={page.link} className="my-2 block">
                {page.name}
              </Link>
            ))}
          </Box>
        </div>
        {/* When window is small */}
        <Box className="flex flex-row justify-between sm:hidden ">
          <Image src={logo} className="h-[8vh] w-auto" alt="logo"></Image>

          <IconButton
            size="large"
            aria-label="account of current user"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            onClick={handleOpenNavMenu}
            color="inherit"
          >
            <MenuIcon />
          </IconButton>
          <Menu
            id="menu-appbar"
            anchorEl={anchorElNav}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "left",
            }}
            keepMounted
            transformOrigin={{
              vertical: "top",
              horizontal: "left",
            }}
            open={Boolean(anchorElNav)}
            onClose={handleCloseNavMenu}
            sx={{
              display: { xs: "block", md: "none" },
            }}
          >
            {pages.map((page, idx) => (
              <Link key={idx} href={page.link}>
                <MenuItem key={page.name} onClick={handleCloseNavMenu}>
                  <Typography textAlign="center">{page.name}</Typography>
                </MenuItem>
              </Link>
            ))}
          </Menu>
        </Box>
      </Container>
    </AppBar>
  );
}
