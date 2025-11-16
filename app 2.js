// on click of any image, go to next html page
document.querySelectorAll('img').forEach(img => {
    img.addEventListener('click', () => {
        window.location.href = 'dashboard.html';
    });
})



async function summarizeText() {
    const textarea = document.querySelector('.summarizer-box textarea');
    const outputDiv = document.querySelector('.output-content');
    const inputText = textarea.value.trim();

    if (!inputText) {
        outputDiv.innerText = 'Please enter text to summarize.';
        return;
    }

    outputDiv.innerText = 'Summarizing...';

    try {
        const response = await fetch('http://localhost:3001/summarize', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ text: inputText })
        });

        const data = await response.json();
        console.log('Server Response:', data);
        if (data.summary) {
            outputDiv.innerText = data.summary;
        } else if (data.error) {
            outputDiv.innerText = `Error: ${data.error}`;
        } else {
            outputDiv.innerText = 'Error: Could not summarize text.';
        }
    } catch (error) {
        outputDiv.innerText = `Error: ${error.message}`;
    }
}

// Attach function to button
document.addEventListener('DOMContentLoaded', function() {
    const button = document.querySelector('.summarizer-box button');
    if (button) {
        button.addEventListener('click', summarizeText);
    }
});

