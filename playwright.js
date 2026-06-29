const { chromium } = require("playwright");

async function loginToSamvidha(samvidhaId, password) {

    let browser;

    try {

        browser = await chromium.launch({
            headless: true,
            args: [
                "--no-sandbox",
                "--disable-setuid-sandbox",
                "--disable-dev-shm-usage",
                "--disable-gpu",
                "--single-process",
                "--no-zygote"
            ]
        });

        const page = await browser.newPage();

        await page.goto("https://samvidha.iare.ac.in/", {
            waitUntil: "networkidle",
            timeout: 60000
        });

        await page.fill("#txt_uname", samvidhaId);
        await page.fill("#txt_pwd", password);

        await page.click("#but_submit");

        await page.waitForTimeout(5000);

        const currentUrl = page.url();
        const pageTitle = await page.title();

        console.log("Current URL :", currentUrl);
        console.log("Page Title  :", pageTitle);

        if (
            currentUrl.includes("/home") &&
            pageTitle.toLowerCase().includes("dashboard")
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

        return {
            success: false,
            message: "Invalid Samvidha ID or Password"
        };

    } catch (error) {

        console.error("Playwright Error:", error);

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