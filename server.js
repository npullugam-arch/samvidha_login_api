const express = require("express");
const cors = require("cors");

const { loginToSamvidha } = require("./playwright");

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {

    res.json({
        success: true,
        message: "Samvidha Login API is Running 🚀"
    });

});

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
        console.log("New Login Request");
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

app.listen(PORT, () => {

    console.log(`🚀 Server running on port ${PORT}`);

});