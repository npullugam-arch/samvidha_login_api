const fs = require("fs");
const path = require("path");

const { getPage, closePage } = require("./browser");

const SESSION_FOLDER = path.join(__dirname, "sessions");

async function loginToSamvidha(samvidhaId, password) {

    let context;

    try {

        const browserData = await getPage(samvidhaId);

        context = browserData.context;
        const page = browserData.page;

        const sessionFile = path.join(
            SESSION_FOLDER,
            `${samvidhaId}.json`
        );

        // If session exists, try to reuse it
        if (fs.existsSync(sessionFile)) {

            console.log("✅ Trying Saved Session...");

            await page.goto(
                "https://samvidha.iare.ac.in/home",
                {
                    waitUntil: "domcontentloaded",
                    timeout: 60000
                }
            );

            if (page.url().includes("/home")) {

                return {
                    success: true,
                    message: "Login Successful (Session Reused)",
                    currentUrl: page.url(),
                    pageTitle: await page.title(),
                    studentName: await page.locator("body").textContent()
                };

            }

            console.log("⚠️ Session Expired.");

        }

        // Fresh Login
        console.log("🔐 Performing Fresh Login...");

        await page.goto(
            "https://samvidha.iare.ac.in/",
            {
                waitUntil: "domcontentloaded",
                timeout: 30000
            }
        );

        await page.fill("#txt_uname", samvidhaId);
        await page.fill("#txt_pwd", password);

        await Promise.all([
            page.waitForNavigation({
                waitUntil: "domcontentloaded",
                timeout: 15000
            }),
            page.click("#but_submit")
        ]);

        if (!page.url().includes("/home")) {

            return {
                success: false,
                message: "Invalid Samvidha ID or Password"
            };

        }

        if (!fs.existsSync(SESSION_FOLDER)) {

            fs.mkdirSync(SESSION_FOLDER);

        }

        await context.storageState({

            path: sessionFile

        });

        console.log("💾 Session Saved.");

        return {

            success: true,
            message: "Login Successful",
            currentUrl: page.url(),
            pageTitle: await page.title(),
            studentName: await page.locator("body").textContent()

        };

    } catch (error) {

        console.error("Playwright Error:", error);

        return {

            success: false,
            message: error.message

        };

    } finally {

        if (context) {

            await closePage(context);

        }

    }

}

module.exports = {

    loginToSamvidha

};