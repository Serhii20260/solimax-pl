const { z } = require("zod");

const messageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(2000),
});

const consultantAskSchema = z
  .object({
    question: z.string().min(3).max(1000).optional(),
    message: z.string().min(1).max(1000).optional(),
    history: z.array(messageSchema).max(24).optional(),
    messages: z.array(messageSchema).max(24).optional(),
    language: z.enum(["pl", "uk", "ua", "de", "en"]).optional(),
    lang: z.enum(["pl", "uk", "ua", "de", "en"]).optional(),
    page: z.string().max(100).optional(),
    sessionId: z.string().max(100).optional(),
    context: z
      .object({
        page: z.enum(["dom", "biznes", "finansowanie"]).optional(),
        language: z.enum(["pl", "uk", "ua", "de", "en"]).optional(),
      })
      .optional(),
  })
  .refine((value) => {
    const hasText = Boolean(value.message || value.question);
    const hasHistory = Array.isArray(value.history) && value.history.length > 0;
    const hasMessages = Array.isArray(value.messages) && value.messages.length > 0;
    return hasText || hasHistory || hasMessages;
  }, {
    message: "Either message, question, history or messages is required",
  });

const consultantLeadSchema = z.object({
  // Required
  name: z.string().min(2).max(100),
  phone: z.string().min(5).max(30),
  email: z.string().email().max(200),
  consentRODO: z.boolean().refine(val => val === true, {
    message: "RODO consent is required"
  }),
  productType: z.enum(["pv", "heat_pump"]),
  
  // Optional general
  region: z.string().max(200).optional(),
  consumption: z.string().max(500).optional(),
  
  // Package selection (optional)
  packageId: z.string().max(100).optional(),
  packageName: z.string().max(200).optional(),
  
  // PV-specific optional
  pvPower: z.number().positive().max(1000).optional(),
  batteryCapacity: z.number().positive().max(500).optional(),
  
  // Heat pump specific optional
  houseArea: z.number().positive().max(2000).optional(),
  householdSize: z.number().int().positive().max(20).optional(),
  energyClass: z.string().max(50).optional(),
  heatingConsumption: z.string().max(500).optional(),
  
  // Auto fields
  source: z.enum(["contact", "calculator", "package"]),
  meta: z.string().max(10000).optional(), // JSON string
});

module.exports = { consultantAskSchema, consultantLeadSchema };
