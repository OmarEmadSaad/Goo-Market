import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  deleteUser,
  updateProfile,
} from "firebase/auth";
import { app } from "./config";

const auth = getAuth(app);

export const registerUser = (email, password) => {
  return createUserWithEmailAndPassword(auth, email, password);
};

export const loginUser = (email, password) => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const logoutUser = () => {
  return signOut(auth);
};

export const updateUserProfile = (user, data) => {
  return updateProfile(user, data);
};

export const deleteCurrentUser = () => {
  if (auth.currentUser) {
    return deleteUser(auth.currentUser);
  } else {
    return Promise.reject(new Error("No user is currently logged in"));
  }
};

export const onUserStateChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

export default auth;
