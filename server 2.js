const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// POST /summarize
app.post('/summarize', async (req, res) => {
    const inputText = req.body.text;
    if (!inputText) {
        return res.status(400).json({ error: 'No text provided.' });
    }
    try {
        if (!process.env.HF_API_KEY) {
            console.error('HF_API_KEY is not set in environment');
            return res.status(500).json({ error: 'Server misconfigured: HF_API_KEY missing' });
        }
        const response = await fetch('https://router.huggingface.co/hf-inference/models/facebook/bart-large-cnn', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.HF_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ inputs: inputText })
        });
        const data = await response.json();
        console.log('HF inference status:', response.status);
        console.log('HF inference body:', data);

        // Handle common HF responses
        if (!response.ok) {
            // Return the HF error message if present
            const msg = data.error || data.detail || `Hugging Face API returned status ${response.status}`;
            return res.status(502).json({ error: msg });
        }

        // Expected: an array with { summary_text }
        if (Array.isArray(data) && data[0] && data[0].summary_text) {
            return res.json({ summary: data[0].summary_text });
        }

        // In some cases the model returns an object with a 'summary_text' key
        if (data.summary_text) {
            return res.json({ summary: data.summary_text });
        }

        // Otherwise return the raw response for debugging
        return res.status(500).json({ error: 'Unexpected HF response', detail: data });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
