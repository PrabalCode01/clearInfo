function extractText() {
  return document.body.innerText;
}
const extractedText = extractText();
console.log('body:',extractedText)
chrome.runtime.sendMessage({ lines: extractedText });
  