import type { QRTypeValue } from "@/lib/qr";

/**
 * Editorial content for the /qr-types/[slug] landing pages.
 *
 * One source of truth so the pages, the sitemap, the hub page, and the
 * llms.txt files all describe the same things in the same words. Keep the
 * wording factual and self-contained: search engines and AI assistants quote
 * these sentences directly.
 */
export type QRTypeFaq = { q: string; a: string };

export type QRTypePage = {
  slug: string;
  qrType: QRTypeValue;
  /** Short label used in navigation and lists. */
  label: string;
  /** <title> without the site suffix. */
  title: string;
  h1: string;
  /** Meta description, under 160 characters. */
  description: string;
  /** Search phrases this page targets. */
  keywords: string[];
  /** One-sentence definition. Used as the lead sentence and in llms.txt. */
  definition: string;
  /** Longer explanation paragraph. */
  content: string;
  /** Concrete situations where this type is the right choice. */
  useCases: string[];
  /** Ordered steps to create this type of QR code on QR Anvil. */
  steps: string[];
  faqs: QRTypeFaq[];
};

export const QR_TYPE_PAGES: Record<string, QRTypePage> = {
  url: {
    slug: "url",
    qrType: "URL",
    label: "URL",
    title: "URL QR Code Generator — Turn a Link into a QR Code",
    h1: "URL QR Code Generator",
    description:
      "Turn a link into a free QR code. Add any website URL, customize the design, choose Direct or Tracked mode, and download the finished code.",
    keywords: [
      "URL QR code generator",
      "link to QR code",
      "URL to QR code",
      "QR code for website",
      "link QR code",
      "QR code for a link",
      "website QR code",
    ],
    definition:
      "A URL QR code is a QR code that opens a web address when it is scanned with a phone camera.",
    content:
      "Paste a complete web address to turn the link into a QR code. A Direct code stores the URL in the image and opens it without a QR Anvil redirect. A Tracked code uses a short redirect so you can see scan totals and change the destination after you print the code. Test the final code on a phone before you publish it.",
    useCases: [
      "Posters, flyers, and business cards that link to a website",
      "Product packaging that opens a product page or manual",
      "Social profiles, videos, and app store listings",
      "Google Forms, surveys, and event registration pages",
    ],
    steps: [
      "Paste the full web address, including https://, into the URL field.",
      "Pick Direct mode for the fastest scan, or Tracked mode for scan analytics and an editable destination.",
      "Adjust the colors and dot style, then download the QR code as PNG, SVG, or PDF.",
    ],
    faqs: [
      {
        q: "How do I turn a link into a QR code?",
        a: "Paste the complete URL into the generator, select Direct or Tracked mode, and download the code. Scan the downloaded code to make sure that it opens the correct link.",
      },
      {
        q: "Can I create a QR code for any public URL?",
        a: "Yes. You can use a valid public HTTP or HTTPS address for a website, social profile, video, form, file, or app listing. People still need the required permission to open a restricted page.",
      },
      {
        q: "What is the difference between Direct and Tracked URL QR codes?",
        a: "A Direct QR code encodes the URL itself, so scanning opens the link instantly with no redirect. A Tracked QR code encodes a short QR Anvil redirect link, which lets QR Anvil count scans, record location and device data, and lets you change the destination URL later without reprinting.",
      },
      {
        q: "Do URL QR codes expire?",
        a: "Direct URL QR codes never expire because the address is stored in the image itself. Tracked QR codes keep working as long as the code exists in your QR Anvil dashboard.",
      },
    ],
  },
  wifi: {
    slug: "wifi",
    qrType: "WIFI",
    label: "Wi-Fi",
    title: "Wi-Fi QR Code Generator — Share Network Access",
    h1: "Wi-Fi QR Code Generator",
    description:
      "Create a Wi-Fi QR code for guests. Add the network name, password, and security type so compatible devices can connect without manual entry.",
    keywords: [
      "Wi-Fi QR code generator",
      "WiFi QR code",
      "QR code for Wi-Fi password",
      "share Wi-Fi with QR code",
      "guest Wi-Fi QR code",
    ],
    definition:
      "A Wi-Fi QR code is a QR code that stores a network name, password, and security type so a phone can join the network by scanning it.",
    content:
      "A Wi-Fi QR code gives a compatible device the network name (SSID), password, security type, and hidden-network setting. It uses Direct mode because these details are in the QR image and do not need a redirect. Use a separate guest network when possible, and replace the printed code after you change the password. For computer steps, read How to Connect to Wi-Fi with a QR Code on Windows in the Guides section.",
    useCases: [
      "Table cards and menus in cafes and restaurants",
      "Guest rooms in hotels and short-term rentals",
      "Office reception desks and meeting rooms",
      "Home networks for visitors and family",
    ],
    steps: [
      "Enter the network name (SSID) exactly as it appears in your Wi-Fi settings.",
      "Enter the password, select the correct security type, and mark the network as hidden when required.",
      "Customize and download the code. Test it on a device that is not connected, then put it where approved guests can scan it.",
    ],
    faqs: [
      {
        q: "Is it safe to share my Wi-Fi password with a QR code?",
        a: "A QR code does not hide or encrypt the password. A person with a QR reader can extract it. Use a separate guest network, control access to the code, and change the password if the code is copied.",
      },
      {
        q: "Does a Wi-Fi QR code work on both iPhone and Android?",
        a: "Many current iPhone and Android devices can read Wi-Fi QR codes and offer to join the network. Support and the scan steps can differ by device, operating system, and camera app.",
      },
      {
        q: "Can I change the password after I print the Wi-Fi QR code?",
        a: "No. The password is part of the image, so a new password needs a new QR code. Print a new code whenever the network password changes.",
      },
    ],
  },
  vcard: {
    slug: "vcard",
    qrType: "VCARD",
    label: "vCard",
    title: "vCard QR Code Generator — Digital Business Card QR Code",
    h1: "vCard QR Code Generator",
    description:
      "Create a digital business card QR code with your contact details. People can scan it and save the supported fields to their phone contacts.",
    keywords: [
      "vCard QR code generator",
      "contact QR code",
      "business card QR code",
      "QR code for contact information",
      "digital business card QR code",
    ],
    definition:
      "A vCard QR code is a QR code that contains a contact card in the vCard format, so a phone can save the contact when it scans the code.",
    content:
      "A vCard QR code stores contact information in vCard 3.0 format. A phone can show the details as a contact card that the person can review and save. Add only the fields that you want to share, such as a name, phone number, email, company, job title, website, and address. Field display can differ between scanner and contacts apps.",
    useCases: [
      "Printed business cards and name badges",
      "Email signatures and presentation closing slides",
      "Storefront windows and reception desks",
      "Real estate signs and service vehicles",
    ],
    steps: [
      "Fill in the contact fields you want to share: name, phone, email, company, title, website, and address.",
      "Check each detail and remove private information that you do not want to publish.",
      "Customize and download the code, then test the saved contact on more than one phone before you print it.",
    ],
    faqs: [
      {
        q: "What information can I include in a vCard QR code?",
        a: "You can include a full name, phone number, email address, company name, job title, website URL, and postal address.",
      },
      {
        q: "Should I use Direct or Tracked mode for a vCard QR code?",
        a: "Use Direct mode. The contact details are stored in the QR code itself, so the phone can save them instantly without an internet connection.",
      },
      {
        q: "Does a vCard QR code work without an internet connection?",
        a: "The contact data is in the QR image, so a compatible scanner can read it without an internet connection. The phone controls how it displays and saves the fields.",
      },
    ],
  },
  email: {
    slug: "email",
    qrType: "EMAIL",
    label: "Email",
    title: "Email QR Code Generator — Pre-Compose Email Messages",
    h1: "Email QR Code Generator",
    description:
      "Create a QR code that opens an email app with the recipient, subject, and body pre-filled. Useful for feedback, support, and RSVP forms.",
    keywords: [
      "email QR code generator",
      "mailto QR code",
      "QR code for email address",
      "QR code to send email",
    ],
    definition:
      "An email QR code is a QR code that opens the phone's email app with the recipient address, subject, and message already filled in.",
    content:
      "Email QR codes use a mailto link to prepare an email with a recipient address and optional subject and message. A supported scanner opens the email app that the device assigns to mail links. The person must review and send the message. Behavior can differ by device and email app.",
    useCases: [
      "Customer feedback requests on receipts and packaging",
      "Support contact points on product manuals",
      "Event invitations that collect RSVPs by email",
      "Job postings and press kits with a ready-to-send inquiry",
    ],
    steps: [
      "Enter the recipient email address.",
      "Add an optional subject line and message body so the sender does not need to type anything.",
      "Download the QR code and place it where people are likely to contact you.",
    ],
    faqs: [
      {
        q: "Can I pre-fill the email subject and body?",
        a: "Yes. You can set the recipient address, subject, and message. The person who scans the code can review and change the email before they send it.",
      },
      {
        q: "Which email apps are supported?",
        a: "The code uses a standard mailto link. It can open the app that the device assigns to email links, but support and pre-filled fields can differ by app.",
      },
    ],
  },
  sms: {
    slug: "sms",
    qrType: "SMS",
    label: "SMS",
    title: "SMS QR Code Generator — Pre-Compose Text Messages",
    h1: "SMS QR Code Generator",
    description:
      "Create a QR code that opens a text message with a pre-filled phone number and message. Good for text-to-join campaigns and customer support.",
    keywords: [
      "SMS QR code generator",
      "text message QR code",
      "QR code to send SMS",
      "text to join QR code",
    ],
    definition:
      "An SMS QR code is a QR code that opens the phone's messaging app with a phone number and an optional message already filled in.",
    content:
      "SMS QR codes use an smsto link to prepare a text message with a phone number and optional message. They are useful for text-to-join campaigns, support, appointment confirmations, and replies. The person must review and send the message. Scanner and messaging app support can differ by device.",
    useCases: [
      "Text-to-join marketing lists on posters and packaging",
      "Support lines printed on invoices and delivery notes",
      "Appointment confirmations and reminders",
      "Contest entries and voting by text",
    ],
    steps: [
      "Enter the phone number in international format, for example +1 555 123 4567.",
      "Add an optional message, such as a keyword for a text-to-join campaign.",
      "Download the QR code and add it to your print or digital material.",
    ],
    faqs: [
      {
        q: "Can I pre-fill the text message content?",
        a: "Yes. You can set both the phone number and the message body. The person scanning only needs to tap send.",
      },
      {
        q: "Does an SMS QR code work internationally?",
        a: "Use the full international number with its country code. Delivery still depends on the sender's mobile plan, network, destination number, and local service rules.",
      },
    ],
  },
  whatsapp: {
    slug: "whatsapp",
    qrType: "WHATSAPP",
    label: "WhatsApp",
    title: "WhatsApp QR Code Generator — Create a Chat QR Code",
    h1: "WhatsApp QR Code Generator",
    description:
      "Create a QR code for your WhatsApp number. A scan opens a chat and can add a pre-filled message for support, orders, or bookings.",
    keywords: [
      "WhatsApp QR code generator",
      "QR code for WhatsApp number",
      "WhatsApp chat QR code",
      "click to chat QR code",
    ],
    definition:
      "A WhatsApp QR code is a QR code that opens a WhatsApp chat with a specific phone number, optionally with a pre-written message.",
    content:
      "A WhatsApp QR code stores a wa.me click-to-chat link for your phone number and an optional message. When a person scans it, WhatsApp can open the correct chat. The person can review the message before they send it. Use this code for customer questions, order requests, and appointment bookings with a regular or WhatsApp Business number.",
    useCases: [
      "Customer support contact on websites and packaging",
      "Order and reservation requests for restaurants and shops",
      "Lead capture on trade show banners",
      "Appointment booking for clinics, salons, and services",
    ],
    steps: [
      "Enter your WhatsApp phone number with the country code.",
      "Add an optional message so the customer only needs to tap send.",
      "Download the QR code, test it with another WhatsApp account, and then share it in print or online.",
    ],
    faqs: [
      {
        q: "Do I need a WhatsApp Business account?",
        a: "No. WhatsApp QR codes work with both regular WhatsApp and WhatsApp Business accounts.",
      },
      {
        q: "What phone number format should I use?",
        a: "Include your country code, for example +1 for the United States or +44 for the United Kingdom. Dashes and spaces are removed automatically.",
      },
      {
        q: "Does the QR code send the WhatsApp message automatically?",
        a: "No. It opens a chat with the optional message ready for review. The person who scans the code must select Send.",
      },
    ],
  },
  pdf: {
    slug: "pdf",
    qrType: "PDF",
    label: "PDF",
    title: "PDF QR Code Generator — Link to PDF Documents",
    h1: "PDF QR Code Generator",
    description:
      "Create a QR code for a PDF link. Use it for menus, brochures, manuals, or event files, and select Tracked mode if the destination can change.",
    keywords: [
      "PDF QR code generator",
      "QR code for PDF",
      "QR code menu PDF",
      "QR code for document",
    ],
    definition:
      "A PDF QR code is a QR code that opens a PDF document hosted online when it is scanned.",
    content:
      "QR Anvil does not upload or store the PDF file. First, host it at a stable public HTTPS address that opens without an account or access request. Then paste that address into the generator. A Direct code stores the PDF URL. A Tracked code lets you change its destination to a replacement PDF without reprinting the code and records QR Anvil scan totals.",
    useCases: [
      "Restaurant and cafe menus",
      "Product manuals and safety data sheets on packaging",
      "Event programs, schedules, and floor plans",
      "Brochures and price lists for real estate and retail",
    ],
    steps: [
      "Host the PDF at a stable public HTTPS address. Open the link in a private browser window to check that it does not ask for a sign-in.",
      "Paste the public link into the PDF field. Select Tracked mode if you want scan totals or need to change the destination later.",
      "Download and scan the final code on a phone. Confirm that the correct PDF opens before you print it.",
    ],
    faqs: [
      {
        q: "Where should I host my PDF file?",
        a: "Use your website or a file service that gives a stable public HTTPS link. Check the link in a private browser window. It must open for a person who does not have your account or file permission.",
      },
      {
        q: "Can I update the PDF without changing the QR code?",
        a: "Yes, if you use a Tracked QR code and keep that code in your dashboard. Change its destination to the public URL of the replacement PDF. The printed QR pattern stays the same.",
      },
      {
        q: "Does QR Anvil upload my PDF?",
        a: "No. QR Anvil creates a QR code for the public PDF URL that you enter. You must host the PDF and manage its access settings.",
      },
    ],
  },
  "plain-text": {
    slug: "plain-text",
    qrType: "PLAIN_TEXT",
    label: "Plain Text",
    title: "Plain Text QR Code Generator — Encode Any Text in a QR Code",
    h1: "Plain Text QR Code Generator",
    description:
      "Create a QR code that shows plain text when scanned. Works offline. Ideal for short messages, serial numbers, coupon codes, and notes.",
    keywords: [
      "text QR code generator",
      "plain text QR code",
      "QR code for text message",
      "offline QR code",
    ],
    definition:
      "A plain text QR code is a QR code that displays a piece of text when it is scanned, with no link and no internet connection required.",
    content:
      "A plain text QR code stores text instead of a web link. A compatible scanner can show the text without an internet connection. Use it for a short note, coupon code, serial number, asset tag, or instruction. Short text makes a less dense code that is usually easier to scan.",
    useCases: [
      "Serial numbers and asset tags for inventory",
      "Coupon and voucher codes",
      "Short instructions on equipment and machinery",
      "Scavenger hunts, classroom activities, and puzzles",
    ],
    steps: [
      "Type or paste the text you want to encode. Shorter text produces a simpler, easier-to-scan code.",
      "Pick the colors and dot style.",
      "Download the QR code. The text is stored in the image, so no account or server is involved.",
    ],
    faqs: [
      {
        q: "How much text can a plain text QR code hold?",
        a: "Capacity depends on the characters and error correction level. Long text makes a denser code that can be harder to scan. Use a URL when you need to share a long document.",
      },
      {
        q: "Does scanning a plain text QR code require an internet connection?",
        a: "No. The text is encoded in the QR code itself, so it can be read fully offline.",
      },
    ],
  },
};

export const QR_TYPE_SLUGS = Object.keys(QR_TYPE_PAGES);

export const QR_TYPE_PAGE_LIST = QR_TYPE_SLUGS.map((slug) => QR_TYPE_PAGES[slug]);
