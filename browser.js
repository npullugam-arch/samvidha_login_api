const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

let browser = null;

const SESSION_FOLDER = path.join(__dirname, "sessions");

/**
 * Get Browser
 * If browser is closed/crashed, launch again.
 */
async function initBrowser() {

    try {

        if (browser) {

            browser.contexts();

            return browser;

        }

    } catch (err) {

        console.log("⚠️ Browser crashed. Launching again...");

        browser = null;

    }

    console.log("🚀 Launching Chromium Browser...");

    browser = await chromium.launch({

        headless: true,

        args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-dev-shm-usage",
            "--disable-gpu"
        ]

    });

    console.log("✅ Browser Ready");

    return browser;

}

/**
 * Create Page
 */
async function getPage(samvidhaId = null) {

    const browserInstance = await initBrowser();

    let context;

    if (samvidhaId) {

        const sessionFile = path.join(
            SESSION_FOLDER,
            `${samvidhaId}.json`
        );

        if (fs.existsSync(sessionFile)) {

            console.log("✅ Loading Session:", samvidhaId);

            context = await browserInstance.newContext({

                storageState: sessionFile

            });

        } else {

            console.log("🆕 No Session:", samvidhaId);

            context = await browserInstance.newContext();

        }

    } else {

        context = await browserInstance.newContext();

    }

    const page = await context.newPage();

    page.setDefaultTimeout(30000);

    return {

        context,
        page

    };

}

/**
 * Close Context
 */
async function closePage(context) {

    try {

        if (context) {

            await context.close();

        }

    } catch (error) {

        console.log("Context Close Error:", error.message);

    }

}

/**
 * Close Browser
 */
async function closeBrowser() {

    try {

        if (browser) {

            console.log("🛑 Closing Browser...");

            await browser.close();

            browser = null;

        }

    } catch (error) {

        console.log("Browser Close Error:", error.message);

    }

}

module.exports = {

    initBrowser,
    getPage,
    closePage,
    closeBrowser

};