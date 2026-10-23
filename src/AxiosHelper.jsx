import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});




api.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (user?.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});



// api.interceptors.response.use(
//   (success) => {
//     return success;
//   }, 

//   async (err) => {
//     if (err.config.url == "/regesteration/Refresh") {
//       localStorage.removeItem("user");
//       window.location.href = "/Registration?regtype=login";
//       return Promise.reject(err);
//     }

//     if (err.response.status != 401) {
//       return Promise.reject(err);
//     } else {
//       if (err.config._retry) {
//         return Promise.reject(err);
//       }

//       err.config._retry = true;

//       try {
//         const res = await api.post("/regesteration/Refresh", {
//           withCredentials: true,
//         });

//         // console.log(res.data["token"]);

//         const user = JSON.parse(localStorage.getItem("user"));

//         user.token = res.data["token"];
//         console.log(user);
//         localStorage.setItem("user", JSON.stringify(user));

//         err.config.headers.Authorization = `Bearer ${user.token}`;
//         return await api(err.config);
//       } catch (error) {
//         throw error;
//       }
//     }
//   },
// );

export default api;
