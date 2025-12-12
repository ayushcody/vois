// In-memory mock database for allowed IDs (for hackathon/demo purposes)
const allowedIds = new Set([
    "123456789012",
    "987654321098",
    "111111111111"
]);

export const verifyId = async (idNumber: string, otp: string): Promise<boolean> => {
    // Simulate database delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Mock logic: 
    // 1. Check if ID pattern is valid (e.g., 12 digits)
    // 2. Check if ID is in our allowed list (optional, can skip for demo flexibility)
    // 3. Check if OTP is "123456" (hardcoded magic OTP)

    const isValidFormat = /^\d{12}$/.test(idNumber); // Assume 12-digit ID
    if (!isValidFormat) return false;

    // Strict allowed list check (can comment out for broader testing)
    // if (!allowedIds.has(idNumber)) return false;

    if (otp !== "123456") return false;

    return true;
};
