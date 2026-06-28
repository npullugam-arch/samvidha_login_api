
const { chromium } = require("playwright");

async function loginToSamvidha(samvidhaId, password) {
    let browser;

    try {
        browser = await chromium.launch({
            headless: true // Change to true before deploying to Render
        });

        const page = await browser.newPage();

        await page.goto("https://samvidha.iare.ac.in/", {
            waitUntil: "domcontentloaded"
        });

        // Enter credentials
        await page.fill("#txt_uname", samvidhaId);
        await page.fill("#txt_pwd", password);

        // Click Sign In
        await page.click("#but_submit");

        // Wait for login to complete
        await page.waitForTimeout(5000);

        const currentUrl = page.url();
        const pageTitle = await page.title();

        console.log("Current URL :", currentUrl);
        console.log("Page Title  :", pageTitle);

        // Login Success
        if (
            currentUrl.includes("/home") &&
            pageTitle.includes("Dashboard")
        ) {
            const studentName = await page.locator("body").textContent();

            return {
                success: true,
                message: "Login Successful",
                currentUrl,
                pageTitle,
                studentName
            };
        }

        // Login Failed
        return {
            success: false,
            message: "Invalid Samvidha ID or Password"
        };

    } catch (error) {

        console.error(error);

        return {
            success: false,
            message: error.message
        };

    } finally {

        if (browser) {
            await browser.close();
        }

    }
}

module.exports = {
    loginToSamvidha
};

