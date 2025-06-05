const numWords = require('num-words');

function convertToWords(amount) {
  if (amount === null || amount === undefined || amount === '') return '';

  const numAmount = typeof amount === 'string'
    ? parseFloat(amount.replace(/[^\d.-]/g, ''))
    : Number(amount);

  if (isNaN(numAmount)) return '';

  const rupees = Math.floor(numAmount);
  const paise = Math.round((numAmount - rupees) * 100);

  let words = numWords(rupees) + ' rupees';

  if (paise > 0) {
    words += ' and ' + numWords(paise) + ' paise';
  }

  return words.toLowerCase() + ' only'; // Ensures consistent lowercase
}

module.exports = {
  convertToWords,
};
