const { chromium } = require("playwright");

async function getValue(page, label) {

    const value = await page
        .locator(`xpath=//dt[normalize-space(text())="${label}"]/following-sibling::dd[1]`)
        .textContent();

    return value ? value.trim() : "";

}

async function getProfile(samvidhaId, password) {

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

        if (!page.url().includes("/home")) {

            return {
                success: false,
                message: "Invalid Samvidha ID or Password"
            };

        }

        await page.goto(
            "https://samvidha.iare.ac.in/home?action=profile",
            {
                waitUntil: "networkidle"
            }
        );

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

    getProfile

};