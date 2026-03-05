const prisma = require("../db/prisma");
const nodemailer = require("nodemailer");

// Email transporter (configured via env vars)
let transporter = null;

const initEmailTransporter = () => {
  if (transporter) return transporter;
  
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env;
  
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    console.warn("[LeadService] SMTP not configured - email notifications disabled");
    return null;
  }
  
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: parseInt(SMTP_PORT || "587", 10),
    secure: parseInt(SMTP_PORT || "587", 10) === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
  
  return transporter;
};

/**
 * Save lead to database
 */
const saveLead = async (leadData) => {
  const lead = await prisma.lead.create({
    data: {
      // Required
      name: leadData.name,
      phone: leadData.phone,
      email: leadData.email,
      consentRODO: leadData.consentRODO,
      productType: leadData.productType,
      
      // Optional general
      region: leadData.region || null,
      consumption: leadData.consumption || null,
      
      // Package
      packageId: leadData.packageId || null,
      packageName: leadData.packageName || null,
      
      // PV-specific
      pvPower: leadData.pvPower || null,
      batteryCapacity: leadData.batteryCapacity || null,
      
      // Heat pump specific
      houseArea: leadData.houseArea || null,
      householdSize: leadData.householdSize || null,
      energyClass: leadData.energyClass || null,
      heatingConsumption: leadData.heatingConsumption || null,
      
      // Auto
      source: leadData.source,
      meta: leadData.meta ? JSON.stringify(leadData.meta) : null,
    },
  });
  
  return lead;
};

/**
 * Format lead for email notification
 */
const formatLeadForEmail = (lead) => {
  const productTypeLabels = {
    pv: "Fotowoltaika (PV)",
    heat_pump: "Pompa ciepła",
  };
  
  const sourceLabels = {
    contact: "Formularz kontaktowy",
    calculator: "Kalkulator",
    package: "Wybór pakietu",
  };
  
  let details = `
📋 NOWY LEAD - ${new Date().toLocaleString("pl-PL")}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

👤 Dane kontaktowe:
   Imię: ${lead.name}
   Telefon: ${lead.phone}
   Email: ${lead.email}

📦 Typ produktu: ${productTypeLabels[lead.productType] || lead.productType}
📍 Źródło: ${sourceLabels[lead.source] || lead.source}
`;

  if (lead.region) {
    details += `🌍 Region: ${lead.region}\n`;
  }
  
  if (lead.consumption) {
    details += `⚡ Zużycie: ${lead.consumption}\n`;
  }
  
  if (lead.packageId || lead.packageName) {
    details += `\n📦 Pakiet:\n`;
    if (lead.packageId) details += `   ID: ${lead.packageId}\n`;
    if (lead.packageName) details += `   Nazwa: ${lead.packageName}\n`;
  }
  
  if (lead.productType === "pv") {
    details += `\n☀️ Szczegóły PV:\n`;
    if (lead.pvPower) details += `   Moc: ${lead.pvPower} kW\n`;
    if (lead.batteryCapacity) details += `   Magazyn energii: ${lead.batteryCapacity} kWh\n`;
  }
  
  if (lead.productType === "heat_pump") {
    details += `\n🔥 Szczegóły pompy ciepła:\n`;
    if (lead.houseArea) details += `   Powierzchnia domu: ${lead.houseArea} m²\n`;
    if (lead.householdSize) details += `   Liczba osób: ${lead.householdSize}\n`;
    if (lead.energyClass) details += `   Klasa energetyczna: ${lead.energyClass}\n`;
    if (lead.heatingConsumption) details += `   Zużycie na ogrzewanie: ${lead.heatingConsumption}\n`;
  }
  
  if (lead.meta) {
    try {
      const meta = typeof lead.meta === "string" ? JSON.parse(lead.meta) : lead.meta;
      details += `\n📊 Dodatkowe dane (meta):\n${JSON.stringify(meta, null, 2)}\n`;
    } catch {
      details += `\n📊 Meta: ${lead.meta}\n`;
    }
  }
  
  details += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nID: ${lead.id}\nData: ${lead.createdAt}`;
  
  return details;
};

/**
 * Send email notification about new lead
 */
const sendLeadNotification = async (lead) => {
  const mailer = initEmailTransporter();
  if (!mailer) {
    console.log("[LeadService] Email notification skipped - SMTP not configured");
    return false;
  }
  
  const { SMTP_FROM, LEAD_NOTIFICATION_EMAIL } = process.env;
  const to = LEAD_NOTIFICATION_EMAIL || SMTP_FROM;
  
  if (!to) {
    console.warn("[LeadService] No recipient email configured");
    return false;
  }
  
  const productTypeSubject = lead.productType === "pv" ? "PV" : "Pompa ciepła";
  const subject = `🔔 Nowy lead: ${lead.name} - ${productTypeSubject}`;
  
  try {
    await mailer.sendMail({
      from: SMTP_FROM,
      to,
      subject,
      text: formatLeadForEmail(lead),
    });
    console.log(`[LeadService] Email notification sent for lead ${lead.id}`);
    return true;
  } catch (error) {
    console.error("[LeadService] Failed to send email notification:", error.message);
    return false;
  }
};

/**
 * Process new lead: save to DB + send notification
 */
const processLead = async (leadData) => {
  // 1. Save to database
  const lead = await saveLead(leadData);
  console.log(`[LeadService] Lead saved: ${lead.id}`);
  
  // 2. Send email notification (async, don't wait)
  sendLeadNotification(lead).catch((err) => {
    console.error("[LeadService] Email notification failed:", err.message);
  });
  
  return lead;
};

/**
 * Get all leads (for admin panel)
 */
const getLeads = async (options = {}) => {
  const { skip = 0, take = 50, productType, source, orderBy = "createdAt", order = "desc" } = options;
  
  const where = {};
  if (productType) where.productType = productType;
  if (source) where.source = source;
  
  const [leads, total] = await Promise.all([
    prisma.lead.findMany({
      where,
      skip,
      take,
      orderBy: { [orderBy]: order },
    }),
    prisma.lead.count({ where }),
  ]);
  
  return { leads, total, skip, take };
};

/**
 * Get single lead by ID
 */
const getLeadById = async (id) => {
  return prisma.lead.findUnique({ where: { id } });
};

module.exports = {
  processLead,
  saveLead,
  sendLeadNotification,
  getLeads,
  getLeadById,
};
