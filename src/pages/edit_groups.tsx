import React, { useEffect, useRef, useState } from "react";
import AppContext from "../../utils/AppContext";
import { useContext } from "react";
import {
  clearAllUsers,
  getNumGroups,
  setNumGroups,
  verifyPassword,
} from "../../utils/FirebaseFunctions";
import { useRouter } from "next/router";

import Box from "@mui/material/Box";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import { toast } from "react-toastify";
import { Button, Dialog, DialogActions, DialogTitle } from "@mui/material";

interface ContextVars {
  authUser: any;
  setAuthUser: any;
  numberGroups: any;
  setNumberGroups: any;
}

export default function Edit_Groups() {
  const groupValues = [2, 3, 4, 5, 6, 7, 8, 9, 10];

  const router = useRouter();
  const context: ContextVars = useContext(AppContext);

  const passwordRef = useRef<HTMLInputElement>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  const bigFunny = [
    "Hmmm... Remember, Jesus is always watching... ",
    "Nice try bud, better luck next time",
    "Trying to access something you're not supposed to? 🤨",
    "The password is: YeahThatsNotHappening123 :)",
    "You have a better chance of finding a signficant other than guessing this password. Oh wait, both are ~zero probability",
  ];

  async function handleAuthAttempt(event: { preventDefault: () => void }) {
    event.preventDefault();
    const correctPassword = await verifyPassword(passwordRef.current!.value);
    if (correctPassword) {
      context.setAuthUser(true);
      toast.success("Successfully authenticated!");
    } else {
      const randNumber = Math.floor(Math.random() * bigFunny.length);
      toast.error(bigFunny[randNumber]);
    }
    passwordRef.current!.value = "";
  }

  async function handleDeleteAll() {
    const res = await clearAllUsers();
    if (!res) {
      toast.error("Error delelting all users");
    } else {
      toast.success("Successfully cleared all users");
    }
    setShowDeleteConfirmation(false);
    setSubmitting(!submitting);
  }

  const handleChange = async (event: SelectChangeEvent) => {
    context.setNumberGroups(event.target.value as string);
    // This is for the database
    const res = await setNumGroups(event.target.value);
    if (!res) {
      toast.error("Error setting number of groups");
    } else {
      toast.success("Successfully changed number of groups!");
    }
  };

  if (context.authUser) {
    return (
      <div className="flex justify-center items-center h-[100vh] flex-col">
        <div style={{ fontSize: "150%", paddingBottom: "3vh" }}>
          You are in auth mode
        </div>
        <button
          className="text-md flex rounded-full border-2 border-[#89CFF0] bg-[#89CFF0] px-4 py-[3px] text-white items-center font-light hover:border-transparent duration-300 hover:bg-[#89CFF0]"
          onClick={() => context.setAuthUser(false)}
        >
          click to exit auth mode
        </button>
        <div className="my-10 flex flex-col items-center">
          <div className="my-5 font-semibold text-lg">auth mode features</div>
          <button
            className="text-md flex rounded-full border-2 border-red-500 bg-red-500 px-4 py-[3px] text-white items-center font-light hover:border-transparent duration-300 hover:red-500"
            onClick={() => setShowDeleteConfirmation(true)}
          >
            delete all names
          </button>
          <Box className="mt-5" sx={{ minWidth: 150 }}>
            <FormControl fullWidth>
              <InputLabel>Groups</InputLabel>
              <Select
                value={context.numberGroups}
                label="Groups"
                onChange={handleChange}
              >
                {groupValues.map((value, idx) => {
                  return (
                    <MenuItem key={idx} value={value}>
                      {value}
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
          </Box>
        </div>
        {/* Delete Confirmation Dialog */}
        <Dialog
          open={showDeleteConfirmation}
          onClose={() => setShowDeleteConfirmation(false)}
        >
          <DialogTitle>Are you sure you want to clear all names?</DialogTitle>
          <DialogActions style={{ display: "flex", justifyContent: "center" }}>
            <Button
              variant="outlined"
              onClick={() => setShowDeleteConfirmation(false)}
            >
              Cancel
            </Button>
            <Button variant="outlined" onClick={handleDeleteAll} color="error">
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
  return (
    <div className="flex justify-center items-center h-[100vh] flex-col">
      <div
        style={{ fontSize: "150%", paddingBottom: "3vh" }}
        className="mx-7 text-center"
      >
        Input password to gain superpowers 👀
      </div>
      <form onSubmit={handleAuthAttempt}>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <input ref={passwordRef} />
          <div style={{ padding: "1vh" }}></div>
          <button className="text-md flex rounded-full border-2 border-[#89CFF0] bg-[#89CFF0] px-4 py-[3px] text-white items-center font-light hover:border-transparent duration-300 hover:bg-[#89CFF0]">
            Submit
          </button>
        </div>
      </form>
    </div>
  );
}
