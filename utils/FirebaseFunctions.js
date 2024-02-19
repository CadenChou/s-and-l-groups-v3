import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  getDoc,
  setDoc,
  doc,
} from "firebase/firestore/lite";
import { app, firestore } from "./FirebaseConfig";

export async function verifyPassword(passwordAttempt) {
  const passwordDoc = doc(firestore, "misc", "passwordDoc");
  const passwordSnapshot = await getDoc(passwordDoc);
  const truePassword = passwordSnapshot.data().password;
  return passwordAttempt === truePassword;
}

export async function setNumGroups(numGroupsString) {
  try {
    const numGroupsDoc = doc(firestore, "misc", "numGroupsDoc");
    await setDoc(numGroupsDoc, { numGroups: numGroupsString });
    console.log("successfully set num groups");
    return true;
  } catch (e) {
    console.log("Error setting number of groups: " + e);
    return false;
  }
}

export async function getNumGroups() {
  try {
    const numGroupsDoc = doc(firestore, "misc", "numGroupsDoc");
    const numGroupsSnapshot = await getDoc(numGroupsDoc);
    console.log(
      "successfully got num groups: " + numGroupsSnapshot.data().numGroups
    );
    return numGroupsSnapshot.data().numGroups;
  } catch (e) {
    console.log("Error fetching number of groups");
    return false;
  }
}

export async function getUsers() {
  try {
    const usersCol = collection(firestore, "users");
    const usersSnapshot = await getDocs(usersCol);
    const usersList = usersSnapshot.docs.map((doc) => ({
      id: doc.id,
      name: doc.data().name,
    }));
    return usersList;
  } catch (e) {
    console.log("error getting users: " + e);
    return false;
  }
}

export async function addUser(userToAdd) {
  try {
    const usersCol = collection(firestore, "users");
    const querySnapshot = await getDocs(usersCol);
    const existingUser = querySnapshot.docs.find(
      (doc) => doc.data().name === userToAdd
    );

    if (existingUser) {
      console.log("User already exists");
      return false; // Exit function if user already exists
    }
    await addDoc(usersCol, { name: userToAdd });
    return true;
  } catch (e) {
    console.log("error adding user: " + e);
    return false;
  }
}

export async function deleteUser(removeUserID) {
  try {
    const removeUserDoc = doc(firestore, "users", removeUserID);
    await deleteDoc(removeUserDoc);
    return true;
  } catch (e) {
    console.log("error deleting user: " + e);
    return false;
  }
}

export async function clearAllUsers() {
  try {
    const usersCol = collection(firestore, "users");
    const usersSnapshot = await getDocs(usersCol);
    usersSnapshot.forEach(async (doc) => {
      await deleteUser(doc.id);
    });
    console.log("All users deleted successfully");
    return true;
  } catch (e) {
    console.log("error deleting all users: " + e);
    return false;
  }
}
