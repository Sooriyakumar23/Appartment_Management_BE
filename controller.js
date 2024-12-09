const {
  signIn,
  signUp,
  getMainProperties,
  getSubPropertiesForPropertyId,
  createProperty,
  editProperty,
  changePropertyStatus,
  changePropertyCheckinCheckoutTime,
  createPropertyImage,
} = require("./service");

const { validateToken } = require("./auth");

const axios = require("axios");
const express = require("express");
const { ROLE } = require("./enums");
const app = express();

const PORT = 8000;
const IMGUR_CLIENT_ID = "67c83e5be3c6027";
const IMGUR_CLIENT_SECRET = "3d894a3ae238de145ecc33b9ffe560951ffabbb2";

app.use(express.json());

app.get("/health", (req, res) => {
  const healthMessage =
    "Your Property Management Backend is up and running..... :)";
  console.log(healthMessage);
  res.send(healthMessage);
});

app.post("/sign-in", async (req, res) => {
  const requestData = req.body;
  const userName = requestData.userName;
  const password = requestData.password;
  if (!userName || !password) {
    return res
      .status(400)
      .json({ error: "User Name or Password format Incorrect" });
  }
  try {
    result = await signIn(userName, password);
    return res.status(200).json({ data: result });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: { message: error.message } });
  }
});

app.post("/sign-up", async (req, res) => {
  const requestData = req.body;
  const userName = requestData.userName;
  const password = requestData.password;
  if (!userName || !password) {
    return res
      .status(400)
      .json({ error: "User Name or Password format Incorrect" });
  }
  try {
    result = await signUp(requestData);
    return res.status(200).json({ data: result });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: { message: error.message } });
  }
});

app.get("/get-main-properties", async (req, res) => {
  const requestData = req.body;
  const token = req.headers.Authorization;
  const filters = requestData.filters;

  let decoded = null;
  if (token) {
    decoded = validateToken(token, requestData.userId);
  }

  try {
    result = await getMainProperties(decoded, filters);
    return res.status(200).json({ data: result });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: { message: error.message } });
  }
});

app.get("/get-sub-properties-for-propertyId", async (req, res) => {
  const requestData = req.body;
  const token = req.headers.Authorization;
  const propertyId = requestData.propertyId;

  let decoded = null;
  if (token) {
    decoded = validateToken(token, requestData.userId);
  }

  try {
    result = await getSubPropertiesForPropertyId(propertyId, decoded);
    return res.status(200).json({ data: result });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: { message: error.message } });
  }
});

app.post("/create-property", async (req, res) => {
  const requestData = req.body;
  const token = req.headers.Authorization;
  try {
    // validateToken(token, requestData.userId);
    result = await createProperty(requestData);
    return res.status(200).json({ data: result });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: { message: error.message } });
  }
});

app.put("/edit-property", async (req, res) => {
  const requestData = req.body;
  const token = req.headers.Authorization;

  try {
    // const decoded = validateToken(token, requestData.userId);

    // if (decoded.role !== ROLE.ADMIN) {
    //   throw new Error(`Edit Property not supported for ${decoded.userId}`);
    // }

    result = await editProperty(requestData);
    return res.status(200).json({ data: result });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: { message: error.message } });
  }
});

app.patch("/change-property-status", async (req, res) => {
  const requestData = req.body;

  const token = req.headers.Authorization;
  const userId = requestData.userId;
  const propertyId = req.body.propertyId;
  const newStatus = req.body.newStatus;

  try {
    const decoded = validateToken(token, userId);
    result = await changePropertyStatus(propertyId, newStatus, decoded);
    return res.status(200).json({ data: result });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: { message: error.message } });
  }
});

app.patch("/change-property-checkin-checkout-time", async (req, res) => {
  const requestData = req.body;

  const token = req.headers.Authorization;
  const propertyId = req.body.propertyId;
  const newCheckInTime = req.body.newCheckInTime;
  const newCheckOutTime = req.body.newCheckOutTime;

  try {
    const decoded = validateToken(token, userId);
    const userId = decoded.userId;
    result = await changePropertyCheckinCheckoutTime(
      userId,
      propertyId,
      newCheckInTime,
      newCheckOutTime
    );
    return res.status(200).json({ data: result });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: { message: error.message } });
  }
});

app.post("/upload-property-image", async (req, res) => {
  const { image, userId } = req.body;
  const token = req.headers.Authorization;

  if (!image) {
    return res.status(400).json({ error: "No image data provided" });
  }

  try {
    validateToken(token, userId);
    const response = await axios.post(
      "https://api.imgur.com/3/image",
      {
        image: image.replace(/^data:image\/\w+;base64,/, ""),
        type: "base64",
      },
      {
        headers: {
          Authorization: `Client-ID ${IMGUR_CLIENT_ID}`,
        },
      }
    );

    const propertyImageUrl = response.data.data.link;
    result = await createPropertyImage(propertyImageUrl, 1);
    return res.status(200).json({ data: result });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: { message: error.message } });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
