import axios from "axios";

const api = axios.create({
    baseURL: "https://merligus-eco-app.herokuapp.com"
});

export default api;