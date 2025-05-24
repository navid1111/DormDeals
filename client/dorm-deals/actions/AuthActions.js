import * as AuthApi from "../api/AuthRequests";

export const logIn = (formData, navigate) => async (dispatch) => {
  console.log("logIn action started with formData:", formData); // Debug
  dispatch({ type: "AUTH_START" });
  try {
    const { data } = await AuthApi.logIn(formData);
    console.log("logIn successful, received data:", data); // Debug
    dispatch({ type: "AUTH_SUCCESS", data: data });
    navigate("../home", { replace: true });
  } catch (error) {
    console.error("logIn failed with error:", error); // Debug
    dispatch({ type: "AUTH_FAIL" });
  }
};

export const signUp = (formData, navigate) => async (dispatch) => {
  console.log("signUp action started with formData:", formData); // Debug: Log input data
  dispatch({ type: "AUTH_START" });
  try {
    const { data } = await AuthApi.signUp(formData);
    console.log("signUp successful, received data:", data); // Debug: Log API response
    dispatch({ type: "AUTH_SUCCESS", data: data });
    navigate("../home", { replace: true });
  } catch (error) {
    console.error("signUp failed with error:", error); // Debug: Log error
    dispatch({ type: "AUTH_FAIL" });
  }
};

export const logout = () => async (dispatch) => {
  console.log("logout action triggered"); // Debug: Log logout action
  dispatch({ type: "LOG_OUT" });
};