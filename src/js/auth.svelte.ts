import { getLocalStorage, setLocalStorage } from "./utils.mts";

interface UserStore {
  isLoggedIn:boolean,
  user?:{
    name:string
    email:string
    _id:string
  } | Record<string, never>,
  token:string
}

const baseURL = import.meta.env.PUBLIC_SERVER_URL;
const AUTH_STORAGE_KEY = "so-user";

const emptyStore = {
  isLoggedIn: false,
  user: {},
  token: ""
};

export const userStore = $state(emptyStore) as UserStore;

export async function login(email: string, password: string): Promise<string | null> {
  try {
    const res = await fetch(`${baseURL}users/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (!res.ok) {
      return data.message || "Invalid email or password";
    }

    const token = data.token;
    const user = data.user;

    userStore.isLoggedIn = true;
    userStore.user = user;
    userStore.token = token;
    setLocalStorage(AUTH_STORAGE_KEY, {
      isLoggedIn: true,
      user,
      token
    });

    return null;
  } catch {
    return "Unable to login. Please try again.";
  }
}

export function logout() {
  setLocalStorage(AUTH_STORAGE_KEY, null);
  userStore.isLoggedIn = false;
  userStore.user = {};
  userStore.token = "";
}

export function checkAuth(): boolean {
  const savedAuth = getLocalStorage(AUTH_STORAGE_KEY) as UserStore | null;
  if (!savedAuth) {
    logout();
    return false;
  }

  try {
    if (!savedAuth?.token) {
      logout();
      return false;
    }

    userStore.isLoggedIn = true;
    userStore.user = savedAuth.user || {};
    userStore.token = savedAuth.token;
    return true;
  } catch {
    logout();
    return false;
  }
}