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

export async function verifyPassword(passwordAttempt: string) {
  const passwordDoc = doc(firestore, "misc", "passwordDoc");
  const passwordSnapshot = await getDoc(passwordDoc);
  const truePassword = passwordSnapshot.data()?.password;
  return passwordAttempt === truePassword;
}

export async function setNumGroups(numGroupsString: string) {
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
      "successfully got num groups: " + numGroupsSnapshot.data()?.numGroups
    );
    return numGroupsSnapshot.data()?.numGroups;
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

export async function addUser(userToAdd: string) {
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

export async function deleteUser(removeUserID: string) {
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

export async function addLeaders(groupToLeader: { [key: string]: string }) {
  try {
    const leadersCol = collection(firestore, "leaders");
    const groups = Object.keys(groupToLeader);
    await Promise.all(
      groups.map(async (groupNum: string) => {
        const leaderDocRef = doc(leadersCol, groupNum);
        const leaderDocSnapshot = await getDoc(leaderDocRef);
        if (leaderDocSnapshot.exists()) {
          // If document already exists, update it
          await setDoc(leaderDocRef, {
            groupNum: groupNum,
            leader: groupToLeader[groupNum],
          });
        } else {
          // If document does not exist, add it
          await setDoc(leaderDocRef, {
            groupNum: groupNum,
            leader: groupToLeader[groupNum],
          });
        }
      })
    );
    return true;
  } catch (e) {
    console.log("error adding group leaders:", e);
    return false;
  }
}

export async function clearAllLeaders() {
  try {
    const leadersCol = collection(firestore, "leaders");
    const leadersSnapshot = await getDocs(leadersCol);

    // Delete each document in the collection
    await Promise.all(
      leadersSnapshot.docs.map(async (doc) => {
        await deleteDoc(doc.ref);
      })
    );

    console.log("Leaders collection deleted successfully");
    return true;
  } catch (e) {
    console.log("Error deleting leaders collection:", e);
    return false;
  }
}

export async function getLeaders() {
  try {
    const leadersCol = collection(firestore, "leaders");
    const leadersSnapshot = await getDocs(leadersCol);
    const leaders: { [key: string]: string } = {};

    leadersSnapshot.forEach((doc) => {
      const data = doc.data();
      leaders[data.groupNum] = data.leader;
    });

    return leaders;
  } catch (e) {
    console.log("error fetching group leaders");
  }
}
