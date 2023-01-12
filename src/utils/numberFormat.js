import numeral from "numeral";

export function fNumber(number) {
  return numeral(number).format();
}

export function fDuration(value) {
  const minute = Math.floor(value / 60);
  const secondLeft = value - minute * 60;
  return `${minute}:${secondLeft < 10 ? `0${secondLeft}` : secondLeft}`;
}

export function fCurrency(value) {
  const formated = numeral(value).format('$0,0.00');
  return formatedResult(formated, ".00");
}

export function fRatings(value) {
  const formated = numeral(value).format('0.0');
  return formatedResult(formated, ".0");
}

export function fShortenNumber(number) {
  const formated = numeral(number).format("0.00a");
  return formatedResult(formated, ".00");
}

export function fListens(listens) {
  const formated = numeral(listens).format("0.0a");
  return formatedResult(formated, ".0");
}

const formatedResult = (formated, key = ".00") => {
  const isInt = formated.includes(key);
  return isInt ? formated.replace(key, "") : formated;
};
