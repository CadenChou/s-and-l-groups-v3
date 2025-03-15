import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  addDoc,
  query,
  where,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore/lite";
import { app } from "./FirebaseConfig";

const firestore = getFirestore(app);

// Function to get all groups
export async function getGroups() {
  try {
    const groupsCol = collection(firestore, "groups");
    const groupsSnapshot = await getDocs(groupsCol);
    const groups = groupsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return groups.sort((a, b) => a.groupNumber - b.groupNumber);
  } catch (e) {
    console.log("Error getting groups:", e);
    return [];
  }
}

// Function to initialize or update groups based on number of groups
export async function initializeGroups(
  numGroups: number,
  leaders: { [key: string]: string }
) {
  try {
    const groupsCol = collection(firestore, "groups");

    // First, get existing groups to preserve user lists where possible
    const existingGroups = await getGroups();
    const existingUsers = new Map();

    // Collect all existing users
    existingGroups.forEach((group) => {
      if (group.users) {
        group.users.forEach((user: any) => {
          existingUsers.set(user.id, user);
        });
      }
    });

    // Delete all existing groups
    for (const group of existingGroups) {
      await deleteDoc(doc(groupsCol, group.id));
    }

    // Create new groups
    const usersArray = Array.from(existingUsers.values());
    const usersPerGroup = Math.ceil(usersArray.length / numGroups);

    for (let i = 1; i <= numGroups; i++) {
      const startIdx = (i - 1) * usersPerGroup;
      const endIdx = Math.min(startIdx + usersPerGroup, usersArray.length);
      const groupUsers = usersArray.slice(startIdx, endIdx);

      await addDoc(groupsCol, {
        groupNumber: i,
        leader: leaders[i] || "",
        users: groupUsers,
      });
    }

    return true;
  } catch (e) {
    console.log("Error initializing groups:", e);
    return false;
  }
}

// Function to add a user to a group
export async function addUser(userToAdd: string) {
  try {
    // Get all groups
    const groups = await getGroups();
    if (groups.length === 0) {
      console.log("No groups initialized");
      return false;
    }

    // Check if user already exists in any group
    for (const group of groups) {
      if (
        group.users &&
        group.users.some((user: any) => user.name === userToAdd)
      ) {
        console.log("User already exists");
        return false;
      }
    }

    // Find group with fewest members
    const groupWithFewestMembers = groups.reduce((min, group) => {
      const userCount = group.users ? group.users.length : 0;
      return userCount < (min.users ? min.users.length : Infinity)
        ? group
        : min;
    }, groups[0]);

    // Add user to group
    const groupRef = doc(firestore, "groups", groupWithFewestMembers.id);
    await updateDoc(groupRef, {
      users: arrayUnion({ id: Date.now().toString(), name: userToAdd }),
    });

    return true;
  } catch (e) {
    console.log("Error adding user:", e);
    return false;
  }
}

// Function to delete a user
export async function deleteUser(userId: string) {
  try {
    const groups = await getGroups();

    for (const group of groups) {
      const userToDelete = group.users?.find((user: any) => user.id === userId);
      if (userToDelete) {
        const groupRef = doc(firestore, "groups", group.id);
        await updateDoc(groupRef, {
          users: arrayRemove(userToDelete),
        });
        return true;
      }
    }
    return false;
  } catch (e) {
    console.log("Error deleting user:", e);
    return false;
  }
}

// Function to clear all users from all groups
export async function clearAllUsers() {
  try {
    const groups = await getGroups();

    for (const group of groups) {
      const groupRef = doc(firestore, "groups", group.id);
      await updateDoc(groupRef, {
        users: [],
      });
    }
    return true;
  } catch (e) {
    console.log("Error clearing all users:", e);
    return false;
  }
}

// Function to set number of groups
export async function setNumGroups(numGroupsString: string) {
  try {
    const numGroupsDoc = doc(firestore, "misc", "numGroupsDoc");
    await setDoc(numGroupsDoc, { numGroups: numGroupsString });

    // Reinitialize groups with the new number
    const leaders = await getLeaders();
    await initializeGroups(parseInt(numGroupsString), leaders || {});

    return true;
  } catch (e) {
    console.log("Error setting number of groups:", e);
    return false;
  }
}

export async function getNumGroups() {
  try {
    const numGroupsDoc = doc(firestore, "misc", "numGroupsDoc");
    const numGroupsSnapshot = await getDoc(numGroupsDoc);
    return numGroupsSnapshot.data()?.numGroups;
  } catch (e) {
    console.log("Error fetching number of groups");
    return "5"; // Default value
  }
}

// Function to add/update group leaders
export async function addLeaders(groupToLeader: { [key: string]: string }) {
  try {
    const groups = await getGroups();

    for (const group of groups) {
      const leaderName = groupToLeader[group.groupNumber];
      if (leaderName !== undefined) {
        const groupRef = doc(firestore, "groups", group.id);
        await updateDoc(groupRef, {
          leader: leaderName,
        });
      }
    }
    return true;
  } catch (e) {
    console.log("Error adding group leaders:", e);
    return false;
  }
}

// Function to clear all leaders
export async function clearAllLeaders() {
  try {
    const groups = await getGroups();

    for (const group of groups) {
      const groupRef = doc(firestore, "groups", group.id);
      await updateDoc(groupRef, {
        leader: "",
      });
    }
    return true;
  } catch (e) {
    console.log("Error clearing leaders:", e);
    return false;
  }
}

// Function to get all leaders
export async function getLeaders() {
  try {
    const groups = await getGroups();
    const leaders: { [key: string]: string } = {};

    groups.forEach((group) => {
      leaders[group.groupNumber] = group.leader || "";
    });

    return leaders;
  } catch (e) {
    console.log("Error getting leaders:", e);
    return {};
  }
}

export async function verifyPassword(password: string) {
  try {
    const passwordDoc = doc(firestore, "misc", "passwordDoc");
    const passwordSnapshot = await getDoc(passwordDoc);
    return passwordSnapshot.data()?.password === password;
  } catch (e) {
    console.log("Error verifying password:", e);
    return false;
  }
}
