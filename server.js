
const { supabase } = require("./supabase");
const express = require("express");
const cors = require("cors");

const { loginToSamvidha } = require("./playwright");
const { getProfile } = require("./profile");
const { initBrowser, closeBrowser } = require("./browser");

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// ---------------- Initialize Browser ----------------

(async () => {

    try {

        await initBrowser();
        console.log("✅ Playwright Browser Initialized");

    } catch (error) {

        console.error("❌ Failed to initialize browser:", error);

    }

})();

// ---------------- Home Route ----------------

app.get("/", (req, res) => {

    res.json({
        success: true,
        message: "Samvidha Login API is Running 🚀"
    });

});





app.get("/test-db", async (req, res) => {

    try {

        const { data, error } = await supabase
            .from("student_profiles")
            .select("*")
            .limit(1);

        if (error) {

            return res.status(500).json(error);

        }

        return res.json({
            success: true,
            data
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }

});
// ---------------- LOGIN API ----------------

app.post("/login", async (req, res) => {

    try {

        const { samvidhaId, password } = req.body;

        if (!samvidhaId || !password) {

            return res.status(400).json({
                success: false,
                message: "Samvidha ID and Password are required."
            });

        }

        console.log("==================================");
        console.log("LOGIN REQUEST");
        console.log("Samvidha ID :", samvidhaId);
        console.log("==================================");

        const result = await loginToSamvidha(
            samvidhaId,
            password
        );

        return res.json(result);

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }

});

// ---------------- PROFILE API ----------------

app.post("/profile", async (req, res) => {

    try {

        const { samvidhaId, password } = req.body;

        if (!samvidhaId || !password) {

            return res.status(400).json({
                success: false,
                message: "Samvidha ID and Password are required."
            });

        }

        console.log("==================================");
        console.log("PROFILE REQUEST");
        console.log("Samvidha ID :", samvidhaId);
        console.log("==================================");

        const result = await getProfile(
            samvidhaId,
            password
        );

        return res.json(result);

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }

});

// ---------------- Start Server ----------------

const server = app.listen(PORT, () => {

    console.log(`🚀 Server running on port ${PORT}`);

});

// ---------------- Graceful Shutdown ----------------

process.on("SIGINT", async () => {

    console.log("\n🛑 Shutting down server...");

    await closeBrowser();

    server.close(() => {

        console.log("✅ Server Closed");
        process.exit(0);

    });

});

process.on("SIGTERM", async () => {

    console.log("\n🛑 Shutting down server...");

    await closeBrowser();

    server.close(() => {

        console.log("✅ Server Closed");
        process.exit(0);

    });

});