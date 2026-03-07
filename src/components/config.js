// const API_URL = "http://localhost:8000";
// const API_URL = "http://[IP_ADDRESS]";
const API_URL = process.env.REACT_APP_API_HOST || "http://localhost:8000";

export default API_URL;