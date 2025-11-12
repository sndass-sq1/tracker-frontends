import CryptoJS from "crypto-js";

const SECRET_KEY = import.meta.env.VITE_APP_SECRET_KEY;
export const encryptData = (data) => {
  const stringData = typeof data === "string" ? data : JSON.stringify(data);
  return CryptoJS.AES.encrypt(stringData, SECRET_KEY).toString();
};

// export const decryptData = (cipherText) => {
//   try {
//     const bytes = CryptoJS.AES.decrypt(cipherText, SECRET_KEY)
//     const decryptedText = bytes.toString(CryptoJS.enc.Utf8)
//     try {
//       return JSON.parse(decryptedText)
//     } catch {
//       return decryptedText
//     }
//   } catch (err) {
//     console.error('Decryption error:', err)
//     return null
//   }
// }
export const decryptData = (cipherText) => {
  try {
    if (!cipherText || typeof cipherText !== "string") {
      throw new Error("Invalid cipherText");
    }

    const bytes = CryptoJS.AES.decrypt(cipherText, SECRET_KEY);
    const decryptedText = bytes.toString(CryptoJS.enc.Utf8);

    if (!decryptedText) {
      throw new Error("Decryption failed or returned empty string");
    }

    try {
      return JSON.parse(decryptedText);
    } catch {
      return decryptedText;
    }
  } catch (err) {
    console.error("Decryption error:", err);
    return null;
  }
};
