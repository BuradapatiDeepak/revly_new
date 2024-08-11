const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const puppeteer = require('puppeteer');

const app = express();

// Middleware setup
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(bodyParser.json()); // Parse JSON bodies of incoming requests

// POST route for analyzing a website
app.post('/analyze', async (req, res) => {
    const { url } = req.body; // Extract the URL from the request body
    try {
        // Launch a new browser instance and create a new page
        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        // Initialize metrics
        let totalRequestSize = 0; // To track total size of all requests
        let requestCount = 0; // To track the number of requests

        // Track each network request to calculate size and count
        page.on('requestfinished', async (request) => {
            const response = await request.response(); // Get the response object
            const responseHeaders = response.headers(); // Extract headers from the response
            const contentLength = parseInt(responseHeaders['content-length'] || 0, 10); // Parse content-length header
            totalRequestSize += contentLength; // Add size to total
            requestCount++; // Increment request count
        });

        const start = Date.now(); // Start timing the page load
        await page.goto(url, { waitUntil: 'networkidle0' }); // Navigate to the URL and wait for network to be idle

        // Capture various performance metrics
        const metrics = await page.metrics(); // Get performance metrics from Puppeteer
        const performanceTiming = await page.evaluate(() => JSON.parse(JSON.stringify(window.performance.timing))); // Capture performance timing data from the browser

        // Capture Core Web Vitals using browser's performance entries
        const coreWebVitals = await page.evaluate(() => {
            return {
                ttfb: performance.timing.responseStart - performance.timing.requestStart, // Time to First Byte
                fcp: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0, // First Contentful Paint
                lcp: performance.getEntriesByType('largest-contentful-paint')[0]?.startTime || 0, // Largest Contentful Paint
                fid: performance.getEntriesByType('first-input')[0]?.processingStart - performance.getEntriesByType('first-input')[0]?.startTime || 0, // First Input Delay
                cls: performance.getEntriesByType('layout-shift').reduce((acc, shift) => acc + shift.value, 0) // Cumulative Layout Shift
            };
        });

        await browser.close(); // Close the browser instance

        // Combine all metrics into one object
        const fullMetrics = {
            ...metrics, // Include general performance metrics
            pageLoadTime: Date.now() - start, // Total page load time
            totalRequestSize, // Total size of all requests
            requestCount, // Number of network requests
            navigationStart: performanceTiming.navigationStart, // Navigation start time
            responseStart: performanceTiming.responseStart, // Response start time
            domComplete: performanceTiming.domComplete, // DOM complete time
            ...coreWebVitals // Include Core Web Vitals metrics
        };

        console.log(fullMetrics); // Log the collected metrics for debugging
        res.json(fullMetrics); // Send the metrics back in the response
    } catch (error) {
        console.error(error); // Log any errors
        res.status(500).json({ error: 'Failed to analyze the website' }); // Respond with an error message
    }
});

const PORT = process.env.PORT || 5000; // Use environment port or default to 5000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`)); // Start the server
