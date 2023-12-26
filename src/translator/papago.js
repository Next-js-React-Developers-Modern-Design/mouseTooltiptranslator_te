// https://github.com/PinMIlk/nodepapago
import BaseTranslator from "./BaseTranslator";
import ky from "ky";
import { v4 as uuidv4 } from "uuid";
import Crypto from "crypto";

var papagoLangCode = {
  ar: "ar",
  en: "en",
  fa: "fa",
  fr: "fr",
  de: "de",
  hi: "hi",
  id: "id",
  it: "it",
  ja: "ja",
  ko: "ko",
  my: "mm",
  pt: "pt",
  ru: "ru",
  es: "es",
  th: "th",
  vi: "vi",
  "zh-CN": "zh-CN",
  "zh-TW": "zh-TW",
};
// var urlTranslate="https://papago.naver.com/apis/nsmt/translate"
var urlTranslate = "https://papago.naver.com/apis/n2mt/translate";
var urlDect = "https://papago.naver.com/apis/langs/dect";
var mainUrl = "https://papago.naver.com/";

export default class papago extends BaseTranslator {
  static langCodeJson = papagoLangCode;
  static version = "";

  static async requestTranslate(text, fromLang, targetLang) {
    if (fromLang == "auto") {
      var { headers, uuid } = await this.getOptionsAndUuid(urlDect);
      var { langCode } = await ky
        .post(urlDect, {
          searchParams: { query: text },
          headers,
        })
        .json();
      fromLang = langCode;
    }

    var { headers, uuid } = await this.getOptionsAndUuid(urlTranslate);
    return await ky
      .post(urlTranslate, {
        searchParams: {
          deviceId: uuid,
          locale: "ko",
          dict: "true",
          dictDisplay: "30",
          honorific: "false",
          instant: "false",
          paging: "false",
          source: fromLang,
          target: targetLang,
          text: text,
        },
        headers,
      })
      .json();
  }

  static wrapResponse(res, fromLang, targetLang) {
    return {
      translatedText: res["translatedText"],
      detectedLang: res["srcLangType"],
      transliteration: "",
    };
  }

  static async getVersion() {
    var data = await ky(mainUrl).text();
    var scriptUrl = mainUrl + "main." + data.match(/"\/main.([^"]+)"/)[1];
    var data = await ky(scriptUrl).text();
    var version = "v1." + data.match(/"v1.([^"]+)"/)[1];
    return version;
  }
  static async getToken(url) {
    var uuid = uuidv4();
    var time = Date.now();
    this.version = this.version ? this.version : await this.getVersion();
    var hash = Crypto.createHmac("md5", this.version)
      .update(`${uuid}\n${url}\n${time}`)
      .digest("base64");
    return {
      uuid,
      time,
      hash,
    };
  }
  static async getOptionsAndUuid(url) {
    var { uuid, time, hash } = await this.getToken(url);

    return {
      headers: {
        Authorization: `PPG ${uuid}:${hash}`,
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        Timestamp: time,
      },
      uuid,
    };
  }
}
