"use client";

import { useState, useEffect, forwardRef } from "react";
import {
  Link as LinkIcon,
  Wifi,
  User,
  Mail,
  Phone,
  FileText,
  Type,
  Building,
  Briefcase,
  Globe,
  MapPin,
  Eye,
  EyeOff,
  Lock,
} from "lucide-react";
import type { QRTypeValue } from "@/lib/qr";
import { addHttpsPrefix } from "@/lib/url-input";

const inputClass =
  "w-full rounded-xl border border-gray-300 bg-white py-3 pl-11 pr-4 text-sm shadow-sm transition-colors placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500";

const inputClassNoIcon =
  "w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm shadow-sm transition-colors placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500";

const selectClass =
  "w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white";

const textareaClass =
  "w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm shadow-sm transition-colors placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500 resize-none";

const labelClass =
  "mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300";

interface FieldProps {
  onChange: (content: string) => void;
}

const IconInput = forwardRef<
  HTMLInputElement,
  { icon: React.ComponentType<{ className?: string }> } & React.InputHTMLAttributes<HTMLInputElement>
>(({ icon: Icon, ...props }, ref) => (
  <div className="relative">
    <Icon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
    <input ref={ref} {...props} className={inputClass} />
  </div>
));
IconInput.displayName = "IconInput";

const VALID_DOMAIN = /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;

function getUrlWarning(val: string): "protocol" | "domain" | null {
  if (!val) return null;

  const hasProtocol = /^https?:\/\//i.test(val);

  // Extract hostname: strip protocol, then take part before /, ?, #, and remove port
  const hostname = val
    .replace(/^https?:\/\//i, "")
    .split(/[/?#]/)[0]
    .replace(/:\d+$/, "");

  if (!VALID_DOMAIN.test(hostname)) return "domain";
  if (!hasProtocol) return "protocol";
  return null;
}

function URLFields({ onChange }: FieldProps) {
  const [warning, setWarning] = useState<"protocol" | "domain" | null>(null);
  const [inputValue, setInputValue] = useState("");

  const prefixWithHttps = () => {
    const fixed = `https://${inputValue}`;
    setInputValue(fixed);
    onChange(fixed);
    setWarning(null);
  };

  return (
    <div>
      <label className={labelClass}>Website URL</label>
      <IconInput
        icon={LinkIcon}
        type="url"
        placeholder="https://example.com"
        value={inputValue}
        onChange={(e) => {
          const value = addHttpsPrefix(e.target.value);
          setInputValue(value);
          onChange(value);
          if (warning) setWarning(getUrlWarning(value.trim()));
        }}
        onBlur={(e) => setWarning(getUrlWarning(e.target.value.trim()))}
      />
      {warning === "protocol" ? (
        <p className="mt-1.5 text-xs text-amber-600 dark:text-amber-400">
          This web address must start with https://. Use{" "}
          <strong>https://{inputValue}</strong>.{" "}
          <button
            type="button"
            onClick={prefixWithHttps}
            className="font-semibold underline hover:text-amber-700 dark:hover:text-amber-300"
          >
            Use this address
          </button>
        </p>
      ) : warning === "domain" ? (
        <p className="mt-1.5 text-xs text-amber-600 dark:text-amber-400">
          Enter a complete web address, such as{" "}
          <strong>https://example.com</strong>.
        </p>
      ) : (
        <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
          Include https:// at the start.
        </p>
      )}
    </div>
  );
}

function WiFiFields({ onChange }: FieldProps) {
  const [ssid, setSsid] = useState("");
  const [password, setPassword] = useState("");
  const [encryption, setEncryption] = useState("WPA");
  const [hidden, setHidden] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!ssid) {
      onChange("");
      return;
    }
    onChange(JSON.stringify({ ssid, password, encryption, hidden }));
  }, [ssid, password, encryption, hidden, onChange]);

  return (
    <div className="space-y-4">
      <div>
        <label className={labelClass}>Wi-Fi Network Name</label>
        <IconInput
          icon={Wifi}
          type="text"
          placeholder="My Wi-Fi Network"
          value={ssid}
          onChange={(e) => setSsid(e.target.value)}
        />
      </div>
      <div>
        <label className={labelClass}>Password</label>
        <div className="relative">
          <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`${inputClass} pr-11`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Security Type</label>
          <select
            value={encryption}
            onChange={(e) => setEncryption(e.target.value)}
            className={selectClass}
          >
            <option value="WPA">WPA/WPA2</option>
            <option value="WEP">WEP</option>
            <option value="nopass">None</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Hidden Network</label>
          <button
            type="button"
            onClick={() => setHidden(!hidden)}
            className={`flex w-full items-center justify-center gap-2 rounded-xl border-2 px-4 py-2.5 text-sm font-medium transition-all ${
              hidden
                ? "border-primary bg-primary-50 text-primary dark:bg-primary/10"
                : "border-gray-200 text-gray-600 hover:border-gray-300 dark:border-gray-700 dark:text-gray-400"
            }`}
          >
            {hidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {hidden ? "Yes" : "No"}
          </button>
        </div>
      </div>
    </div>
  );
}

function VCardFields({ onChange }: FieldProps) {
  const [fields, setFields] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    org: "",
    title: "",
    url: "",
    address: "",
  });

  useEffect(() => {
    if (!fields.firstName && !fields.lastName) {
      onChange("");
      return;
    }
    onChange(JSON.stringify(fields));
  }, [fields, onChange]);

  const update = (key: keyof typeof fields, value: string) =>
    setFields((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>First Name</label>
          <IconInput
            icon={User}
            type="text"
            placeholder="John"
            value={fields.firstName}
            onChange={(e) => update("firstName", e.target.value)}
          />
        </div>
        <div>
          <label className={labelClass}>Last Name</label>
          <IconInput
            icon={User}
            type="text"
            placeholder="Doe"
            value={fields.lastName}
            onChange={(e) => update("lastName", e.target.value)}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Phone</label>
          <IconInput
            icon={Phone}
            type="tel"
            placeholder="+1 234 567 890"
            value={fields.phone}
            onChange={(e) => update("phone", e.target.value)}
          />
        </div>
        <div>
          <label className={labelClass}>Email</label>
          <IconInput
            icon={Mail}
            type="email"
            placeholder="john@example.com"
            value={fields.email}
            onChange={(e) => update("email", e.target.value)}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Company</label>
          <IconInput
            icon={Building}
            type="text"
            placeholder="Acme Inc."
            value={fields.org}
            onChange={(e) => update("org", e.target.value)}
          />
        </div>
        <div>
          <label className={labelClass}>Job Title</label>
          <IconInput
            icon={Briefcase}
            type="text"
            placeholder="Software Engineer"
            value={fields.title}
            onChange={(e) => update("title", e.target.value)}
          />
        </div>
      </div>
      <div>
        <label className={labelClass}>Website</label>
        <IconInput
          icon={Globe}
          type="url"
          placeholder="https://johndoe.com"
          value={fields.url}
          onChange={(e) => update("url", e.target.value)}
        />
      </div>
      <div>
        <label className={labelClass}>Address</label>
        <IconInput
          icon={MapPin}
          type="text"
          placeholder="123 Main St, City, Country"
          value={fields.address}
          onChange={(e) => update("address", e.target.value)}
        />
      </div>
    </div>
  );
}

function EmailFields({ onChange }: FieldProps) {
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  useEffect(() => {
    if (!email) {
      onChange("");
      return;
    }
    onChange(JSON.stringify({ email, subject, body }));
  }, [email, subject, body, onChange]);

  return (
    <div className="space-y-4">
      <div>
        <label className={labelClass}>Send Email To</label>
        <IconInput
          icon={Mail}
          type="email"
          placeholder="recipient@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div>
        <label className={labelClass}>Subject <span className="font-normal text-gray-400">(optional)</span></label>
        <input
          type="text"
          placeholder="Email subject line"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className={inputClassNoIcon}
        />
      </div>
      <div>
        <label className={labelClass}>Message <span className="font-normal text-gray-400">(optional)</span></label>
        <textarea
          placeholder="Write the email message..."
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={3}
          className={textareaClass}
        />
      </div>
    </div>
  );
}

function SMSFields({ onChange }: FieldProps) {
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!phone) {
      onChange("");
      return;
    }
    onChange(JSON.stringify({ phone, message }));
  }, [phone, message, onChange]);

  return (
    <div className="space-y-4">
      <div>
        <label className={labelClass}>Phone Number</label>
        <IconInput
          icon={Phone}
          type="tel"
          placeholder="+1 234 567 890"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
      </div>
      <div>
        <label className={labelClass}>Message <span className="font-normal text-gray-400">(optional)</span></label>
        <textarea
          placeholder="Write the text message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
          className={textareaClass}
        />
      </div>
    </div>
  );
}

function WhatsAppFields({ onChange }: FieldProps) {
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!phone) {
      onChange("");
      return;
    }
    onChange(JSON.stringify({ phone, message }));
  }, [phone, message, onChange]);

  return (
    <div className="space-y-4">
      <div>
        <label className={labelClass}>Phone Number</label>
        <IconInput
          icon={Phone}
          type="tel"
          placeholder="+1 234 567 890"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
          Include the country code, such as +1 for the US or +44 for the UK.
        </p>
      </div>
      <div>
        <label className={labelClass}>Message <span className="font-normal text-gray-400">(optional)</span></label>
        <textarea
          placeholder="Write the WhatsApp message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
          className={textareaClass}
        />
      </div>
    </div>
  );
}

function PDFFields({ onChange }: FieldProps) {
  return (
    <div>
      <label className={labelClass}>PDF Link</label>
      <IconInput
        icon={FileText}
        type="url"
        placeholder="https://example.com/document.pdf"
        onChange={(e) => onChange(e.target.value)}
      />
      <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
        Use a public link that opens the PDF without a sign-in.
      </p>
    </div>
  );
}

function PlainTextField({ onChange }: FieldProps) {
  return (
    <div>
      <label className={labelClass}>Text to Show</label>
      <div className="relative">
        <Type className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
        <textarea
          placeholder="Enter the text that people will see..."
          onChange={(e) => onChange(e.target.value)}
          rows={4}
          className={`${textareaClass} pl-11`}
        />
      </div>
    </div>
  );
}

interface QRTypeFieldsProps {
  type: QRTypeValue;
  onChange: (content: string) => void;
}

export function QRTypeFields({ type, onChange }: QRTypeFieldsProps) {
  switch (type) {
    case "URL":
      return <URLFields onChange={onChange} />;
    case "WIFI":
      return <WiFiFields onChange={onChange} />;
    case "VCARD":
      return <VCardFields onChange={onChange} />;
    case "EMAIL":
      return <EmailFields onChange={onChange} />;
    case "SMS":
      return <SMSFields onChange={onChange} />;
    case "WHATSAPP":
      return <WhatsAppFields onChange={onChange} />;
    case "PDF":
      return <PDFFields onChange={onChange} />;
    case "PLAIN_TEXT":
      return <PlainTextField onChange={onChange} />;
    default:
      return null;
  }
}
