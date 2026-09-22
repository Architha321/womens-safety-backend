const prisma = require("../prisma");
const { validationResult } = require("express-validator");

exports.triggerSOS = async (req, res) => {
  // Check validation errors
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array(),
    });
  }

  try {
    const { latitude, longitude } = req.body;
    const userId = req.userId;

    // Save SOS alert in database
    const sos = await prisma.sOSAlert.create({
      data: {
        userId,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        status: "Active",
      },
    });

    // Get emergency contacts for this user
    const contacts = await prisma.emergencyContact.findMany({
      where: { userId },
    });

    // Return contacts to the Android app.
    // The Android app will send the actual SMS using the phone SIM.
    const alertsDispatch = contacts.map((contact) => ({
      name: contact.contactName,
      phone: contact.contactPhone,
      status: "Ready to Notify",
    }));

    console.log("=== SOS ALERT ===");
    console.log(`Location: ${latitude}, ${longitude}`);
    console.log("Emergency Contacts:", alertsDispatch);
    console.log("SMS will be sent by the Android phone/SIM.");

    res.json({
      message: "SOS recorded. Emergency contacts ready for SMS.",
      sos,
      alertsDispatch,
    });

  } catch (error) {
    console.error("SOS Error:", error);

    res.status(500).json({
      error: "Failed to process SOS alert.",
    });
  }
};

exports.getSOSAlerts = async (req, res) => {
  try {
    const userId = req.userId;

    const data = await prisma.sOSAlert.findMany({
      where: { userId },
      orderBy: { alertTime: "desc" },
    });

    res.json(data);

  } catch (error) {
    console.error("Get SOS Alerts Error:", error);

    res.status(500).json({
      error: error.message,
    });
  }
};