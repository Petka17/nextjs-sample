import axios from "axios";
import * as _ from "jsonous";

// TODO: write tests for different responses
// TODO: Handle error case
const requestCode = async (phone: string) => {
  const response = await axios.post("/api/login/request_code", {
    phone,
    profile_type: "employer"
  });

  const parsedResult = _.succeed({})
    .assign("success", _.field("success", _.boolean))
    .assign(
      "data",
      _.field(
        "data",
        _.succeed({})
          .assign("external_id", _.field("external_id", _.string))
          .assign("expires_in", _.field("expires_in", _.number))
          .assign(
            "timeout_expiration_block",
            _.field("timeout_expiration_block", _.number)
          )
      )
    )
    .decodeAny(response.data);

  let result: string = "";
  parsedResult.cata({
    Ok: ({ data }) => {
      result = data.external_id;
    },
    Err: error => {
      throw new Error("Parsing error " + error);
    }
  });

  return result;
};

export { requestCode };
