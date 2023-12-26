import BaseTranslator from "./BaseTranslator";
import ky from "ky";

var bingLangCode = {
  auto: "auto-detect",
  af: "af",
  am: "am",
  ar: "ar",
  az: "az",
  bg: "bg",
  bs: "bs",
  ca: "ca",
  cs: "cs",
  cy: "cy",
  da: "da",
  de: "de",
  el: "el",
  en: "en",
  es: "es",
  et: "et",
  fa: "fa",
  fi: "fi",
  fr: "fr",
  ga: "ga",
  gu: "gu",
  hi: "hi",
  hmn: "mww",
  hr: "hr",
  ht: "ht",
  hu: "hu",
  hy: "hy",
  id: "id",
  is: "is",
  it: "it",
  iw: "he",
  ja: "ja",
  kk: "kk",
  km: "km",
  kn: "kn",
  ko: "ko",
  ku: "ku",
  lo: "lo",
  lt: "lt",
  lv: "lv",
  mg: "mg",
  mi: "mi",
  ml: "ml",
  mr: "mr",
  ms: "ms",
  mt: "mt",
  my: "my",
  ne: "ne",
  nl: "nl",
  no: "nb",
  pa: "pa",
  pl: "pl",
  ps: "ps",
  pt: "pt",
  ro: "ro",
  ru: "ru",
  sk: "sk",
  sl: "sl",
  sm: "sm",
  sq: "sq",
  sr: "sr-Cyrl",
  sv: "sv",
  sw: "sw",
  ta: "ta",
  te: "te",
  th: "th",
  tl: "fil",
  tr: "tr",
  uk: "uk",
  ur: "ur",
  vi: "vi",
  "zh-CN": "zh-Hans",
  "zh-TW": "zh-Hant",
};

let bingAccessToken;
let bingBaseUrl = "https://www.bing.com/ttranslatev3";
let bingTokenUrl = "https://www.bing.com/translator";
let bingTtsUrl = "https://www.bing.com/tfettts";

export default class bing extends BaseTranslator {
  static langCodeJson = bingLangCode;

  static async requestTranslate(text, fromLang, targetLang) {
    const { token, key, IG, IID } = await getBingAccessToken();

    return await ky
      .post(bingBaseUrl, {
        searchParams: {
          IG,
          IID: IID && IID.length ? IID + "." + bingAccessToken.count++ : "",
          isVertical: "1",
        },
        body: new URLSearchParams({
          text,
          fromLang: fromLang,
          to: targetLang,
          token,
          key,
        }),
      })
      .json();
  }
  static wrapResponse(res, fromLang, targetLang) {
    if (res && res[0]) {
      var transliteration = "";

      if (res[1]) {
        transliteration = res[1]["inputTransliteration"];
      }

      var detectedLang = res[0]["detectedLanguage"]["language"];
      var translatedText = res[0]["translations"][0]["text"];
      return { translatedText, detectedLang, transliteration };
    }
  }

  static async requestTts(text, voice = "en-US-AriaNeural", rate, volume) {
    const { token, key, IG, IID } = await getBingAccessToken();
    // `<prosody pitch='+${pitch}Hz' rate ='+${rate}%' volume='+${volume}%'></prosody>`
    //  <voice xml:lang='en-US' xml:gender='Female' name='en-US-AriaNeural'></voice>
    var voice = voice.replace("BingTTS_", "");
    var voiceSplit = voice.split("-");
    voiceSplit = voiceSplit.slice(0, -1);
    var locale = voiceSplit.join("-");
    var rate100 = rate * 100 - 100;

    return await ky
      .post(bingTtsUrl, {
        searchParams: {
          IG,
          IID: IID && IID.length ? IID + "." + bingAccessToken.count++ : "",
          isVertical: "1",
        },
        body: new URLSearchParams({
          ssml: `<speak version='1.0' xml:lang='${locale}'><voice name='${voice}'><prosody rate='${rate100}%'>${text}</prosody></voice></speak>`,
          token,
          key,
        }),
      })
      .blob();
  }
}

async function getBingAccessToken() {
  // https://github.com/plainheart/bing-translate-api/blob/dd0319e1046d925fa4cd4850e2323c5932de837a/src/index.js#L42
  try {
    //if no access token or token is timeout, get new token
    if (
      !bingAccessToken ||
      Date.now() - bingAccessToken["tokenTs"] >
        bingAccessToken["tokenExpiryInterval"]
    ) {
      const data = await ky(bingTokenUrl).text();
      const IG = data.match(/IG:"([^"]+)"/)[1];
      const IID = data.match(/data-iid="([^"]+)"/)[1];
      var [_key, _token, interval] = JSON.parse(
        data.match(/params_AbusePreventionHelper\s?=\s?([^\]]+\])/)[1]
      );
      bingAccessToken = {
        IG,
        IID,
        key: _key,
        token: _token,
        tokenTs: _key,
        tokenExpiryInterval: interval,
        isAuthv2: undefined,
        count: 0,
      };
    }
    return bingAccessToken;
  } catch (e) {
    console.log(e);
  }
}
