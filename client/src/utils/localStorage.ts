const LOGIN_STR = "rancici:loggedIn";

export const loggedIn = () => {
  window.localStorage.setItem(LOGIN_STR, "YES");
};

export const logOut = () => {
  window.localStorage.setItem(LOGIN_STR, "NO");
};

export const isLoggedIn = () => {
  const loginStatus = window.localStorage.getItem(LOGIN_STR);
  return !(loginStatus == null || loginStatus == "NO");
};
