import axios from "axios";
import { headers } from "next/headers";


const INTERNAL_URL =  process.env.INTERNAL_API_URL || "http://backend:8080/api/v1";

const internalApiClient = axios.create({
    baseURL: INTERNAL_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

export default internalApiClient;