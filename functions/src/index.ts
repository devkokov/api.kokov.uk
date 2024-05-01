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
    response.contentType("application/json");
    fetch(
      "https://demo.trading212.com/api/v0/equity/portfolio/VUSAl_EQ",
      {
        method: "GET",
        headers: {
          Authorization: tradingApiKey.value(),
        },
      }
    ).then((resp) => {
      resp.json().then((data) => {
        const price: number = data.currentPrice;
        const quantity: number = +vusaShares.value();
        const value = price * quantity;

        const dobTime: number = +dob.value();
        const dobDiff = Math.abs(Date.now() - dobTime * 1000);
        let age = (dobDiff / (1000 * 3600 * 24)) / 365.25;

        if (value >= 1000000) {
          response.send(JSON.stringify({age: Math.floor(age)}));
          return;
        }

        const years = Math.log(1000000 / value) / Math.log(1.1);
        age = Math.floor(age + years);

        response.send(JSON.stringify({age}));
      });
    });
  }
);
