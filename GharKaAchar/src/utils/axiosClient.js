import axios from "axios";

const axiosClient = axios.create({
  baseURL:'https://gharkaachar.onrender.com', // trailing slash optional
  withCredentials: true, // ✅ ONLY here, not in headers
  headers: {
    'Content-Type': 'application/json'
  }
});

export default axiosClient;
