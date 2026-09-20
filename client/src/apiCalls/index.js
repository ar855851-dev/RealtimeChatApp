// src/api/index.js (ya jahan aapki API calls ki index.js file hai)
import axios from "axios";

export const axiosInstance = axios.create({
    baseURL: "https://realtimechatapp-7ooa.onrender.com",
});

// Har request ke sath dynamic token bhejne ke liye interceptor
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);