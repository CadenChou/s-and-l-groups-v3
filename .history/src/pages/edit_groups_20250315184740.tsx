import React, { useEffect, useRef, useState } from "react";
import AppContext from "../../utils/AppContext";
import { useContext } from "react";
import {
  clearAllUsers,
  getGroups,
  getNumGroups,
  setNumGroups,
  verifyPassword,
  addLeaders,
  clearAllLeaders,
  initializeGroups,
} from "../../utils/FirebaseFunctions";
import { useRouter } from "next/router";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";
import { SelectChangeEvent } from "@mui/material/Select";
import { toast } from "react-toastify";

interface Group {
  id: string;
  groupNumber: number;
  leader: string;
  users: Array<{ id: string; name: string }>;
}

interface ContextVars {
  authUser: boolean;
  setAuthUser: (auth: boolean) => void;
  numberGroups: string;
  setNumberGroups: (num: string) => void;
}

export default function Edit_Groups() {
  const groupValues = [2, 3, 4, 5, 6, 7, 8, 9, 10];
  const router = useRouter();
  const context: ContextVars = useContext(AppContext);
  const [groups, setGroups] = useState<Group[]>([]);
  const [groupLeaders, setGroupLeaders] = useState<{ [key: string]: string }>(
    {}
  );

  const passwordRef = useRef<HTMLInputElement>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  const bigFunny = [
    "Hmmm... Remember, Jesus is always watching... ",
    "Nice try bud, better luck next time",
    "Trying to access something you're not supposed to? 🤨",
    "The password is: YeahThatsNotHappening123 :)",
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
      toast.error("Error deleting all users");
    } else {
      toast.success("Successfully cleared all users");
    }
    setShowDeleteConfirmation(false);
    setSubmitting(!submitting);
  }

  const handleChange = async (event: SelectChangeEvent) => {
    const newNumGroups = event.target.value;
    context.setNumberGroups(newNumGroups);
    const res = await setNumGroups(newNumGroups);
    if (!res) {
      toast.error("Error setting number of groups");
    }
    setSubmitting(!submitting);
  };

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      await addLeaders(groupLeaders);
      toast.success("Group leaders updated successfully!");
      setSubmitting(!submitting);
    } catch (error) {
      console.log("Error updating group leaders:", error);
      toast.error("Failed to update group leaders");
    }
  }

  async function handleClearLeaders() {
    const res = await clearAllLeaders();
    if (res) {
      setGroupLeaders({});
      setSubmitting(!submitting);
      toast.success("Successfully cleared all leaders");
    } else {
      toast.error("Error clearing leaders");
    }
  }

  useEffect(() => {
    async function fetchData() {
      const fetchedGroups = await getGroups();
      setGroups(fetchedGroups);

      // Initialize groupLeaders state from fetched groups
      const leaders: { [key: string]: string } = {};
      fetchedGroups.forEach((group) => {
        leaders[group.groupNumber] = group.leader || "";
      });
      setGroupLeaders(leaders);

      const numGroups = await getNumGroups();
      context.setNumberGroups(numGroups || "5");
    }
    fetchData();
  }, [submitting]);

  if (context.authUser) {
    return (
      <div className="flex justify-center items-center h-full flex-col mb-20">
        <div className="text-2xl pt-5 pb-8">You are in auth mode</div>
        <button
          className="text-md rounded-full border-2 border-[#89CFF0] bg-[#89CFF0] px-4 py-1 text-white hover:border-transparent duration-300"
          onClick={() => context.setAuthUser(false)}
        >
          click to exit auth mode
        </button>

        <div className="my-8 flex flex-col items-center">
          <div className="my-5 font-semibold text-xl">auth mode features</div>

          <button
            className="text-md rounded-full border-2 border-red-500 bg-red-500 px-4 py-1 text-white hover:border-transparent duration-300"
            onClick={() => setShowDeleteConfirmation(true)}
          >
            delete all names
          </button>

          <div className="font-semibold text-lg pt-8 pb-4">
            Select number of groups
          </div>
          <Box sx={{ minWidth: 150 }}>
            <FormControl fullWidth>
              <InputLabel>Groups</InputLabel>
              <Select
                value={context.numberGroups}
                label="Groups"
                onChange={handleChange}
              >
                {groupValues.map((value) => (
                  <MenuItem key={value} value={value.toString()}>
                    {value}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </div>

        <div className="text-lg font-semibold pb-5">
          Leaders, please input your names
        </div>
        <form
          className="flex flex-col items-center space-y-5 mb-7"
          onSubmit={handleSubmit}
        >
          {Array.from(
            { length: parseInt(context.numberGroups, 10) },
            (_, idx) => idx + 1
          ).map((groupNum) => (
            <div key={groupNum} className="flex items-center space-x-2">
              <label>{`Group ${groupNum} Leader:`}</label>
              <input
                type="text"
                className="border rounded px-2 py-1"
                value={groupLeaders[groupNum] || ""}
                onChange={(e) => {
                  setGroupLeaders((prev) => ({
                    ...prev,
                    [groupNum]: e.target.value,
                  }));
                }}
              />
            </div>
          ))}
          <button
            type="submit"
            className="text-md rounded-full border-2 border-[#89CFF0] bg-[#89CFF0] px-4 py-1 text-white hover:border-transparent duration-300"
          >
            Submit
          </button>
        </form>

        <button
          className="text-md rounded-full border-2 border-red-500 bg-red-500 px-4 py-1 text-white hover:border-transparent duration-300"
          onClick={handleClearLeaders}
        >
          clear all leaders
        </button>

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
      <div className="text-2xl pb-8 mx-7 text-center">
        Input password to gain superpowers 👀
      </div>
      <form onSubmit={handleAuthAttempt}>
        <div className="flex flex-col items-center">
          <input
            ref={passwordRef}
            type="password"
            className="border rounded px-2 py-1"
          />
          <button
            type="submit"
            className="mt-4 text-md rounded-full border-2 border-[#89CFF0] bg-[#89CFF0] px-4 py-1 text-white hover:border-transparent duration-300"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
}
