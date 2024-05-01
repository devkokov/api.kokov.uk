import {onRequest} from "firebase-functions/v2/https";
import {defineSecret} from "firebase-functions/params";

enum Secrets {
  DOB = "DOB",
  VUSA_SHARES = "VUSA_SHARES",
  TRADING212_API_KEY = "TRADING212_API_KEY",
}

const dob = defineSecret(Secrets.DOB);
const vusaShares = defineSecret(Secrets.VUSA_SHARES);
const tradingApiKey = defineSecret(Secrets.TRADING212_API_KEY);

export const millionaireAge = onRequest(
  {
    cors: true,
    region: "europe-west2",
    secrets: [
      Secrets.DOB,
      Secrets.VUSA_SHARES,
      Secrets.TRADING212_API_KEY,
    ],
  },
  (request, response) => {
    fetch(
      "https://demo.trading212.com/api/v0/equity/portfolio/VUSAl_EQ",
      {
        method: "GET",
        headers: {
          Authorization: tradingApiKey.value(),
        },
      }
    ).then((resp) => {
      resp.text().then((data) => {
        const price: number = JSON.parse(data)["currentPrice"];
        const quantity: number = +vusaShares.value();
        const value = price * quantity;

        if (value >= 1000000) {
          response.send("Already a millionaire");
          return;
        }

        const years = Math.log(1000000 / value) / Math.log(1.1);

        const dobTime: number = +dob.value();
        const dobDiff = Math.abs(Date.now() - dobTime * 1000);
        const age = Math.floor((dobDiff / (1000 * 3600 * 24)) / 365.25 + years);

        response.send(`Millionaire at ${age}`);
      });
    });
  }
);
