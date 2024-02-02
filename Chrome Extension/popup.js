// popup.js

// Function to take a screenshot of the current page.
function takeScreenshot() {
    chrome.tabs.captureVisibleTab({ format: "png" }, function (screenshotUrl) {
        // Make a GET request to your API endpoint with screenshotUrl and bodyText as parameters
        axios.post('http://localhost:8080/extension/userinterface', {
            screenshotUrl: screenshotUrl,
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(function(response) {
            // Handle the response as needed
            document.getElementById('response1').innerText = `${response.data}`;
        })
        .catch(function(error) {
            console.error('Request failed:', error);
        });
    });
}

function checkText(){
    const output = document.getElementById('output').innerText;
    const bodyText = document.getElementById('output').innerText;
    if (output){
        axios.post('http://localhost:8080/extension/urgency', {
            bodyText: bodyText
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(function(response) {
            // Handle the response as needed
            console.log(`Urgency Response:${response.data}`)
            document.getElementById('response2').innerText = `${response.data}`
        })
        .catch(function(error) {
            console.error('Request failed:', error);
        });
    }
}

// Attach the event listener to the button.
document.addEventListener("DOMContentLoaded", function () {
    const screenshotBtn = document.getElementById("captureBtn");

    if (screenshotBtn) {
        screenshotBtn.addEventListener("click", takeScreenshot);
    } else {
        console.error("SS Button not found.");
    }

    const textBtn = document.getElementById("textBtn");
    if(textBtn){
        textBtn.addEventListener("click" , checkText);
    } else {
        console.error("Text Button not found.");
    }
});

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    // Check if text is present
    console.log('message lines', message.lines);
    if (message.lines) {
        // Update the content of the output div in popup.html
        document.getElementById('output').innerText = message.lines;
    } else {
        // If no text is received, display a message indicating no text extracted
        document.getElementById('output').innerText = 'No text extracted.';
    }
});
