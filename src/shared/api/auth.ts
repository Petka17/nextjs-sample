import axios from "axios";
import Decoder, * as _ from "jsonous";
import { succeed } from "jsonous";
import { ok } from "resulty";

const identity = new Decoder(ok);

// TODO: write tests for different responses
// TODO: Handle error case
const requestCode = async (phone: string) => {
  const response = await axios.post("/api/login/request_code", {
    phone,
    profile_type: "employer"
  });

  const parsedResult = _.succeed({})
    .assign("success", _.field("success", _.boolean))
    .assign("data", _.field("data", identity))
    .decodeAny(response.data);

  console.log(parsedResult);

  let result: string = "no_result";

  parsedResult.cata({
    Ok: ({ data }) => {
      console.log(data);
      const dataResult = succeed({})
        .assign("external_id", _.field("external_id", _.string))
        .decodeAny(data);

      console.log(dataResult);

      dataResult.cata({
        Ok: ({ external_id }) => {
          result = external_id;
        },
        Err: error => {
          throw new Error("Parsing error " + error);
        }
      });
    },
    Err: error => {
      throw new Error("Parsing error for initial message " + error);
    }
  });

  return result;
};

export { requestCode };
