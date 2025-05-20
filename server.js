const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const crypto = require('crypto');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files from 'public' directory

// Database configuration
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

// Database initialization function
async function initializeDB() {
    let client;
    try {
        client = await pool.connect();
        
        // Create codes table if it doesn't exist
        await client.query(`
            CREATE TABLE IF NOT EXISTS codes (
                id SERIAL PRIMARY KEY,
                code VARCHAR(64) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        // Insert an initial code if the table is empty
        const result = await client.query("SELECT COUNT(*) as count FROM codes");
        if (parseInt(result.rows[0].count) === 0) {
            const initialCode = generateRandomCode();
            await client.query("INSERT INTO codes (code) VALUES ($1)", [initialCode]);
            console.log("Initial code generated:", initialCode);
        }
        
        console.log("Database initialized successfully");
    } catch (err) {
        console.error("Database initialization error:", err);
        process.exit(1);
    } finally {
        if (client) client.release();
    }
}

// Helper function to generate random code
function generateRandomCode() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    
    for (let i = 0; i < 32; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    return result.match(/.{1,8}/g).join('-');
}

// API Endpoint to check the code
app.post('/api/check-code', async (req, res) => {
    const { code } = req.body;
    let client;

    if (!code) {
        return res.status(400).json({ success: false, message: "Code is required" });
    }

    try {
        client = await pool.connect();

        // Check if the code exists
        const result = await client.query("SELECT * FROM codes WHERE code = $1", [code]);

        if (result.rows.length > 0) {
            // Delete the code to enforce one-time use
            await client.query("DELETE FROM codes WHERE code = $1", [code]);

            return res.json({ 
                success: true, 
                message: "Correct code!",
                flag: "CTF{h1dd3n_d3l3t3_3ndp01nt_f0und}"
            });
        } else {
            return res.json({ success: false, message: "Invalid code" });
        }
    } catch (err) {
        console.error("Error checking code:", err);
        return res.status(500).json({ success: false, message: "Server error" });
    } finally {
        if (client) client.release();
    }
});

// Hidden API endpoint to generate a new code (DELETE method)
app.delete('/api/generate-code', async (req, res) => {
    let client;
    try {
        const newCode = generateRandomCode();
        client = await pool.connect();
        
        // Clear old codes and insert the new one
        await client.query("DELETE FROM codes");
        await client.query("INSERT INTO codes (code) VALUES ($1)", [newCode]);
        
        return res.json({ 
            success: true, 
            message: "New code generated",
            code: newCode
        });
    } catch (err) {
        console.error("Error generating code:", err);
        return res.status(500).json({ success: false, message: "Server error" });
    } finally {
        if (client) client.release();
    }
});

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Health check endpoint (useful for checking if the server is running)
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Start the server
initializeDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}).catch(err => {
    console.error("Failed to initialize database:", err);
    process.exit(1);
});