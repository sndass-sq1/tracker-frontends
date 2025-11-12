export const shortenNumber = (num) => {
  if (num >= 10000) {
    const suffixes = ["", "k", "m", "b", "t"];
    const suffixNum = Math.floor(("" + num).length / 3);
    let shortNum = suffixNum !== 0 ? num / Math.pow(1000, suffixNum) : num;

    // If the length of the number modulo 3 is 0, it means we need to adjust the suffixNum
    if (("" + num).length % 3 === 0) {
      shortNum = num / Math.pow(1000, suffixNum - 1);
      return shortNum.toFixed(1) + suffixes[suffixNum - 1];
    }

    // Format the number to display one decimal place
    shortNum = parseFloat(shortNum.toFixed(1));

    return shortNum + suffixes[suffixNum];
  } else {
    return num;
  }
};
