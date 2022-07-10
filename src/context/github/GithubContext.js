import { createContext, useReducer } from "react";
import GithubReducer from "./GithubReducer";

const GithubContext = createContext();

const GITHUB_URL = process.env.REACT_APP_GITHUB_API_URL;
const GITHUB_TOKEN = process.env.REACT_APP_GITHUB_API_TOKEN;

export const GithubProvider = ({ children }) => {
  const initialState = {
    users: [],
    repos: [],
    user: {},
    loading: false,
  };
  const [state, dispatch] = useReducer(GithubReducer, initialState);
  const setLoading = () => {
    dispatch({ type: "SET_LOADING" });
  };

  const searchUsers = async (text) => {
    setLoading();
    const params = new URLSearchParams({
      q: text,
    });
    const response = await fetch(`${GITHUB_URL}/search/users?${params}`, {
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
      },
    });
    const { items } = await response.json();
    dispatch({
      type: "SEARCH_USERS",
      payload: items,
    });
  };

  const getUser = async (login) => {
    setLoading();
    const response = await fetch(`${GITHUB_URL}/users/${login}`, {
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
      },
    });
    if (response.status === 404) {
      window.location = "/not-found";
    } else {
      const data = await response.json();
      dispatch({
        type: "GET_USER",
        payload: data,
      });
    }
  };

  const clearUsers = () => {
    dispatch({ type: "CLEAR_USERS" });
  };

  const getUserRepos = async (login) => {
    setLoading();
    const params = new URLSearchParams({
      sort: "created",
      per_page: 5,
    });
    const response = await fetch(
      `${GITHUB_URL}/users/${login}/repos?${params}`,
      {
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
        },
      }
    );
    const data = await response.json();
    dispatch({
      type: "GET_USER_REPOS",
      payload: data,
    });
  };

  return (
    <GithubContext.Provider
      value={{
        users: state.users,
        loading: state.loading,
        user: state.user,
        repos: state.repos,
        searchUsers,
        clearUsers,
        getUser,
        getUserRepos,
      }}
    >
      {children}
    </GithubContext.Provider>
  );
};

export default GithubContext;
