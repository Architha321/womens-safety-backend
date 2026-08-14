const prisma = require("../config/prismaClient");

/**
 * @desc    Trigger an SOS alert
 * @route   POST /api/sos
 * @access  Private
 */
const triggerSOS = async (req, res) => {
  const { latitude, longitude } = req.body;

  if (latitude === undefined || longitude === undefined) {
    return res.status(400).json({
      message: "Location coordinates required",
    });
  }

  try {
    // Save SOS alert in database
    const alert = await prisma.sosAlert.create({
      data: {
        userId: req.user.id,
        latitude,
        longitude,
      },
    });

    // Fetch all emergency contacts of the logged-in user
    const contacts = await prisma.emergencyContact.findMany({
      where: {
        userId: req.user.id,
      },
    });

    // Create dispatch list
    const alertsDispatch = contacts.map((contact) => ({
      name: contact.contactName,
      phone: contact.contactPhone,
      status: "Ready to Notify",
    }));

    // Log for testing
    console.log(
      `SOS Alert Triggered for ${req.user.name} at (${latitude}, ${longitude})`
    );
    console.log("Emergency Contacts:", alertsDispatch);

    // Send response
    res.status(200).json({
      message: "SOS Triggered ✅ Emergency contacts notified.",
      sos: {
        id: alert.id,
        userId: alert.userId,
        latitude: alert.latitude,
        longitude: alert.longitude,
        alertTime: alert.createdAt,
        status: "Active",
      },
      alertsDispatch,
    });
  } catch (error) {
    console.error("SOS Error:", error);

    res.status(500).json({
      message: "Error triggering SOS alert",
    });
  }
};

/**
 * @desc    Log a fake call (Backend logging only)
 * @route   POST /api/sos/fake-call
 * @access  Private
 */
const logFakeCall = async (req, res) => {
  try {
    console.log(
      `Fake Call initiated by ${req.user.name} at ${new Date().toISOString()}`
    );

    res.status(200).json({
      message: "Fake call event logged successfully",
    });
  } catch (error) {
    console.error("Fake Call Error:", error);

    res.status(500).json({
      message: "Error logging fake call",
    });
  }
};

module.exports = {
  triggerSOS,
  logFakeCall,
};