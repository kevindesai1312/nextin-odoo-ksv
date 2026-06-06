import express from 'express';
import { protect } from '../middleware/auth.js';
import https from 'https';
import fs from 'fs';

const router = express.Router();

router.post('/', protect, async (req, res) => {
  try {
    const { message, history } = req.body;

    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }

    const hfApiKey = process.env.HF_API_KEY;
    if (!hfApiKey) {
      return res.status(500).json({ message: 'AI Chat is not configured on the server.' });
    }

    // Build conversation prompt for Hugging Face (using Zephyr or Mistral prompt format)
    // Zephyr/Mistral Instruct format: <|system|>\nSystem message</s>\n<|user|>\nUser message</s>\n<|assistant|>\n
    let prompt = "<|system|>\nYou are the VendorBridge Assistant, a helpful AI chatbot designed to assist users with procurement, RFQs, quotations, and purchase orders. Keep answers concise and professional.</s>\n";
    
    if (history && Array.isArray(history)) {
      for (const msg of history) {
        if (msg.role === 'user') {
          prompt += `<|user|>\n${msg.content}</s>\n`;
        } else if (msg.role === 'assistant') {
          prompt += `<|assistant|>\n${msg.content}</s>\n`;
        }
      }
    }
    
    prompt += `<|user|>\n${message}</s>\n<|assistant|>\n`;

    // Make the request to Hugging Face using native https to avoid fetch/undici DNS bugs on Windows
    const payloadData = JSON.stringify({
      inputs: prompt,
      parameters: {
        max_new_tokens: 500,
        temperature: 0.7,
        top_p: 0.95,
        return_full_text: false,
      }
    });

    const options = {
      hostname: 'router.huggingface.co',
      port: 443,
      path: '/hf-inference/models/HuggingFaceH4/zephyr-7b-beta',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${hfApiKey}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payloadData)
      }
    };

    const hfReq = https.request(options, (hfRes) => {
      let data = '';

      hfRes.on('data', (chunk) => {
        data += chunk;
      });

      hfRes.on('end', () => {
        if (hfRes.statusCode !== 200) {
          console.error('Hugging Face API Error:', data);
          fs.writeFileSync('chat-error.log', JSON.stringify({ type: 'HF_API_ERROR', status: hfRes.statusCode, data }, null, 2));
          return res.status(502).json({ message: 'Error communicating with AI service', details: data });
        }

        try {
          const parsedData = JSON.parse(data);
          let reply = parsedData[0]?.generated_text || "I'm sorry, I couldn't process that request.";
          reply = reply.replace(/<\/s>/g, '').trim();
          res.json({ reply });
        } catch (e) {
          console.error('Failed to parse HF response:', e);
          res.status(502).json({ message: 'Invalid response from AI service' });
        }
      });
    });

    hfReq.on('error', (e) => {
      console.error('Hugging Face Request Error:', e);
      fs.writeFileSync('chat-error.log', JSON.stringify({ type: 'HTTPS_REQ_ERROR', message: e.message }, null, 2));
      res.status(502).json({ message: 'Network error communicating with AI service' });
    });

    hfReq.write(payloadData);
    hfReq.end();

  } catch (error) {
    console.error('Chat API Error:', error);
    fs.writeFileSync('chat-error.log', JSON.stringify({ type: 'CATCH_ERROR', message: error.message, stack: error.stack }, null, 2));
    res.status(500).json({ message: 'Internal server error', details: error.message });
  }
});

export default router;
