import Image from "next/image";
import { Inter } from "next/font/google";
import React from "react";
import { useState, useEffect, useRef, useContext } from "react";
import AppContext from "../../utils/AppContext";
import {
  addUser,
  deleteUser,
  getGroups,
  getNumGroups,
} from "../../utils/FirebaseFunctions";
import { toast } from "react-toastify";
import { Box, FormControl, InputLabel, Select, MenuItem } from "@mui/material";

const inter = Inter({ subsets: ["latin"] });

interface User {
  id: string;
  name: string;
}

interface Group {
  id: string;
  groupNumber: number;
  leader: string;
  users: User[];
}

interface ContextVars {
  authUser: boolean;
  setAuthUser: (auth: boolean) => void;
  numberGroups: string;
  setNumberGroups: (num: string) => void;
}

export default function Home() {
  const context: ContextVars = useContext(AppContext);
  const [groups, setGroups] = useState<Group[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const [submitting, setSubmitting] = useState(false);
  const [myName, setMyName] = useState("");
  const [seeGroupNum, setSeeGroupNum] = useState("");
  const [bibleVerse, setBibleVerse] = useState({
    bookname: "John",
    chapter: "3",
    verse: "16",
    text: "For God so loved the world, that he gave his only Son, that whoever believes in him should not perish but have eternal life",
  });

  async function handleSubmit(event: { preventDefault: () => void }) {
    event.preventDefault();
    const name = inputRef.current?.value || "";
    localStorage.setItem("myName", JSON.stringify(name));
    const res = await addUser(name);
    if (!res) {
      toast.error(
        "Error: Maybe you tried choosing the same name as someone else?"
      );
    } else {
      toast.success("Successfully added you! Look for the highlighted box :)");
    }
    inputRef.current!.value = "";
    setSubmitting(!submitting);
  }

  async function handleDelete(userId: string) {
    const res = await deleteUser(userId);
    if (!res) {
      toast.error("Error deleting user");
    } else {
      toast.success("Successfully deleted user");
    }
    setSubmitting(!submitting);
  }

  useEffect(() => {
    async function fetchData() {
      const fetchedGroups = await getGroups();
      setGroups(fetchedGroups);

      const numGroups = await getNumGroups();
      context.setNumberGroups(numGroups || "5");

      const myNameLS = localStorage.getItem("myName");
      if (myNameLS === undefined) {
        localStorage.setItem("myName", JSON.stringify(""));
      }
      if (myNameLS !== undefined && myNameLS !== null) {
        setMyName(JSON.parse(myNameLS));
      }
    }
    fetchData();
  }, [submitting]);

  useEffect(() => {
    async function getAndSetBibleVerse() {
      const response = await fetch(
        "https://labs.bible.org/api/?passage=votd&type=json"
      );
      const verse = await response.json();
      setBibleVerse(verse[0]);
    }
    getAndSetBibleVerse();
  }, []);

  // Find user's group
  const userGroup = groups.find((group) =>
    group.users.some((user) => user.name === myName)
  );

  return (
    <div className="mb-20">
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          flexDirection: "column",
          overflow: "auto",
        }}
      >
        {context.authUser && (
          <div className="flex flex-col items-center mx-6">
            <div className="font-semibold text-lg pt-5">
              Select the group you want to see (0 to see all groups)
            </div>
            <Box className="mt-5" sx={{ minWidth: 150 }}>
              <FormControl fullWidth>
                <InputLabel>Group</InputLabel>
                <Select
                  value={seeGroupNum}
                  label="Group"
                  onChange={(e) => setSeeGroupNum(e.target.value)}
                >
                  <MenuItem value="0">All Groups</MenuItem>
                  {groups.map((group) => (
                    <MenuItem
                      key={group.groupNumber}
                      value={group.groupNumber.toString()}
                    >
                      {group.groupNumber}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </div>
        )}

        <div className="my-5 text-center mx-7">
          <div className="text-2xl">Verse of the day 😎</div>
          <div className="text-lg">"{bibleVerse.text}"</div>
          <div className="text-lg">
            {bibleVerse.bookname} {bibleVerse.chapter}:{bibleVerse.verse}
          </div>
        </div>

        {context.authUser && <div className="text-red-500">auth mode</div>}

        <div className="text-2xl mb-8 mx-7 text-center">
          Enter your FIRST AND LAST name to be assigned to a group!
        </div>

        <form onSubmit={handleSubmit} className="mb-10">
          <div className="flex flex-col items-center">
            <input ref={inputRef} className="border rounded px-2 py-1" />
            <button className="mt-4 text-md rounded-full border-2 border-[#89CFF0] bg-[#89CFF0] px-4 py-1 text-white hover:border-transparent duration-300">
              Submit
            </button>
          </div>
        </form>

        <div className="mt-10 w-full max-w-4xl px-4">
          {context.authUser ? (
            // Admin view - show all groups or filtered group
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {groups
                .filter(
                  (group) =>
                    seeGroupNum === "0" ||
                    group.groupNumber.toString() === seeGroupNum
                )
                .map((group) => (
                  <div key={group.id} className="border rounded-lg p-4">
                    <div className="text-xl font-bold mb-2">
                      Group {group.groupNumber}
                    </div>
                    <div className="text-lg mb-4">
                      Leader: {group.leader || "No leader assigned"}
                    </div>
                    <div className="space-y-2">
                      {group.users.map((user) => (
                        <div
                          key={user.id}
                          className={`p-2 rounded ${
                            user.name === myName
                              ? "bg-[#89CFF0] text-white"
                              : "bg-gray-100"
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <span>{user.name}</span>
                            <button
                              className="text-red-500 hover:text-red-700"
                              onClick={() => handleDelete(user.id)}
                            >
                              delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            // User view - show only their group
            userGroup && (
              <div className="flex flex-col items-center space-y-6">
                <div className="text-xl font-bold">Your Group Information</div>
                <div className="text-lg">
                  Group Leader:{" "}
                  <span className="text-red-500">
                    {userGroup.leader || "No leader assigned"}
                  </span>
                </div>
                <div className="text-lg">
                  Group Number:{" "}
                  <span className="text-red-500">{userGroup.groupNumber}</span>
                </div>
                <div className="w-full max-w-md">
                  <div className="border rounded-lg p-4 bg-[#89CFF0] text-white">
                    <div className="text-center">
                      <div className="font-bold mb-2">Your name:</div>
                      <div className="text-lg mb-4">{myName}</div>
                      <button
                        className="text-red-200 hover:text-red-100"
                        onClick={() => {
                          const user = userGroup.users.find(
                            (u) => u.name === myName
                          );
                          if (user) {
                            handleDelete(user.id);
                          }
                        }}
                      >
                        delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
