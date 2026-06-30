const fs = require("fs");
const path = require("path");

const { getPage, closePage } = require("./browser");

const SESSION_FOLDER = path.join(__dirname, "sessions");

async function getValue(page, label) {

    try {

        const value = await page
            .locator(`xpath=//dt[normalize-space(text())="${label}"]/following-sibling::dd[1]`)
            .textContent();

        return value ? value.trim() : "";

    } catch {

        return "";

    }

}

async function getProfile(samvidhaId, password) {

    let context;

    try {

        const browserData = await getPage(samvidhaId);

        context = browserData.context;
        const page = browserData.page;

        // Try to open profile directly
        await page.goto(
            "https://samvidha.iare.ac.in/home?action=profile",
            {
                waitUntil: "domcontentloaded",
                timeout: 30000
            }
        );

        // Session expired → Login again
        if (!page.url().includes("/home")) {

            console.log("🔐 Session Expired. Logging in...");

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
                path: path.join(
                    SESSION_FOLDER,
                    `${samvidhaId}.json`
                )
            });

            console.log("💾 New Session Saved.");

            await page.goto(
                "https://samvidha.iare.ac.in/home?action=profile",
                {
                    waitUntil: "domcontentloaded",
                    timeout: 30000
                }
            );

        } else {

            console.log("✅ Existing Session Used.");

        }

        const profile = {

            rollNumber: await getValue(page, "Roll Number"),
            abcId: await getValue(page, "ABC ID"),
            jntuhAebas: await getValue(page, "JNTUH AEBAS"),
            name: await getValue(page, "Name"),
            aadhaarNumber: await getValue(page, "AAdhar Number"),
            branch: await getValue(page, "Branch"),
            yearSem: await getValue(page, "Year/Sem"),
            section: await getValue(page, "Section"),
            gender: await getValue(page, "Gender"),
            fatherName: await getValue(page, "Father Name"),
            motherName: await getValue(page, "Mother Name"),
            fatherOccupationType: await getValue(page, "Father Occupation Type"),
            fatherOccupation: await getValue(page, "Father Occupation"),
            dateOfBirth: await getValue(page, "Date of Birth"),
            dateOfJoining: await getValue(page, "Date of Joining"),
            regulation: await getValue(page, "Regulation"),
            status: await getValue(page, "Status")

        };

        return {

            success: true,
            profile

        };

    } catch (error) {

        console.error("Profile Error:", error);

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

    getProfile

};