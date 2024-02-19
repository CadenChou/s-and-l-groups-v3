import Image from "next/image";
import { Inter } from "next/font/google";
import React from "react";
import { useState, useEffect, useRef, useContext } from "react";
import AppContext from "../../utils/AppContext";
import {
  addUser,
  clearAllUsers,
  deleteUser,
  getNumGroups,
  getUsers,
  setNumGroups,
} from "../../utils/FirebaseFunctions";
import { toast } from "react-toastify";

const inter = Inter({ subsets: ["latin"] });

interface Item {
  id: string;
  name: string;
}

interface ContextVars {
  authUser: any;
  setAuthUser: any;
  numberGroups: any;
  setNumberGroups: any;
}

export default function Home() {
  const context: ContextVars = useContext(AppContext);

  const [dbItems, setDbItems] = useState<Item[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);

  const [submitting, setSubmitting] = useState(false);

  const [myName, setMyName] = useState("");

  const [bibleVerse, setBibleVerse] = useState({
    bookname: "John",
    chapter: "3",
    verse: "16",
    text: "For God so loved the world, that he gave his only Son, that whoever believes in him should not perish but have eternal life",
  });

  async function handleSubmit(event: { preventDefault: () => void }) {
    event.preventDefault();
    localStorage.setItem("myName", JSON.stringify(inputRef.current?.value));
    const res = await addUser(inputRef.current?.value);
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

  async function handleDelete(removeUserID: string) {
    const res = await deleteUser(removeUserID);
    if (!res) {
      toast.error("Error deleting user");
    } else {
      toast.success("Successfully deleted user");
    }
    setSubmitting(!submitting);
  }

  useEffect(() => {
    async function getAndSetItems() {
      const tempItems: Item[] | boolean = await getUsers();
      if (Array.isArray(tempItems)) {
        setDbItems(tempItems);
        console.log(dbItems);
      }
    }
    async function getAndSetNumGroups() {
      const numGroupsItem = await getNumGroups();
      context.setNumberGroups(numGroupsItem);
    }
    getAndSetItems();
    getAndSetNumGroups();

    const myNameLS = localStorage.getItem("myName");
    if (myNameLS === undefined) {
      localStorage.setItem("myName", JSON.stringify(""));
    }
    if (myNameLS !== undefined && myNameLS !== null) {
      setMyName(JSON.parse(myNameLS));
    }
  }, [submitting]);

  useEffect(() => {
    async function getAndSetBibleVerse() {
      const response = await fetch(
        "https://labs.bible.org/api/?passage=votd&type=json"
      );
      const verse = await response.json();
      console.log(verse[0]);
      setBibleVerse(verse[0]);
    }
    getAndSetBibleVerse();
  }, []);

  return (
    <div>
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
        <div className="my-5 text-center mx-7">
          <div className=" text-2xl">Verse of the day 😎</div>
          {/* eslint-disable-next-line */}
          <div className="text-lg">"{bibleVerse.text}"</div>
          <div className="text-lg">
            {bibleVerse.bookname} {bibleVerse.chapter}:{bibleVerse.verse}
          </div>
        </div>
        {context.authUser && <div className="text-red-500">auth mode</div>}
        <div
          style={{ fontSize: "150%", paddingBottom: "3vh" }}
          className="mx-7 text-center"
        >
          Enter your FIRST AND LAST name to be assigned to a group!
        </div>
        <form onSubmit={handleSubmit}>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <input ref={inputRef} />
            <div style={{ padding: "1vh" }}></div>
            <button className="text-md flex rounded-full border-2 border-[#89CFF0] bg-[#89CFF0] px-4 py-[3px] text-white items-center font-light hover:border-transparent duration-300 hover:bg-[#89CFF0]">
              Submit
            </button>
          </div>
        </form>
        <div className="mt-10 space-y-2">
          <div className="grid grid-cols-2 gap-3">
            {dbItems.length > 0 &&
              dbItems.map((itemData, idx) => (
                <div
                  key={itemData.id}
                  className={`flex flex-col border border-black p-2 rounded-md ${
                    myName === itemData.name && "bg-[#89CFF0]"
                  }`}
                >
                  <div className="flex flex-col">
                    <div>
                      <span className="font-bold mb-2">
                        {(idx % Number(context.numberGroups)) + 1}
                      </span>{" "}
                      <span>{itemData.name}</span>
                    </div>
                    {(context.authUser || myName === itemData.name) && (
                      <button
                        className=" text-red-500 ml-3"
                        onClick={() => handleDelete(itemData.id)}
                      >
                        delete
                      </button>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
