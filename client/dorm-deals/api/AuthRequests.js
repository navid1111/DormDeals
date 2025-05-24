import axios from 'axios'


const API = axios.create({ baseURL: "http://localhost:5000" }); // Change to https if needed

export const logIn = async (formData) => {
  try {
    const response = await axios.post("http://localhost:5000/auth/login", formData);
    console.log("API Response:", response.data); // Debug
    return response;
  } catch (error) {
    console.error("API Error:", error.response?.data || error.message); // Debug
    throw error;
  }
};

export const signUp = (formData) => API.post('http://localhost:5000/auth/register', formData);
