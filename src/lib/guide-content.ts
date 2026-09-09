export type GuideStep = {
  title: string;
  text: string;
};

export type GuideSection = {
  heading: string;
  paragraphs?: string[];
  steps?: GuideStep[];
  bullets?: string[];
  note?: string;
};

export type GuideFaq = {
  q: string;
  a: string;
};

export type GuideSource = {
  label: string;
  href: string;
};

export type GuideDefinition = {
  slug: string;
  title: string;
  h1: string;
  description: string;
  category: "Create" | "Scan" | "Wi-Fi" | "Choose";
  readMinutes: number;
  intro: string[];
  sections: GuideSection[];
  howToSteps?: string[];
  faqs: GuideFaq[];
  sources?: GuideSource[];
  primaryLink: { href: string; label: string; description: string };
  relatedSlugs: string[];
};

export const GUIDES_LAST_MODIFIED = new Date("2026-09-09");

export const GUIDE_PAGES: Record<string, GuideDefinition> = {
  "connect-to-wifi-with-qr-code-windows": {
    slug: "connect-to-wifi-with-qr-code-windows",
    title: "Connect to Wi-Fi with a QR Code on Windows",
    h1: "How to Connect to Wi-Fi with a QR Code on Windows",
    description:
      "Use the Windows Camera app to scan a Wi-Fi QR code, connect without typing the password, and make a compatible Wi-Fi code for guests.",
    category: "Wi-Fi",
    readMinutes: 6,
    intro: [
      "A Wi-Fi QR code stores the network name, security type, and password. A compatible device can read these details and offer to connect. You do not have to type the password.",
      "Microsoft documents this function for Windows devices that have a camera. The exact controls can differ with the Windows version, Camera app version, and camera hardware.",
    ],
    sections: [
      {
        heading: "Scan a Wi-Fi QR code with the Windows Camera app",
        steps: [
          {
            title: "Open Camera",
            text: "Open Start, type Camera, and select the Camera app. Permit camera access if Windows asks for it.",
          },
          {
            title: "Select barcode mode",
            text: "On the right side of the Camera app, select the barcode mode icon. This changes the app from photo mode to code scanning mode.",
          },
          {
            title: "Put the complete code in view",
            text: "Point the camera at the Wi-Fi QR code. Keep the code flat, in focus, and inside the camera frame.",
          },
          {
            title: "Open the detected network",
            text: "Select the link that appears in the Camera app. Windows opens the network details in Settings.",
          },
          {
            title: "Confirm the connection",
            text: "Check the network name. Then confirm that you want to add and connect to the network. You can also select automatic connection when the network is in range.",
          },
        ],
        note: "Read the network name before you connect. Only join a network that you know and trust.",
      },
      {
        heading: "Show a QR code for a saved Wi-Fi network",
        paragraphs: [
          "Windows can show the password for the current network and for saved networks. On supported Windows versions, the network details also include a QR code that another compatible device can scan.",
        ],
        steps: [
          {
            title: "Open network settings",
            text: "Open Settings, select Network & internet, and open the properties for the current Wi-Fi network.",
          },
          {
            title: "Show the network password",
            text: "Find Wi-Fi network password and select Show. For another saved network, open Manage known networks, select the network, and then select Show next to its password.",
          },
          {
            title: "Scan from the other device",
            text: "Use the other device to scan the QR code. Confirm the network name before you accept the connection.",
          },
        ],
      },
      {
        heading: "Make a Wi-Fi QR code with QR Anvil",
        paragraphs: [
          "Use this method when Windows does not show a shareable code, or when you want a code for a guest network. QR Anvil makes the Wi-Fi QR image in your browser.",
        ],
        steps: [
          {
            title: "Open the Wi-Fi QR code generator",
            text: "Sign in to QR Anvil and open the Wi-Fi QR Code page.",
          },
          {
            title: "Enter the network details",
            text: "Enter the network name exactly as it appears. Select the correct security type, enter the password, and mark the network as hidden only if it does not broadcast its name.",
          },
          {
            title: "Create and test the code",
            text: "Create the code and scan it with a device that is not connected to the network. Confirm that it joins the correct network.",
          },
          {
            title: "Download and place the code",
            text: "Download the QR code. Put it where approved guests can scan it, but where the public cannot easily copy it.",
          },
        ],
      },
      {
        heading: "If Windows does not show barcode mode",
        bullets: [
          "Check that Windows permits the Camera app to use the camera.",
          "Install available Windows and Camera app updates, then open Camera again.",
          "Try the other camera if the device has front and rear cameras.",
          "Use a phone to scan the code, or enter the network name and password manually.",
          "If the code scans but does not connect, check that its network name, security type, and password are current.",
        ],
        note: "Barcode mode can be unavailable on some devices. An app update cannot add support to incompatible camera hardware.",
      },
      {
        heading: "Protect the Wi-Fi password",
        paragraphs: [
          "A Wi-Fi QR code is a convenient form of the network credentials. It is not encryption. A person with a QR reader can extract the stored network name and password.",
          "Use a separate guest network when possible. Put the code in a controlled place. Replace the code after you change the password, because the old printed code keeps the old credentials.",
        ],
      },
    ],
    howToSteps: [
      "Open the Windows Camera app.",
      "Select barcode mode on the right side of the Camera app.",
      "Point the camera at the complete Wi-Fi QR code.",
      "Select the network link that appears.",
      "Confirm the network details in Settings and connect.",
    ],
    faqs: [
      {
        q: "Can Windows connect to Wi-Fi from a QR code?",
        a: "Yes. On a Windows device with supported camera hardware and Camera app barcode mode, scan the Wi-Fi QR code, select the detected link, and confirm the connection in Settings.",
      },
      {
        q: "Why is barcode mode missing in the Windows Camera app?",
        a: "The Camera app version or the device camera can affect which modes are available. Check camera permission and available updates. If the mode is still absent, use another device or enter the network details manually.",
      },
      {
        q: "Does a Wi-Fi QR code hide the password?",
        a: "No. The code stores the connection details in a machine-readable form. A person with a QR reader can read the password. Use a guest network and control access to the printed code.",
      },
    ],
    sources: [
      {
        label: "Microsoft Support: Connect to a Wi-Fi network in Windows",
        href: "https://support.microsoft.com/en-us/windows/2ec74b2e-d9ec-ade1-cc9b-bef1429cb678",
      },
      {
        label: "Microsoft Support: How to use the Windows Camera app",
        href: "https://support.microsoft.com/en-us/windows/hardware/camera/how-to-use-the-windows-camera-app",
      },
    ],
    primaryLink: {
      href: "/qr-types/wifi",
      label: "Create a Wi-Fi QR code",
      description: "Enter your network details and make a QR code for approved guests.",
    },
    relatedSlugs: [
      "how-to-scan-a-qr-code-on-windows",
      "how-to-create-a-qr-code",
      "direct-vs-tracked-qr-codes",
    ],
  },

  "how-to-create-a-qr-code": {
    slug: "how-to-create-a-qr-code",
    title: "How to Create a QR Code for Free",
    h1: "How to Create a QR Code",
    description:
      "Create a QR code for a link, Wi-Fi network, contact, message, PDF, or text. Learn how to choose a type, customize it, test it, and download it.",
    category: "Create",
    readMinutes: 5,
    intro: [
      "A good QR code starts with the correct content type. It must also have enough contrast, clear space around its edges, and a destination that works on a phone.",
      "QR Anvil can create a URL QR code without a sign-in. A sign-in is required for the other content types and for SVG or PDF downloads.",
    ],
    sections: [
      {
        heading: "Create your QR code",
        steps: [
          {
            title: "Select the content type",
            text: "Select URL, Wi-Fi, vCard, Email, SMS, WhatsApp, PDF, or Plain Text. Use URL for a normal web link.",
          },
          {
            title: "Enter the content",
            text: "Complete the required fields. Check spelling, phone numbers, network names, and links before you continue.",
          },
          {
            title: "Choose Direct or Tracked mode",
            text: "Use Direct mode when you want the final content in the code. Use Tracked mode for supported links when you need scan counts or an editable destination.",
          },
          {
            title: "Customize the design",
            text: "Select colors and shapes. Keep strong contrast between the dark code and its light background.",
          },
          {
            title: "Test and download",
            text: "Scan the preview with more than one device. Then download PNG, or sign in to download SVG or PDF.",
          },
        ],
      },
      {
        heading: "Select the correct QR code type",
        bullets: [
          "URL opens a website or online file.",
          "Wi-Fi gives a compatible device the network connection details.",
          "vCard gives a person contact details that they can save.",
          "Email, SMS, and WhatsApp prepare a message or chat.",
          "PDF opens a PDF file through its public web address.",
          "Plain Text shows a short note without a website.",
        ],
      },
      {
        heading: "Make the code easy to scan",
        paragraphs: [
          "Use a dark foreground on a light background. Do not put important graphics in the clear border around the code. A complex design, low contrast, or a small printed code can prevent a scan.",
          "Test the code at the same size and on the same material that people will use. Test it in normal light and from the expected scan distance. A successful preview scan does not always prove that a small printed copy will work.",
        ],
      },
      {
        heading: "Check the destination before you publish",
        bullets: [
          "Open every link on a phone and on a computer.",
          "Make sure the page does not require access that your audience does not have.",
          "Check that a PDF has a public HTTPS address. QR Anvil does not upload the PDF file.",
          "For Direct codes, create a new code when the saved content changes.",
          "For Tracked codes, sign in to the dashboard to change the destination URL.",
        ],
      },
    ],
    howToSteps: [
      "Select the QR code content type.",
      "Enter and check the content.",
      "Choose Direct or Tracked mode when the type supports both modes.",
      "Customize the code with high-contrast colors.",
      "Scan the preview, then download the code.",
    ],
    faqs: [
      {
        q: "Can I create a QR code for free?",
        a: "Yes. QR Anvil creates QR codes without a watermark. You can create a URL QR code and download PNG without a sign-in. Other content types and download formats require a sign-in.",
      },
      {
        q: "Can I change a QR code after I print it?",
        a: "You cannot change content stored in a Direct QR code. For a supported Tracked QR code, you can change the destination URL in the QR Anvil dashboard without changing the printed pattern.",
      },
      {
        q: "What color is best for a QR code?",
        a: "A dark foreground on a plain light background gives reliable contrast. Test every customized code before you publish it.",
      },
    ],
    primaryLink: {
      href: "/#generator",
      label: "Create a QR code",
      description: "Open the QR Anvil generator and create your code.",
    },
    relatedSlugs: [
      "direct-vs-tracked-qr-codes",
      "how-to-scan-a-qr-code",
      "connect-to-wifi-with-qr-code-windows",
    ],
  },

  "how-to-scan-a-qr-code": {
    slug: "how-to-scan-a-qr-code",
    title: "How to Scan a QR Code on Any Device",
    h1: "How to Scan a QR Code",
    description:
      "Scan a QR code with an iPhone, Android phone, or Windows computer. Learn the basic steps, safe scan checks, and fixes for common problems.",
    category: "Scan",
    readMinutes: 5,
    intro: [
      "Most current phones can scan a QR code with the built-in Camera app. Windows computers with a supported camera can use barcode mode in the Camera app.",
      "The device normally shows a link or action before it opens the content. Read this result before you select it.",
    ],
    sections: [
      {
        heading: "Basic scan steps",
        steps: [
          {
            title: "Open a scanner",
            text: "Open the built-in Camera app. On Windows, select barcode mode. On some Android phones, you can also use Scan QR code in Quick Settings.",
          },
          {
            title: "Point at the code",
            text: "Put the full square inside the camera frame. Keep the device steady and do not cover a corner of the code.",
          },
          {
            title: "Wait for the result",
            text: "You do not usually need to take a photo. Wait until the device shows a link, text, or action.",
          },
          {
            title: "Check before you open",
            text: "Read the domain name or action. Continue only if it is the result that you expect.",
          },
        ],
      },
      {
        heading: "Scan on iPhone or iPad",
        paragraphs: [
          "Open Camera in Photo mode and put the QR code in the frame. Select the link that appears. You can also open Code Scanner from Control Center. If that control is not present, add Scan Code in the Control Center controls.",
        ],
      },
      {
        heading: "Scan on Android",
        paragraphs: [
          "Open the device Camera app and point it at the code in the normal photo mode. Select the result that appears. Camera support differs by device. On supported devices, Scan QR code in Quick Settings or Google Lens is another option.",
        ],
      },
      {
        heading: "Scan on Windows",
        paragraphs: [
          "Open the Windows Camera app and select barcode mode on the right side. Point the camera at the code. Select the detected link or text at the bottom of the app.",
        ],
      },
      {
        heading: "Fix a QR code that does not scan",
        bullets: [
          "Clean the camera lens and use more light.",
          "Move closer, but keep all four corners of the code in the frame.",
          "Hold the camera parallel to the code to reduce distortion.",
          "Reduce glare on a screen or glossy print.",
          "Try the full-size original instead of a cropped or compressed copy.",
          "Use a different scanner to learn if the problem is the code or the device.",
        ],
      },
      {
        heading: "Scan links safely",
        paragraphs: [
          "A QR code can hide the destination from normal view. Before you open a result, check the domain name and look for spelling changes. Do not enter a password or payment detail if the page is unexpected.",
          "A QR code can also start a message, show text, add a contact, or offer a Wi-Fi connection. Read the action and cancel it if it does not match the place or purpose of the code.",
        ],
      },
    ],
    howToSteps: [
      "Open the built-in Camera app or QR scanner.",
      "Put the complete QR code inside the camera frame.",
      "Wait for the device to show the detected link or action.",
      "Check the result, then select it if you trust it.",
    ],
    faqs: [
      {
        q: "Do I need an app to scan a QR code?",
        a: "Usually no. Current iPhone and many Android camera apps scan QR codes. Supported Windows devices can scan them with barcode mode in the Camera app.",
      },
      {
        q: "Why does my camera not detect the QR code?",
        a: "Poor focus, low light, glare, a damaged code, or missing scanner support can cause this problem. Keep the complete code in view, improve the light, and try another built-in scanner option.",
      },
      {
        q: "Is it safe to scan a QR code?",
        a: "Scanning shows the stored result, but an unknown result can be unsafe. Check the link or action before you open it. Do not give sensitive details to an unexpected page.",
      },
    ],
    sources: [
      {
        label: "Apple Support: Scan a QR code with your iPhone camera",
        href: "https://support.apple.com/en-us/102680",
      },
      {
        label: "Google Pixel Help: Scan QR codes with your Pixel phone",
        href: "https://support.google.com/pixelphone/answer/16561572?hl=en",
      },
      {
        label: "Microsoft Support: How to use the Windows Camera app",
        href: "https://support.microsoft.com/en-us/windows/hardware/camera/how-to-use-the-windows-camera-app",
      },
    ],
    primaryLink: {
      href: "/qr-code-scanner",
      label: "Scan a QR code online",
      description: "Use your camera or upload an image to read a QR code.",
    },
    relatedSlugs: [
      "how-to-scan-a-qr-code-on-android",
      "how-to-scan-a-qr-code-on-windows",
      "how-to-create-a-qr-code",
    ],
  },

  "how-to-scan-a-qr-code-on-android": {
    slug: "how-to-scan-a-qr-code-on-android",
    title: "How to Scan a QR Code on Android",
    h1: "How to Scan a QR Code on Android",
    description:
      "Scan QR codes with the Android Camera app, Quick Settings, or Google Lens. Use clear steps and fix common camera scan problems.",
    category: "Scan",
    readMinutes: 4,
    intro: [
      "Many Android phones scan QR codes in the normal Camera photo mode. The names and positions of controls differ by phone maker and Android version.",
      "If the Camera app does not detect a code, a Quick Settings scanner or Google Lens can be available on the device.",
    ],
    sections: [
      {
        heading: "Scan with the Android Camera app",
        steps: [
          {
            title: "Open Camera",
            text: "Open the Camera app and use the normal photo mode. Do not use video or portrait mode.",
          },
          {
            title: "Put the code in view",
            text: "Point the rear camera at the code. Make sure the complete square is visible and in focus.",
          },
          {
            title: "Select the result",
            text: "Wait for a link or action to appear. Check it, then select it to open the content.",
          },
        ],
      },
      {
        heading: "Use Quick Settings",
        steps: [
          {
            title: "Open Quick Settings",
            text: "Swipe down from the top of the screen. You might need to swipe down a second time to see all controls.",
          },
          {
            title: "Select Scan QR code",
            text: "Find and select Scan QR code. If it is not visible, edit the Quick Settings controls and add it when the device provides this option.",
          },
          {
            title: "Point the scanner at the code",
            text: "Put the complete code in the scanner frame and select the detected result.",
          },
        ],
      },
      {
        heading: "Use Google Lens",
        paragraphs: [
          "On a device with Google Lens, open Lens from the Camera app, Google app, or its device shortcut. Point it at the QR code and select the result. The exact path depends on the phone maker and installed apps.",
        ],
      },
      {
        heading: "If Android does not scan the code",
        bullets: [
          "Check the Camera settings for a QR scan or camera suggestions option.",
          "Use normal Photo mode and the rear camera.",
          "Clean the lens and add light without putting glare on the code.",
          "Move closer until the code is large, but keep all four corners visible.",
          "Try Scan QR code in Quick Settings or Google Lens.",
          "Check the result before you open it.",
        ],
      },
    ],
    howToSteps: [
      "Open the Android Camera app in normal photo mode.",
      "Point the rear camera at the complete QR code.",
      "Wait for the detected link or action to appear.",
      "Check the result and select it.",
    ],
    faqs: [
      {
        q: "Can Android scan a QR code without an extra app?",
        a: "Many Android phones can scan a QR code with the built-in Camera app. Some devices also include a Scan QR code control in Quick Settings. Support differs by device.",
      },
      {
        q: "Where is the QR scanner on Android?",
        a: "First try the normal Camera photo mode. You can also look for Scan QR code in Quick Settings or use Google Lens if it is installed.",
      },
      {
        q: "Do I take a photo of the QR code?",
        a: "No. Keep the code in the camera frame and wait for the result to appear. Then select the result.",
      },
    ],
    sources: [
      {
        label: "Google Pixel Help: Scan QR codes with your Pixel phone",
        href: "https://support.google.com/pixelphone/answer/16561572?hl=en",
      },
      {
        label: "Camera from Google Help: Scan QR codes",
        href: "https://support.google.com/camerafromgoogle/answer/12033278?hl=en",
      },
    ],
    primaryLink: {
      href: "/qr-code-scanner",
      label: "Open the QR code scanner",
      description: "Use the browser scanner with your camera or an image.",
    },
    relatedSlugs: [
      "how-to-scan-a-qr-code",
      "how-to-scan-a-qr-code-on-windows",
      "connect-to-wifi-with-qr-code-windows",
    ],
  },

  "how-to-scan-a-qr-code-on-windows": {
    slug: "how-to-scan-a-qr-code-on-windows",
    title: "How to Scan a QR Code on Windows",
    h1: "How to Scan a QR Code on Windows",
    description:
      "Use barcode mode in the Windows Camera app to scan QR codes with a built-in or connected camera, and fix common scan problems.",
    category: "Scan",
    readMinutes: 4,
    intro: [
      "The Windows Camera app can scan QR codes and barcodes on devices with supported camera hardware. It shows a web link or text after it reads the code.",
      "You need a camera that can point at the code. If the QR code is on the same computer screen, show it on another device or use another trusted method that can read an image file.",
    ],
    sections: [
      {
        heading: "Scan with the Windows Camera app",
        steps: [
          {
            title: "Open Camera",
            text: "Open Start, type Camera, and select the Camera app. Give the app camera access if Windows asks for it.",
          },
          {
            title: "Select barcode mode",
            text: "Select the barcode mode icon on the right side of the Camera app.",
          },
          {
            title: "Point the camera at the code",
            text: "Put the full QR code in the frame and hold the camera steady until the app detects it.",
          },
          {
            title: "Check and select the result",
            text: "For a website code, the link appears at the bottom of the app. Check the domain before you select it. For a barcode, you can select the text to copy it.",
          },
        ],
      },
      {
        heading: "Scan a Wi-Fi QR code",
        paragraphs: [
          "Barcode mode can detect a Wi-Fi QR code. Select the detected network link, then confirm the network details in Windows Settings. Check the network name before you connect.",
        ],
      },
      {
        heading: "Fix common Windows scan problems",
        bullets: [
          "Open Settings, Privacy & security, Camera, and check camera access.",
          "Use the camera switch control if the current camera points in the wrong direction.",
          "Install available Windows and Camera app updates.",
          "Move the code into better light and reduce screen or paper glare.",
          "Keep the complete code in view and wait for the camera to focus.",
          "If barcode mode is not available, use a compatible phone or enter the information manually.",
        ],
        note: "Some camera hardware does not support every Camera app mode.",
      },
      {
        heading: "Check a QR link before you open it",
        paragraphs: [
          "The Camera app shows the detected link before you open it. Read the domain name and do not continue if it is different from the expected organization. Be careful with links that ask for a password, payment, or software download.",
        ],
      },
    ],
    howToSteps: [
      "Open the Windows Camera app.",
      "Select barcode mode on the right side.",
      "Point the camera at the complete QR code.",
      "Check and select the detected link or text.",
    ],
    faqs: [
      {
        q: "Can a Windows computer scan a QR code?",
        a: "Yes. A Windows device with supported camera hardware can use barcode mode in the Camera app to scan QR codes and barcodes.",
      },
      {
        q: "Where is barcode mode in Windows Camera?",
        a: "Open the Camera app and look for the barcode mode icon on the right side. If it is absent, check camera permission and available updates. The hardware might not support this mode.",
      },
      {
        q: "Can Windows scan a Wi-Fi QR code?",
        a: "Yes, on a supported device. Scan the code in Camera barcode mode, select the detected network link, and confirm the connection in Settings.",
      },
    ],
    sources: [
      {
        label: "Microsoft Support: How to use the Windows Camera app",
        href: "https://support.microsoft.com/en-us/windows/hardware/camera/how-to-use-the-windows-camera-app",
      },
      {
        label: "Microsoft Support: Connect to a Wi-Fi network in Windows",
        href: "https://support.microsoft.com/en-us/windows/2ec74b2e-d9ec-ade1-cc9b-bef1429cb678",
      },
    ],
    primaryLink: {
      href: "/qr-code-scanner",
      label: "Open the QR code scanner",
      description: "Scan with your camera or upload a QR code image.",
    },
    relatedSlugs: [
      "connect-to-wifi-with-qr-code-windows",
      "how-to-scan-a-qr-code",
      "how-to-scan-a-qr-code-on-android",
    ],
  },

  "direct-vs-tracked-qr-codes": {
    slug: "direct-vs-tracked-qr-codes",
    title: "Direct vs Tracked QR Codes: Which Should You Use?",
    h1: "Direct vs Tracked QR Codes",
    description:
      "Compare Direct and Tracked QR codes in QR Anvil. Learn how redirects, editable destinations, scan analytics, privacy, and long-term use differ.",
    category: "Choose",
    readMinutes: 6,
    intro: [
      "A Direct QR code stores the final content in the square pattern. A Tracked QR code stores a short QR Anvil link that redirects to the final destination.",
      "This difference controls whether you can change the destination and collect scan data. It also controls whether the code depends on the QR Anvil redirect service.",
    ],
    sections: [
      {
        heading: "What a Direct QR code does",
        paragraphs: [
          "A Direct code contains the URL, Wi-Fi details, contact card, message, or text that you entered. QR Anvil renders the image in your browser. Scanning does not go through a QR Anvil redirect.",
          "The stored content cannot change after you download or print the code. To correct the content, you must create and publish a new QR code.",
        ],
        bullets: [
          "Best for permanent information.",
          "No QR Anvil redirect is required after creation.",
          "No scan analytics are collected by QR Anvil.",
          "The destination or saved content is not editable.",
        ],
      },
      {
        heading: "What a Tracked QR code does",
        paragraphs: [
          "A Tracked code contains a short URL on the QR Anvil domain. When a person scans it, the QR Anvil server finds the current destination and sends the browser there.",
          "This redirect lets the owner change the destination URL without changing the printed code. It also permits scan analytics such as time, country, city when available, device, operating system, and browser.",
        ],
        bullets: [
          "Best for campaigns, menus, and links that can change.",
          "The QR Anvil redirect service must be available for the link to open.",
          "The owner can change the destination in the dashboard.",
          "QR Anvil records scan analytics for the redirect.",
        ],
      },
      {
        heading: "Choose Direct when",
        bullets: [
          "The content is final and is not likely to change.",
          "You do not need scan counts or device information.",
          "You want the scan to work without a QR Anvil redirect.",
          "You create Wi-Fi, vCard, email, SMS, or plain-text content that a phone reads directly.",
        ],
      },
      {
        heading: "Choose Tracked when",
        bullets: [
          "You need to change a supported destination after print.",
          "You need scan totals or scan trends for a campaign.",
          "You want one printed code to point to a new menu, form, or page later.",
          "You accept that each scan first contacts the QR Anvil redirect service.",
        ],
      },
      {
        heading: "Privacy and reliability differences",
        paragraphs: [
          "Direct code creation and rendering occur in the browser. After you distribute the code, QR Anvil is not part of its scan path. The app that scans the code and the final website can still process data under their own policies.",
          "A Tracked scan contacts QR Anvil before it opens the destination. QR Anvil stores analytics and a truncated IP address as described by the product. The redirect also needs network access and a working QR Anvil service.",
        ],
      },
      {
        heading: "Test both modes before print",
        paragraphs: [
          "Scan the final downloaded file, not only the live preview. For a Direct code, confirm every saved detail. For a Tracked code, confirm the redirect and then change the destination once in the dashboard to test the full workflow.",
        ],
      },
    ],
    faqs: [
      {
        q: "Is a Direct QR code the same as a static QR code?",
        a: "In QR Anvil, Direct means that the final content is stored in the code. This is commonly called a static QR code because the stored content cannot change.",
      },
      {
        q: "Can I track scans of a Direct QR code?",
        a: "QR Anvil does not track Direct code scans because they do not use its redirect service. The destination website can have its own analytics.",
      },
      {
        q: "Does a Tracked QR code change when I edit its destination?",
        a: "No. The printed code continues to store the same short URL. QR Anvil changes where that short URL redirects.",
      },
      {
        q: "Which QR code mode works without QR Anvil after download?",
        a: "A Direct QR code does not need QR Anvil after download. Content that opens an online page still needs the destination website and an internet connection.",
      },
    ],
    primaryLink: {
      href: "/#generator",
      label: "Create a Direct or Tracked code",
      description: "Open the generator and select the mode that fits your use case.",
    },
    relatedSlugs: [
      "how-to-create-a-qr-code",
      "how-to-scan-a-qr-code",
      "connect-to-wifi-with-qr-code-windows",
    ],
  },
};

export const GUIDE_SLUGS = Object.keys(GUIDE_PAGES);

export const GUIDE_PAGE_LIST = GUIDE_SLUGS.map((slug) => GUIDE_PAGES[slug]);
