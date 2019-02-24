import axios from "axios";

function requestCode(phone: string) {
  console.log(`make real HTTP request ${phone}`);
  return axios
    .post("/api/login/request_code", {
      phone,
      profile_type: "employer"
    })
    .then(() => "success");
}

export { requestCode };
