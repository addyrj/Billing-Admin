
const numberToWords = require('number-to-words');

function convertToWords(amount) {

  if (amount === null || amount === undefined || amount === '') return '';

  const numAmount = typeof amount === 'string'
    ? parseFloat(amount.replace(/[^\d.-]/g, ''))
    : Number(amount);

  if (isNaN(numAmount)) return '';

  const rupees = Math.floor(numAmount);
  const paise = Math.round((numAmount - rupees) * 100);

  let words = numberToWords.toWords(rupees).replace(/-/g, ' ') + ' rupees';

  if (paise > 0) {
    words += ' and ' + numberToWords.toWords(paise).replace(/-/g, ' ') + ' paise';
  }

  return words.toLowerCase() + ' only'; // Ensure consistent lowercase
}

module.exports = { convertToWords };

module.exports = {
  convertToWords,
};