// import axios from "axios";

// const apiServer = axios.create({
//   baseURL: "https://api.yaya.ru",
//   timeout: 1000
// });

function requestCode(phone: string) {
  console.log(`make real HTTP request ${phone}`);
  return new Promise<string>((resolve, _) => {
    let wait = setTimeout(() => {
      clearTimeout(wait);
      resolve("auth_token");
    }, 500);
  });
  // return new Promise<string>((_, reject) => {
  //   let wait = setTimeout(() => {
  //     clearTimeout(wait);
  //     reject("error");
  //   }, 500);
  // });
  //apiServer.post("login", { phone });
}

export { requestCode };
