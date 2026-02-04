import React, { useEffect, useMemo, useState, useRef } from "react";

// --- Types ---
type LangKey = 
  | "English" | "Nepali" | "Hindi" | "Arabic" | "Spanish" | "French" | "German" | "Chinese" 
  | "Portuguese" | "Italian" | "Russian" | "Japanese" | "Korean" | "Turkish" | "Vietnamese" 
  | "Thai" | "Indonesian" | "Dutch";

type AuthMode = "LOGIN" | "REGISTER" | "FORGOT_PASSWORD"; 
type ForgotStep = "METHOD_SELECT" | "VERIFY_USER" | "PIN" | "RESET";
type LoginMethod = "EMAIL" | "PHONE";

type UserData = {
  firstName?: string;
  lastName?: string;
  email: string;
  phone: string; // Format: +CodeNumber
  password: string;
  pin: string;
};

type ScheduleRow = {
  month: number;
  date: string;
  beginningBalanceRounded: number;
  interestRounded: number;
  principalPaidRounded: number;
  scheduledEmiRounded: number;
  requiredFinalRounded: number;
  actualPaidRounded: number | "";
  actualPaidRaw: number;
  status: string;
};

type SavedFile = {
  id: string;
  name: string;
  timestamp: number;
  deletedAt?: number;
  data: {
    bankName: string;
    principal: number | string;
    annualRate: number | string;
    months: number | string;
    startDate: string;
    actualPayments: Record<number, string | number>;
    statuses: Record<number, string>;
  };
};

type Country = {
  name: string;
  dial_code: string;
  code: string;
};

type LanguageDef = {
  code: LangKey;
  name: string;
  native: string;
};

// --- Constants ---

const AD_MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const LANGUAGES_LIST: LanguageDef[] = [
  { code: "English", name: "English", native: "English" },
  { code: "Nepali", name: "Nepali", native: "नेपाली" },
  { code: "Hindi", name: "Hindi", native: "हिन्दी" },
  { code: "Arabic", name: "Arabic", native: "العربية" },
  { code: "Spanish", name: "Spanish", native: "Español" },
  { code: "French", name: "French", native: "Français" },
  { code: "German", name: "German", native: "Deutsch" },
  { code: "Chinese", name: "Chinese", native: "中文" },
  { code: "Portuguese", name: "Portuguese", native: "Português" },
  { code: "Italian", name: "Italian", native: "Italiano" },
  { code: "Russian", name: "Russian", native: "Русский" },
  { code: "Japanese", name: "Japanese", native: "日本語" },
  { code: "Korean", name: "Korean", native: "한국어" },
  { code: "Turkish", name: "Turkish", native: "Türkçe" },
  { code: "Vietnamese", name: "Vietnamese", native: "Tiếng Việt" },
  { code: "Thai", name: "Thai", native: "ไทย" },
  { code: "Indonesian", name: "Indonesian", native: "Bahasa Indonesia" },
  { code: "Dutch", name: "Dutch", native: "Nederlands" },
];

const ALL_COUNTRIES: Country[] = [
  { name: "Afghanistan", dial_code: "+93", code: "AF" },
  { name: "Albania", dial_code: "+355", code: "AL" },
  { name: "Algeria", dial_code: "+213", code: "DZ" },
  { name: "AmericanSamoa", dial_code: "+1684", code: "AS" },
  { name: "Andorra", dial_code: "+376", code: "AD" },
  { name: "Angola", dial_code: "+244", code: "AO" },
  { name: "Anguilla", dial_code: "+1264", code: "AI" },
  { name: "Antarctica", dial_code: "+672", code: "AQ" },
  { name: "Antigua and Barbuda", dial_code: "+1268", code: "AG" },
  { name: "Argentina", dial_code: "+54", code: "AR" },
  { name: "Armenia", dial_code: "+374", code: "AM" },
  { name: "Aruba", dial_code: "+297", code: "AW" },
  { name: "Australia", dial_code: "+61", code: "AU" },
  { name: "Austria", dial_code: "+43", code: "AT" },
  { name: "Azerbaijan", dial_code: "+994", code: "AZ" },
  { name: "Bahamas", dial_code: "+1242", code: "BS" },
  { name: "Bahrain", dial_code: "+973", code: "BH" },
  { name: "Bangladesh", dial_code: "+880", code: "BD" },
  { name: "Barbados", dial_code: "+1246", code: "BB" },
  { name: "Belarus", dial_code: "+375", code: "BY" },
  { name: "Belgium", dial_code: "+32", code: "BE" },
  { name: "Belize", dial_code: "+501", code: "BZ" },
  { name: "Benin", dial_code: "+229", code: "BJ" },
  { name: "Bermuda", dial_code: "+1441", code: "BM" },
  { name: "Bhutan", dial_code: "+975", code: "BT" },
  { name: "Bolivia, Plurinational State of", dial_code: "+591", code: "BO" },
  { name: "Bosnia and Herzegovina", dial_code: "+387", code: "BA" },
  { name: "Botswana", dial_code: "+267", code: "BW" },
  { name: "Brazil", dial_code: "+55", code: "BR" },
  { name: "British Indian Ocean Territory", dial_code: "+246", code: "IO" },
  { name: "Brunei Darussalam", dial_code: "+673", code: "BN" },
  { name: "Bulgaria", dial_code: "+359", code: "BG" },
  { name: "Burkina Faso", dial_code: "+226", code: "BF" },
  { name: "Burundi", dial_code: "+257", code: "BI" },
  { name: "Cambodia", dial_code: "+855", code: "KH" },
  { name: "Cameroon", dial_code: "+237", code: "CM" },
  { name: "Canada", dial_code: "+1", code: "CA" },
  { name: "Cape Verde", dial_code: "+238", code: "CV" },
  { name: "Cayman Islands", dial_code: "+1345", code: "KY" },
  { name: "Central African Republic", dial_code: "+236", code: "CF" },
  { name: "Chad", dial_code: "+235", code: "TD" },
  { name: "Chile", dial_code: "+56", code: "CL" },
  { name: "China", dial_code: "+86", code: "CN" },
  { name: "Christmas Island", dial_code: "+61", code: "CX" },
  { name: "Cocos (Keeling) Islands", dial_code: "+61", code: "CC" },
  { name: "Colombia", dial_code: "+57", code: "CO" },
  { name: "Comoros", dial_code: "+269", code: "KM" },
  { name: "Congo", dial_code: "+242", code: "CG" },
  { name: "Congo, The Democratic Republic of the", dial_code: "+243", code: "CD" },
  { name: "Cook Islands", dial_code: "+682", code: "CK" },
  { name: "Costa Rica", dial_code: "+506", code: "CR" },
  { name: "Croatia", dial_code: "+385", code: "HR" },
  { name: "Cuba", dial_code: "+53", code: "CU" },
  { name: "Cyprus", dial_code: "+357", code: "CY" },
  { name: "Czech Republic", dial_code: "+420", code: "CZ" },
  { name: "Denmark", dial_code: "+45", code: "DK" },
  { name: "Djibouti", dial_code: "+253", code: "DJ" },
  { name: "Dominica", dial_code: "+1767", code: "DM" },
  { name: "Dominican Republic", dial_code: "+1849", code: "DO" },
  { name: "Ecuador", dial_code: "+593", code: "EC" },
  { name: "Egypt", dial_code: "+20", code: "EG" },
  { name: "El Salvador", dial_code: "+503", code: "SV" },
  { name: "Equatorial Guinea", dial_code: "+240", code: "GQ" },
  { name: "Eritrea", dial_code: "+291", code: "ER" },
  { name: "Estonia", dial_code: "+372", code: "EE" },
  { name: "Ethiopia", dial_code: "+251", code: "ET" },
  { name: "Falkland Islands (Malvinas)", dial_code: "+500", code: "FK" },
  { name: "Faroe Islands", dial_code: "+298", code: "FO" },
  { name: "Fiji", dial_code: "+679", code: "FJ" },
  { name: "Finland", dial_code: "+358", code: "FI" },
  { name: "France", dial_code: "+33", code: "FR" },
  { name: "French Guiana", dial_code: "+594", code: "GF" },
  { name: "French Polynesia", dial_code: "+689", code: "PF" },
  { name: "Gabon", dial_code: "+241", code: "GA" },
  { name: "Gambia", dial_code: "+220", code: "GM" },
  { name: "Georgia", dial_code: "+995", code: "GE" },
  { name: "Germany", dial_code: "+49", code: "DE" },
  { name: "Ghana", dial_code: "+233", code: "GH" },
  { name: "Gibraltar", dial_code: "+350", code: "GI" },
  { name: "Greece", dial_code: "+30", code: "GR" },
  { name: "Greenland", dial_code: "+299", code: "GL" },
  { name: "Grenada", dial_code: "+1473", code: "GD" },
  { name: "Guadeloupe", dial_code: "+590", code: "GP" },
  { name: "Guam", dial_code: "+1671", code: "GU" },
  { name: "Guatemala", dial_code: "+502", code: "GT" },
  { name: "Guernsey", dial_code: "+44", code: "GG" },
  { name: "Guinea", dial_code: "+224", code: "GN" },
  { name: "Guinea-Bissau", dial_code: "+245", code: "GW" },
  { name: "Guyana", dial_code: "+592", code: "GY" },
  { name: "Haiti", dial_code: "+509", code: "HT" },
  { name: "Holy See (Vatican City State)", dial_code: "+379", code: "VA" },
  { name: "Honduras", dial_code: "+504", code: "HN" },
  { name: "Hong Kong", dial_code: "+852", code: "HK" },
  { name: "Hungary", dial_code: "+36", code: "HU" },
  { name: "Iceland", dial_code: "+354", code: "IS" },
  { name: "India", dial_code: "+91", code: "IN" },
  { name: "Indonesia", dial_code: "+62", code: "ID" },
  { name: "Iran, Islamic Republic of", dial_code: "+98", code: "IR" },
  { name: "Iraq", dial_code: "+964", code: "IQ" },
  { name: "Ireland", dial_code: "+353", code: "IE" },
  { name: "Isle of Man", dial_code: "+44", code: "IM" },
  { name: "Israel", dial_code: "+972", code: "IL" },
  { name: "Italy", dial_code: "+39", code: "IT" },
  { name: "Jamaica", dial_code: "+1876", code: "JM" },
  { name: "Japan", dial_code: "+81", code: "JP" },
  { name: "Jersey", dial_code: "+44", code: "JE" },
  { name: "Jordan", dial_code: "+962", code: "JO" },
  { name: "Kazakhstan", dial_code: "+77", code: "KZ" },
  { name: "Kenya", dial_code: "+254", code: "KE" },
  { name: "Kiribati", dial_code: "+686", code: "KI" },
  { name: "Korea, Democratic People's Republic of", dial_code: "+850", code: "KP" },
  { name: "Korea, Republic of", dial_code: "+82", code: "KR" },
  { name: "Kuwait", dial_code: "+965", code: "KW" },
  { name: "Kyrgyzstan", dial_code: "+996", code: "KG" },
  { name: "Lao People's Democratic Republic", dial_code: "+856", code: "LA" },
  { name: "Latvia", dial_code: "+371", code: "LV" },
  { name: "Lebanon", dial_code: "+961", code: "LB" },
  { name: "Lesotho", dial_code: "+266", code: "LS" },
  { name: "Liberia", dial_code: "+231", code: "LR" },
  { name: "Libyan Arab Jamahiriya", dial_code: "+218", code: "LY" },
  { name: "Liechtenstein", dial_code: "+423", code: "LI" },
  { name: "Lithuania", dial_code: "+370", code: "LT" },
  { name: "Luxembourg", dial_code: "+352", code: "LU" },
  { name: "Macao", dial_code: "+853", code: "MO" },
  { name: "Macedonia, The Former Yugoslav Republic of", dial_code: "+389", code: "MK" },
  { name: "Madagascar", dial_code: "+261", code: "MG" },
  { name: "Malawi", dial_code: "+265", code: "MW" },
  { name: "Malaysia", dial_code: "+60", code: "MY" },
  { name: "Maldives", dial_code: "+960", code: "MV" },
  { name: "Mali", dial_code: "+223", code: "ML" },
  { name: "Malta", dial_code: "+356", code: "MT" },
  { name: "Marshall Islands", dial_code: "+692", code: "MH" },
  { name: "Martinique", dial_code: "+596", code: "MQ" },
  { name: "Mauritania", dial_code: "+222", code: "MR" },
  { name: "Mauritius", dial_code: "+230", code: "MU" },
  { name: "Mayotte", dial_code: "+262", code: "YT" },
  { name: "Mexico", dial_code: "+52", code: "MX" },
  { name: "Micronesia, Federated States of", dial_code: "+691", code: "FM" },
  { name: "Moldova, Republic of", dial_code: "+373", code: "MD" },
  { name: "Monaco", dial_code: "+377", code: "MC" },
  { name: "Mongolia", dial_code: "+976", code: "MN" },
  { name: "Montenegro", dial_code: "+382", code: "ME" },
  { name: "Montserrat", dial_code: "+1664", code: "MS" },
  { name: "Morocco", dial_code: "+212", code: "MA" },
  { name: "Mozambique", dial_code: "+258", code: "MZ" },
  { name: "Myanmar", dial_code: "+95", code: "MM" },
  { name: "Namibia", dial_code: "+264", code: "NA" },
  { name: "Nauru", dial_code: "+674", code: "NR" },
  { name: "Nepal", dial_code: "+977", code: "NP" },
  { name: "Netherlands", dial_code: "+31", code: "NL" },
  { name: "New Caledonia", dial_code: "+687", code: "NC" },
  { name: "New Zealand", dial_code: "+64", code: "NZ" },
  { name: "Nicaragua", dial_code: "+505", code: "NI" },
  { name: "Niger", dial_code: "+227", code: "NE" },
  { name: "Nigeria", dial_code: "+234", code: "NG" },
  { name: "Niue", dial_code: "+683", code: "NU" },
  { name: "Norfolk Island", dial_code: "+672", code: "NF" },
  { name: "Northern Mariana Islands", dial_code: "+1670", code: "MP" },
  { name: "Norway", dial_code: "+47", code: "NO" },
  { name: "Oman", dial_code: "+968", code: "OM" },
  { name: "Pakistan", dial_code: "+92", code: "PK" },
  { name: "Palau", dial_code: "+680", code: "PW" },
  { name: "Palestinian Territory, Occupied", dial_code: "+970", code: "PS" },
  { name: "Panama", dial_code: "+507", code: "PA" },
  { name: "Papua New Guinea", dial_code: "+675", code: "PG" },
  { name: "Paraguay", dial_code: "+595", code: "PY" },
  { name: "Peru", dial_code: "+51", code: "PE" },
  { name: "Philippines", dial_code: "+63", code: "PH" },
  { name: "Pitcairn", dial_code: "+872", code: "PN" },
  { name: "Poland", dial_code: "+48", code: "PL" },
  { name: "Portugal", dial_code: "+351", code: "PT" },
  { name: "Puerto Rico", dial_code: "+1939", code: "PR" },
  { name: "Qatar", dial_code: "+974", code: "QA" },
  { name: "Romania", dial_code: "+40", code: "RO" },
  { name: "Russia", dial_code: "+7", code: "RU" },
  { name: "Rwanda", dial_code: "+250", code: "RW" },
  { name: "Reunion", dial_code: "+262", code: "RE" },
  { name: "Saint Barthelemy", dial_code: "+590", code: "BL" },
  { name: "Saint Helena, Ascension and Tristan Da Cunha", dial_code: "+290", code: "SH" },
  { name: "Saint Kitts and Nevis", dial_code: "+1869", code: "KN" },
  { name: "Saint Lucia", dial_code: "+1758", code: "LC" },
  { name: "Saint Martin", dial_code: "+590", code: "MF" },
  { name: "Saint Pierre and Miquelon", dial_code: "+508", code: "PM" },
  { name: "Saint Vincent and the Grenadines", dial_code: "+1784", code: "VC" },
  { name: "Samoa", dial_code: "+685", code: "WS" },
  { name: "San Marino", dial_code: "+378", code: "SM" },
  { name: "Sao Tome and Principe", dial_code: "+239", code: "ST" },
  { name: "Saudi Arabia", dial_code: "+966", code: "SA" },
  { name: "Senegal", dial_code: "+221", code: "SN" },
  { name: "Serbia", dial_code: "+381", code: "RS" },
  { name: "Seychelles", dial_code: "+248", code: "SC" },
  { name: "Sierra Leone", dial_code: "+232", code: "SL" },
  { name: "Singapore", dial_code: "+65", code: "SG" },
  { name: "Slovakia", dial_code: "+421", code: "SK" },
  { name: "Slovenia", dial_code: "+386", code: "SI" },
  { name: "Solomon Islands", dial_code: "+677", code: "SB" },
  { name: "Somalia", dial_code: "+252", code: "SO" },
  { name: "South Africa", dial_code: "+27", code: "ZA" },
  { name: "South Sudan", dial_code: "+211", code: "SS" },
  { name: "Spain", dial_code: "+34", code: "ES" },
  { name: "Sri Lanka", dial_code: "+94", code: "LK" },
  { name: "Sudan", dial_code: "+249", code: "SD" },
  { name: "Suriname", dial_code: "+597", code: "SR" },
  { name: "Svalbard and Jan Mayen", dial_code: "+47", code: "SJ" },
  { name: "Swaziland", dial_code: "+268", code: "SZ" },
  { name: "Sweden", dial_code: "+46", code: "SE" },
  { name: "Switzerland", dial_code: "+41", code: "CH" },
  { name: "Syrian Arab Republic", dial_code: "+963", code: "SY" },
  { name: "Taiwan", dial_code: "+886", code: "TW" },
  { name: "Tajikistan", dial_code: "+992", code: "TJ" },
  { name: "Tanzania, United Republic of", dial_code: "+255", code: "TZ" },
  { name: "Thailand", dial_code: "+66", code: "TH" },
  { name: "Timor-Leste", dial_code: "+670", code: "TL" },
  { name: "Togo", dial_code: "+228", code: "TG" },
  { name: "Tokelau", dial_code: "+690", code: "TK" },
  { name: "Tonga", dial_code: "+676", code: "TO" },
  { name: "Trinidad and Tobago", dial_code: "+1868", code: "TT" },
  { name: "Tunisia", dial_code: "+216", code: "TN" },
  { name: "Turkey", dial_code: "+90", code: "TR" },
  { name: "Turkmenistan", dial_code: "+993", code: "TM" },
  { name: "Turks and Caicos Islands", dial_code: "+1649", code: "TC" },
  { name: "Tuvalu", dial_code: "+688", code: "TV" },
  { name: "Uganda", dial_code: "+256", code: "UG" },
  { name: "Ukraine", dial_code: "+380", code: "UA" },
  { name: "United Arab Emirates", dial_code: "+971", code: "AE" },
  { name: "United Kingdom", dial_code: "+44", code: "GB" },
  { name: "United States", dial_code: "+1", code: "US" },
  { name: "Uruguay", dial_code: "+598", code: "UY" },
  { name: "Uzbekistan", dial_code: "+998", code: "UZ" },
  { name: "Vanuatu", dial_code: "+678", code: "VU" },
  { name: "Venezuela, Bolivarian Republic of", dial_code: "+58", code: "VE" },
  { name: "Viet Nam", dial_code: "+84", code: "VN" },
  { name: "Virgin Islands, British", dial_code: "+1284", code: "VG" },
  { name: "Virgin Islands, U.S.", dial_code: "+1340", code: "VI" },
  { name: "Wallis and Futuna", dial_code: "+681", code: "WF" },
  { name: "Yemen", dial_code: "+967", code: "YE" },
  { name: "Zambia", dial_code: "+260", code: "ZM" },
  { name: "Zimbabwe", dial_code: "+263", code: "ZW" }
];

// --- Helper Functions ---
const loadScript = (src: string | string[]): Promise<void> => {
  return new Promise((resolve, reject) => {
    const urls = Array.isArray(src) ? src : [src];
    
    const tryLoad = (index: number) => {
        if(index >= urls.length) {
            resolve(); 
            return;
        }
        
        const url = urls[index];
        if (document.querySelector(`script[src="${url}"]`)) {
            resolve();
            return;
        }

        const script = document.createElement("script");
        script.src = url;
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => {
             tryLoad(index + 1);
        };
        document.body.appendChild(script);
    };

    tryLoad(0);
  });
};

const getStorage = <T,>(key: string, defaultValue: T): T => {
    try {
        const value = localStorage.getItem(key);
        return value ? JSON.parse(value) : defaultValue;
    } catch {
        return defaultValue;
    }
};

// --- Components ---

// Icons
const EyeSvg = ({ open }: { open: boolean }) => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d={open?"M12 5c5 0 9 4 9 7s-4 7-9 7-9-4-9-7 4-7 9-7z":"M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"} stroke="#6B7280" strokeWidth="1.2" fill="none"/><circle cx="12" cy="12" r="3" stroke="#6B7280" strokeWidth="1.2" /></svg>);
const SettingsIcon = () => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09a1.65 1.65 0 0 0 1.51-1c.31-.6.68-1.12 1.05-1.57a1.6 1.6 0 0 0-.3-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H12V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1.51 1h.09a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82 1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09z"></path></svg>);
const FileIcon = () => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>);
const ChevronDown = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg>);
const SearchIcon = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>);
const CalendarIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>);
const UserIcon = () => (<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 bg-gray-100 rounded-full p-2 dark:bg-gray-700 dark:text-gray-300"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>);
const ChevronLeft = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>);
const ChevronRight = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>);

const PasswordInput = ({ value, onChange, placeholder, required, maxLength, className }: any) => {
  const [show, setShow] = useState(false);
  return (
    <div className="relative w-full">
      <input 
        type={show ? "text" : "password"}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        maxLength={maxLength}
        className={`w-full ${className || ""} pr-10`}
      />
      <button 
        type="button" 
        onClick={() => setShow(!show)}
        onMouseDown={(e) => e.preventDefault()}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400"
        tabIndex={-1}
      >
        <EyeSvg open={show} />
      </button>
    </div>
  );
};

// Country Selector Component
const CountrySelector = ({ selectedCode, onChange, placeholder }: { selectedCode: string, onChange: (code: string) => void, placeholder: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredCountries = ALL_COUNTRIES.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.dial_code.includes(search) || 
    c.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 p-3 rounded-lg border border-gray-300 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white min-w-[80px] justify-between focus:ring-2 focus:ring-blue-500 text-black"
      >
        <span>{selectedCode}</span>
        <ChevronDown />
      </button>

      {isOpen && (
        <div className="absolute z-50 top-full left-0 mt-1 w-64 max-h-60 overflow-hidden bg-white rounded-lg shadow-xl border border-gray-200 dark:bg-gray-800 dark:border-gray-700 flex flex-col">
          <div className="p-2 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            <div className="relative">
              <span className="absolute left-2 top-2 text-gray-400"><SearchIcon/></span>
              <input 
                autoFocus
                type="text" 
                placeholder={placeholder}
                className="w-full pl-8 pr-2 py-1 text-sm rounded border border-gray-200 focus:outline-none focus:border-blue-500 bg-white text-black dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="overflow-y-auto flex-1">
            {filteredCountries.map((c, i) => (
              <button
                key={`${c.code}-${i}`}
                type="button"
                onClick={() => { onChange(c.dial_code); setIsOpen(false); setSearch(""); }}
                className="w-full text-left px-4 py-2 text-sm hover:bg-blue-50 flex justify-between items-center text-black dark:hover:bg-gray-700 dark:text-gray-200"
              >
                <span className="truncate mr-2">{c.name}</span>
                <span className="text-gray-500 font-mono dark:text-gray-400">{c.dial_code}</span>
              </button>
            ))}
            {filteredCountries.length === 0 && (
              <div className="p-4 text-center text-xs text-gray-500">No results found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Language Modal Component
const LanguageModal = ({ isOpen, onClose, onSelect, currentLang, searchPlaceholder, selectTitle, noResults }: { isOpen: boolean, onClose: () => void, onSelect: (lang: LangKey) => void, currentLang: LangKey, searchPlaceholder: string, selectTitle: string, noResults: string }) => {
  const [search, setSearch] = useState("");
  
  if (!isOpen) return null;

  const filteredLangs = LANGUAGES_LIST.filter(l => 
    l.name.toLowerCase().includes(search.toLowerCase()) || 
    l.native.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white w-full max-w-sm max-h-[80vh] flex flex-col rounded-xl shadow-2xl dark:bg-gray-800 dark:text-gray-100 overflow-hidden">
        <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
           <h3 className="font-bold text-lg">{selectTitle}</h3>
           <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400">&times;</button>
        </div>
        <div className="p-4 bg-gray-50 dark:bg-gray-900/50">
           <div className="relative">
              <span className="absolute left-3 top-2.5 text-gray-400"><SearchIcon/></span>
              <input 
                autoFocus
                type="text" 
                placeholder={searchPlaceholder}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-black dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
           </div>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
            {filteredLangs.map(l => (
              <button
                key={l.code}
                onClick={() => { onSelect(l.code); onClose(); setSearch(""); }}
                className={`w-full text-left px-4 py-3 rounded-lg flex justify-between items-center mb-1 hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors ${currentLang === l.code ? 'bg-blue-50 border border-blue-200 dark:bg-blue-900/20 dark:border-blue-800' : ''}`}
              >
                <div>
                   <span className="block font-medium text-black dark:text-white">{l.native}</span>
                   <span className="block text-xs text-gray-500 dark:text-gray-400">{l.name}</span>
                </div>
                {currentLang === l.code && <span className="text-blue-600 font-bold">✓</span>}
              </button>
            ))}
            {filteredLangs.length === 0 && <p className="text-center text-gray-500 p-4">{noResults}</p>}
        </div>
      </div>
    </div>
  );
};

// --- Custom Date Picker (Strict Calendar Selection Only - Responsive) ---
const CustomDatePicker = ({ value, onChange, isCompact = false }: { value: string, onChange: (d: string) => void, isCompact?: boolean }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const [dateParts, setDateParts] = useState({ d: "", m: "", y: "" });
  const [viewDate, setViewDate] = useState<Date>(new Date());

  useEffect(() => {
      if (!value) return;
      const parts = value.split('-').map(p => parseInt(p, 10));
      if (parts.length !== 3 || parts.some(isNaN)) return;
      
      const [y, m, d] = parts;
      
      setDateParts({ 
          d: String(d).padStart(2, '0'), 
          m: String(m).padStart(2, '0'), 
          y: String(y) 
      });

      if (!isOpen) {
          setViewDate(new Date(y, m - 1, d));
      }
  }, [value, isOpen]);

  const handleDayClick = (day: number) => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth() + 1;
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    onChange(dateStr);
    setIsOpen(false);
  };

  const updateViewMonth = (newMonthIndex: number, newYear: number) => {
      const d = new Date(viewDate);
      d.setFullYear(newYear);
      d.setMonth(newMonthIndex);
      d.setDate(1); 
      setViewDate(d);
  };

  const changeMonth = (offset: number) => {
      const d = new Date(viewDate);
      d.setMonth(d.getMonth() + offset);
      d.setDate(1);
      setViewDate(d);
  };

  const renderCalendar = () => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const days = [];
    for(let i=0; i<firstDay; i++) days.push(null);
    for(let i=1; i<=daysInMonth; i++) days.push(i);
    
    const weeks = [];
    for(let i=0; i<days.length; i+=7) {
        const week = days.slice(i, i+7);
        // Pad the last week to exactly 7 items to fix grid alignment issues
        while(week.length < 7) week.push(null);
        weeks.push(week);
    }
    
    const years = Array.from({length: 100}, (_, i) => 1950 + i);

    return (
        <div className="p-3 bg-white dark:bg-gray-800">
            <div className="flex items-center justify-between mb-3 gap-1">
                <button 
                  type="button" 
                  onClick={(e) => { e.stopPropagation(); changeMonth(-1); }}
                  className="p-1 hover:bg-gray-100 rounded dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300"
                >
                  <ChevronLeft />
                </button>
                <div className="flex gap-1 flex-1 justify-center">
                    <select 
                        value={month} 
                        onChange={(e) => updateViewMonth(parseInt(e.target.value), year)}
                        className="p-1 text-xs font-bold border-none bg-transparent text-gray-900 dark:text-white outline-none cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 rounded text-center appearance-none"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {AD_MONTH_NAMES.map((m, i) => <option key={m} value={i} className="text-left">{m}</option>)}
                    </select>
                    <select 
                        value={year} 
                        onChange={(e) => updateViewMonth(month, parseInt(e.target.value))}
                        className="p-1 text-xs font-bold border-none bg-transparent text-gray-900 dark:text-white outline-none cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 rounded text-center appearance-none"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {years.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                </div>
                <button 
                  type="button" 
                  onClick={(e) => { e.stopPropagation(); changeMonth(1); }}
                  className="p-1 hover:bg-gray-100 rounded dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300"
                >
                  <ChevronRight />
                </button>
            </div>
            <table className="w-full text-center text-xs border-collapse">
                <thead>
                    <tr>{["Su","Mo","Tu","We","Th","Fr","Sa"].map(d => <th key={d} className="p-1 text-gray-400 dark:text-gray-500 font-medium text-[10px] h-6">{d}</th>)}</tr>
                </thead>
                <tbody>
                    {weeks.map((week, i) => (
                        <tr key={i}>
                            {week.map((d, j) => (
                                <td key={j} className="p-0">
                                    {d ? (
                                        <button 
                                            type="button"
                                            onClick={(e) => {e.stopPropagation(); handleDayClick(d)}}
                                            className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center text-xs transition-all ${
                                                parseInt(dateParts.d) === d && parseInt(dateParts.m) === month+1 && parseInt(dateParts.y) === year
                                                ? 'bg-blue-600 text-white shadow-md font-bold' 
                                                : 'text-gray-700 hover:bg-blue-50 dark:text-gray-200 dark:hover:bg-gray-600'
                                            } ${
                                                new Date().getDate() === d && new Date().getMonth() === month && new Date().getFullYear() === year && !(parseInt(dateParts.d) === d && parseInt(dateParts.m) === month+1 && parseInt(dateParts.y) === year)
                                                ? 'border border-blue-400 text-blue-600 dark:text-blue-300'
                                                : ''
                                            }`}
                                        >
                                            {d}
                                        </button>
                                    ) : <div className="w-8 h-8"></div>}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
  };

  const containerClass = isCompact 
    ? "relative w-40" 
    : "relative w-full max-w-[240px]";

  const inputClass = isCompact
    ? "flex-1 flex items-center border border-gray-300 rounded-lg bg-white dark:bg-gray-600 dark:border-gray-500 focus-within:ring-1 focus-within:ring-blue-500 focus-within:border-blue-500 overflow-hidden shadow-sm h-8 px-2 cursor-pointer transition-colors"
    : "flex-1 flex items-center border border-gray-300 rounded-lg bg-white dark:bg-gray-600 dark:border-gray-500 focus-within:ring-1 focus-within:ring-blue-500 focus-within:border-blue-500 overflow-hidden shadow-sm h-10 px-3 cursor-pointer hover:border-gray-400 transition-colors";

  const btnClass = isCompact
    ? "h-8 w-8 flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm transition-colors flex-shrink-0"
    : "h-10 w-10 flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm transition-colors flex-shrink-0";

  return (
    <div className={containerClass}>
        <div className="flex gap-2 items-center">
            <div 
                onClick={() => setIsOpen(!isOpen)}
                className={inputClass}
            >
                <div className="flex items-center flex-1 justify-center gap-1 pointer-events-none select-none w-full">
                    <input 
                        type="text"
                        readOnly
                        placeholder="DD"
                        value={dateParts.d}
                        className={`text-center bg-transparent border-none outline-none text-black dark:text-white placeholder-gray-400 p-0 focus:ring-0 appearance-none m-0 font-medium cursor-pointer ${isCompact ? 'w-5 text-xs' : 'w-7 text-sm'}`}
                        tabIndex={-1}
                    />
                    <span className="text-gray-400 text-xs">/</span>
                    <input 
                        type="text"
                        readOnly
                        placeholder="MM"
                        value={dateParts.m}
                        className={`text-center bg-transparent border-none outline-none text-black dark:text-white placeholder-gray-400 p-0 focus:ring-0 appearance-none m-0 font-medium cursor-pointer ${isCompact ? 'w-5 text-xs' : 'w-7 text-sm'}`}
                        tabIndex={-1}
                    />
                    <span className="text-gray-400 text-xs">/</span>
                    <input 
                        type="text"
                        readOnly
                        placeholder="YYYY"
                        value={dateParts.y}
                        className={`text-center bg-transparent border-none outline-none text-black dark:text-white placeholder-gray-400 p-0 focus:ring-0 appearance-none m-0 font-medium cursor-pointer ${isCompact ? 'w-8 text-xs' : 'w-10 text-sm'}`}
                        tabIndex={-1}
                    />
                </div>
            </div>
            
            <button 
                type="button"
                onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
                className={btnClass}
                aria-label="Toggle Calendar"
            >
                <CalendarIcon/>
            </button>
        </div>
        
        {isOpen && (
            <>
                <div 
                    className="fixed inset-0 z-[60] bg-black/50 sm:bg-transparent" 
                    onClick={() => setIsOpen(false)} 
                />
                <div 
                    className="fixed z-[70] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] max-w-[90vw] sm:absolute sm:left-auto sm:right-0 sm:top-full sm:translate-x-0 sm:translate-y-2 sm:w-[280px]"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="bg-white rounded-xl shadow-2xl border border-gray-200 dark:bg-gray-800 dark:border-gray-700 overflow-hidden animate-fade-in">
                            {renderCalendar()}
                    </div>
                </div>
            </>
        )}
    </div>
  );
};


export default function LoanAmortizationApp() {
  // --- Translations ---
  const defaultTrans = {
      login: "Login", register: "New Register", forgotPassword: "Forgot Password?", resetPassword: "Reset Password",
      enterEmail: "Enter your registered email", enterPhone: "Enter registered mobile number", enterPin: "Enter 4-Digit PIN",
      enterNewPass: "Enter New Password", pin: "4-Digit PIN", retypePin: "Retype 4-Digit PIN", changePin: "Change PIN",
      oldPin: "Old PIN", newPin: "New PIN", pinChanged: "PIN changed successfully", pinMismatch: "PINs do not match",
      invalidPin: "Invalid PIN", email: "Email", phone: "Mobile Number", password: "Password", retype: "Retype Password",
      verify: "Verify & Create Account", bankName: "Bank / Person Name", emi: "EMI", principal: "Principal",
      rate: "Rate (%)", months: "Months", startDate: "Start Date", actualPaid: "Actual Paid", requiredFinalPayment: "Required Final Payment",
      status: "Status", paid: "Paid", pending: "Pending", downloadExcel: "Download Excel", downloadPDF: "Download PDF",
      saveFile: "Save", updateFile: "Update", savedFilesTitle: "Saved Loan Files", recycleBinTitle: "Deleted History",
      noSavedFiles: "No saved files found.", noDeletedFiles: "No deleted files found.", restore: "Restore", deletePerm: "Delete Permanently",
      loadingLibs: "Loading libraries...", backToLogin: "Back to Login", createNew: "Create New Account", newLoan: "New Loan",
      monthHeader: "Month", dateHeader: "Date", begBalanceHeader: "Beg. Balance", interestHeader: "Interest", principalHeader: "Principal",
      reqPaymentHeader: "Req. Final Payment", logoutText: "Logout", settingsTitle: "Settings", settingsDescription: "App configuration options.",
      language: "Language", dark: "Dark Mode", light: "Light Mode", next: "Next", submit: "Submit",
      filesAutoDelete: "Files in history are deleted after 29 days.", loginWithEmail: "Login with Email", loginWithPhone: "Login with Mobile",
      useEmail: "Use Email", usePhone: "Use Mobile Number", userNotFound: "User not found", emailOrPhoneRequired: "Email or Phone is required",
      firstName: "First Name", lastName: "Last Name", changePassword: "Change Password", passwordChanged: "Password changed successfully",
      changePhone: "Change Mobile Number", newPhone: "New Mobile Number", phoneChanged: "Mobile number updated successfully",
      designedBy: "AjD Group Of Company | Designed By Dipesh Aryal", back: "Back", saveBtn: "Save", searchCountry: "Search country...", selectLanguage: "Select Language",
      settings: "Settings", recycleBin: "Recycle Bin", savedFiles: "Saved Files", noResults: "No results found", contact: "Contact",
      enterPassPlaceholder: "Enter Password", enterRetypePlaceholder: "Retype Password", enterPinPlaceholder: "Enter PIN",
      totalLoanAmount: "Total Principal Amount", totalRemaining: "Total Remaining Balance"
  };

  const translations: Record<LangKey, Record<string, string>> = {
    English: defaultTrans,
    Nepali: { ...defaultTrans, login: "लगइन", register: "नयाँ दर्ता", forgotPassword: "पासवर्ड बिर्सनुभयो?", email: "इमेल", phone: "मोबाइल नम्बर", pin: "४ अंकको PIN", verify: "प्रमाणिकरण", bankName: "बैंक / नाम", principal: "मूलधन", rate: "दर (%)", months: "महिना", emi: "ईएमआई", saveFile: "सेभ गर्नुहोस्", downloadExcel: "Excel डाउनलोड", downloadPDF: "PDF डाउनलोड", firstName: "पहिलो नाम", lastName: "थर", changePassword: "पासवर्ड परिवर्तन", passwordChanged: "पासवर्ड सफलतापूर्वक परिवर्तन भयो", changePhone: "मोबाइल नम्बर परिवर्तन", newPhone: "नयाँ मोबाइल नम्बर", phoneChanged: "मोबाइल नम्बर सफलतापूर्वक अपडेट भयो", designedBy: "AjD Group Of Company | डिजाइन", back: "पछाडि", saveBtn: "सेभ", searchCountry: "देश खोज्नुहोस्...", selectLanguage: "भाषा चयन गर्नुहोस्", settings: "सेटिङहरू", recycleBin: "रिसाइकल बिन", savedFiles: "सेभ गरिएका फाइलहरू", noResults: "कुनै नतिजा भेटिएन", contact: "सम्पर्क", enterPassPlaceholder: "पासवर्ड राख्नुहोस्", enterRetypePlaceholder: "पासवर्ड पुनः राख्नुहोस्", enterPinPlaceholder: "PIN राख्नुहोस्", monthHeader: "महिना", dateHeader: "मिति", begBalanceHeader: "शुरुको बाँकी", interestHeader: "ब्याज", principalHeader: "साँवा", reqPaymentHeader: "भुक्तानी गर्नुपर्ने", actualPaid: "तिरेको रकम", status: "स्थिति", newLoan: "नयाँ ऋण", logoutText: "लगआउट", startDate: "शुरु मिति", changePin: "पिन परिवर्तन", createNew: "नयाँ खाता बनाउनुहोस्", backToLogin: "लगइनमा जानुहोस्", paid: "भुक्तानी भयो", pending: "बाँकी", totalLoanAmount: "कुल ऋण रकम", totalRemaining: "कुल बाँकी रकम" },
    Hindi: { ...defaultTrans, login: "लॉगिन", register: "नया रजिस्टर", forgotPassword: "पासवर्ड भूल गए?", email: "ईमेल", phone: "मोबाइल नंबर", pin: "4-अंकीय पिन", verify: "सत्यापित करें", bankName: "बैंक / नाम", principal: "मूलधन", rate: "दर (%)", months: "महीने", emi: "ईएमआई", saveFile: "सहेजें", downloadExcel: "एक्सेल डाउनलोड", downloadPDF: "पीडीएफ डाउनलोड", firstName: "पहला नाम", lastName: "उपनाम", designedBy: "AjD Group Of Company | द्वारा डिज़ाइन", back: "वापस", saveBtn: "सहेजें", monthHeader: "महीना", dateHeader: "तारीख", begBalanceHeader: "शुरुआती शेष", interestHeader: "ब्याज", principalHeader: "मूलधन", reqPaymentHeader: "अंतिम भुगतान", actualPaid: "वास्तविक भुगतान", status: "स्थिति", newLoan: "नया ऋण", logoutText: "लॉगआउट", startDate: "आरंभ तिथि", changePin: "पिन बदलें", createNew: "नया खाता बनाएं", backToLogin: "लॉगिन पर वापस जाएं", paid: "भुगतान किया", pending: "लंबित" },
    Arabic: { ...defaultTrans, login: "تسجيل الدخول", register: "تسجيل جديد", forgotPassword: "نسيت كلمة المرور؟", email: "البريد", phone: "الهاتف", pin: "رمز PIN", verify: "تحقق", bankName: "اسم البنك", principal: "الأصل", rate: "النسبة", months: "الشهور", emi: "القسط", saveFile: "حفظ", downloadExcel: "تحميل Excel", downloadPDF: "تحميل PDF", firstName: "الاسم الأول", lastName: "اسم العائلة", designedBy: "AjD Group Of Company | تصميم", back: "رجوع", saveBtn: "حفظ", monthHeader: "الشهر", dateHeader: "التاريخ", begBalanceHeader: "الرصيد الافتتاحي", interestHeader: "الفائدة", principalHeader: "الأصل", reqPaymentHeader: "الدفع النهائي المطلوب", actualPaid: "المدفوع الفعلي", status: "الحالة", newLoan: "قرض جديد", logoutText: "تسجيل خروج", startDate: "تاريخ البدء", changePin: "تغيير الرمز", createNew: "إنشاء حساب جديد", backToLogin: "عودة للدخول", paid: "مدفوع", pending: "قيد الانتظار" },
    Spanish: { ...defaultTrans, login: "Iniciar Sesión", register: "Registro", forgotPassword: "¿Contraseña olvidada?", email: "Correo", phone: "Móvil", pin: "PIN", verify: "Verificar", bankName: "Banco", principal: "Principal", rate: "Tasa", months: "Meses", emi: "EMI", saveFile: "Guardar", downloadExcel: "Descargar Excel", downloadPDF: "Descargar PDF", firstName: "Nombre", lastName: "Apellido", designedBy: "AjD Group Of Company | Diseñado por", back: "Atrás", saveBtn: "Guardar", monthHeader: "Mes", dateHeader: "Fecha", begBalanceHeader: "Balance Inicial", interestHeader: "Interés", principalHeader: "Principal", reqPaymentHeader: "Pago Final Req.", actualPaid: "Pagado Real", status: "Estado", newLoan: "Nuevo Préstamo", logoutText: "Cerrar Sesión", startDate: "Fecha Inicio", changePin: "Cambiar PIN", createNew: "Crear Cuenta", backToLogin: "Volver a Login", paid: "Pagado", pending: "Pendiente" },
    French: { ...defaultTrans, login: "Connexion", register: "Inscription", forgotPassword: "Mot de passe oublié ?", email: "E-mail", phone: "Mobile", pin: "Code PIN", verify: "Vérifier", bankName: "Banque", principal: "Principal", rate: "Taux", months: "Mois", emi: "EMI", saveFile: "Sauvegarder", downloadExcel: "Télécharger Excel", downloadPDF: "Télécharger PDF", firstName: "Prénom", lastName: "Nom", designedBy: "AjD Group Of Company | Conçu par", back: "Retour", saveBtn: "Sauver", monthHeader: "Mois", dateHeader: "Date", begBalanceHeader: "Solde Début", interestHeader: "Intérêt", principalHeader: "Principal", reqPaymentHeader: "Paiement Req.", actualPaid: "Payé Réel", status: "Statut", newLoan: "Nouveau Prêt", logoutText: "Déconnexion", startDate: "Date Début", changePin: "Changer PIN", createNew: "Crear Compte", backToLogin: "Retour Connexion", paid: "Payé", pending: "En attente" },
    German: { ...defaultTrans, login: "Anmelden", register: "Registrieren", forgotPassword: "Passwort vergessen?", email: "E-Mail", phone: "Handy", pin: "PIN", verify: "Bestätigen", bankName: "Bank", principal: "Kapital", rate: "Zins", months: "Monate", emi: "Rate", saveFile: "Speichern", downloadExcel: "Excel Laden", downloadPDF: "PDF Laden", firstName: "Vorname", lastName: "Nachname", designedBy: "AjD Group Of Company | Entworfen von", back: "Zurück", saveBtn: "Speichern", monthHeader: "Monat", dateHeader: "Datum", begBalanceHeader: "Anfangssaldo", interestHeader: "Zinsen", principalHeader: "Kapital", reqPaymentHeader: "Erf. Zahlung", actualPaid: "Tats. Gezahlt", status: "Status", newLoan: "Neues Darlehen", logoutText: "Abmelden", startDate: "Startdatum", changePin: "PIN Ändern", createNew: "Konto Erstellen", backToLogin: "Zurück zum Login", paid: "Bezahlt", pending: "Ausstehend" },
    Chinese: { ...defaultTrans, login: "登录", register: "注册", forgotPassword: "忘记密码", email: "邮箱", phone: "手机", pin: "PIN码", verify: "验证", bankName: "银行", principal: "本金", rate: "利率", months: "月数", emi: "分期", saveFile: "保存", downloadExcel: "下载 Excel", downloadPDF: "下载 PDF", firstName: "名字", lastName: "姓氏", designedBy: "AjD Group Of Company | 设计者", back: "返回", saveBtn: "保存", monthHeader: "月", dateHeader: "日期", begBalanceHeader: "期初余额", interestHeader: "利息", principalHeader: "本金", reqPaymentHeader: "应付金额", actualPaid: "实付金额", status: "状态", newLoan: "新贷款", logoutText: "退出", startDate: "开始日期", changePin: "更改PIN", createNew: "创建新账户", backToLogin: "返回登录", paid: "已付", pending: "待付" },
    Portuguese: { ...defaultTrans, login: "Entrar", register: "Registar", forgotPassword: "Esqueceu a senha?", email: "E-mail", phone: "Celular", pin: "PIN", verify: "Verificar", bankName: "Banco", principal: "Principal", rate: "Taxa", months: "Meses", emi: "EMI", saveFile: "Salvar", downloadExcel: "Baixar Excel", downloadPDF: "Baixar PDF", firstName: "Nome", lastName: "Sobrenome", designedBy: "AjD Group Of Company | Desenhado por", back: "Voltar", saveBtn: "Salvar", monthHeader: "Mês", dateHeader: "Data", begBalanceHeader: "Saldo Inicial", interestHeader: "Juros", principalHeader: "Principal", reqPaymentHeader: "Pagamento Req.", actualPaid: "Pago Real", status: "Estado", newLoan: "Novo Empréstimo", logoutText: "Sair", startDate: "Data Início", changePin: "Alterar PIN", createNew: "Criar Conta", backToLogin: "Voltar ao Login", paid: "Pago", pending: "Pendente" },
    Italian: { ...defaultTrans, login: "Accedi", register: "Registrati", forgotPassword: "Password dimenticata?", email: "Email", phone: "Cellulare", pin: "PIN", verify: "Verifica", bankName: "Banca", principal: "Capitale", rate: "Tasso", months: "Mesi", emi: "Rata", saveFile: "Salva", downloadExcel: "Scarica Excel", downloadPDF: "Scarica PDF", firstName: "Nome", lastName: "Cognome", designedBy: "AjD Group Of Company | Progettato da", back: "Indietro", saveBtn: "Salva", monthHeader: "Mese", dateHeader: "Data", begBalanceHeader: "Saldo Iniziale", interestHeader: "Interessi", principalHeader: "Capitale", reqPaymentHeader: "Pagamento Rich.", actualPaid: "Pagato Reale", status: "Stato", newLoan: "Nuovo Prestito", logoutText: "Esci", startDate: "Data Inizio", changePin: "Cambia PIN", createNew: "Crea Account", backToLogin: "Torna al Login", paid: "Pagato", pending: "In attesa" },
    Russian: { ...defaultTrans, login: "Вход", register: "Регистрация", forgotPassword: "Забыли пароль?", email: "Email", phone: "Телефон", pin: "PIN-код", verify: "Проверить", bankName: "Банк", principal: "Сумма", rate: "Ставка", months: "Месяцы", emi: "Платеж", saveFile: "Сохранить", downloadExcel: "Скачать Excel", downloadPDF: "Скачать PDF", firstName: "Имя", lastName: "Фамилия", designedBy: "AjD Group Of Company | Разработано", back: "Назад", saveBtn: "Сохранить", monthHeader: "Месяц", dateHeader: "Дата", begBalanceHeader: "Нач. баланс", interestHeader: "Процент", principalHeader: "Основной долг", reqPaymentHeader: "Треб. платеж", actualPaid: "Факт. оплата", status: "Статус", newLoan: "Новый кредит", logoutText: "Выйти", startDate: "Дата начала", changePin: "Сменить PIN", createNew: "Создать аккаунт", backToLogin: "Назад ко входу", paid: "Оплачено", pending: "Ожидание" },
    Japanese: { ...defaultTrans, login: "ログイン", register: "登録", forgotPassword: "パスワードを忘れた", email: "Eメール", phone: "電話番号", pin: "PINコード", verify: "確認", bankName: "銀行名", principal: "元金", rate: "金利", months: "月数", emi: "支払額", saveFile: "保存", downloadExcel: "Excelダウンロード", downloadPDF: "PDFダウンロード", firstName: "名前", lastName: "苗字", designedBy: "AjD Group Of Company | 設計者", back: "戻る", saveBtn: "保存", monthHeader: "月", dateHeader: "日付", begBalanceHeader: "開始残高", interestHeader: "利息", principalHeader: "元金", reqPaymentHeader: "必要支払額", actualPaid: "実支払額", status: "ステータス", newLoan: "新規ローン", logoutText: "ログアウト", startDate: "開始日", changePin: "PIN変更", createNew: "アカウント作成", backToLogin: "ログインに戻る", paid: "支払済", pending: "保留中" },
    Korean: { ...defaultTrans, login: "로그인", register: "등록", forgotPassword: "비밀번호 찾기", email: "이메일", phone: "전화번호", pin: "PIN", verify: "확인", bankName: "은행", principal: "이자율", rate: "이자율", months: "개월", emi: "월 상환액", saveFile: "저장", downloadExcel: "Excel 다운로드", downloadPDF: "PDF 다운로드", firstName: "이름", lastName: "성", designedBy: "AjD Group Of Company | 설계자", back: "뒤로", saveBtn: "저장", monthHeader: "월", dateHeader: "날짜", begBalanceHeader: "기초 잔액", interestHeader: "이자", principalHeader: "원금", reqPaymentHeader: "필요 상환액", actualPaid: "실제 납부액", status: "상태", newLoan: "새 대출", logoutText: "로그아웃", startDate: "시작일", changePin: "PIN 변경", createNew: "새 계정 만들기", backToLogin: "로그인으로 돌아가기", paid: "납부됨", pending: "보류 중" },
    Turkish: { ...defaultTrans, login: "Giriş", register: "Kayıt Ol", forgotPassword: "Şifremi Unuttum", email: "E-posta", phone: "Telefon", pin: "PIN", verify: "Doğrula", bankName: "Banka", principal: "Ana Para", rate: "Oran", months: "Ay", emi: "Taksit", saveFile: "Kaydet", downloadExcel: "Excel İndir", downloadPDF: "PDF İndir", firstName: "İsim", lastName: "Soyisim", designedBy: "AjD Group Of Company | Tasarlayan", back: "Geri", saveBtn: "Kaydet", monthHeader: "Ay", dateHeader: "Tarih", begBalanceHeader: "Başlangıç Bakiyesi", interestHeader: "Faiz", principalHeader: "Ana Para", reqPaymentHeader: "Gerekli Ödeme", actualPaid: "Gerçek Ödenen", status: "Durum", newLoan: "Yeni Kredi", logoutText: "Çıkış", startDate: "Başlangıç Tarihi", changePin: "PIN Değiştir", createNew: "Yeni Hesap Oluştur", backToLogin: "Girişe Dön", paid: "Ödendi", pending: "Bekliyor" },
    Vietnamese: { ...defaultTrans, login: "Đăng nhập", register: "Đăng ký", forgotPassword: "Quên mật khẩu?", email: "Email", phone: "Điện thoại", pin: "PIN", verify: "Xác minh", bankName: "Ngân hàng", principal: "Tiền gốc", rate: "Lãi suất", months: "Tháng", emi: "EMI", saveFile: "Lưu", downloadExcel: "Tải Excel", downloadPDF: "Tải PDF", firstName: "Tên", lastName: "Họ", designedBy: "AjD Group Of Company | Thiết kế bởi", back: "Quay lại", saveBtn: "Lưu", monthHeader: "Tháng", dateHeader: "Ngày", begBalanceHeader: "Dư nợ đầu", interestHeader: "Lãi", principalHeader: "Gốc", reqPaymentHeader: "Thanh toán Y/C", actualPaid: "Thực trả", status: "Trạng thái", newLoan: "Khoản vay mới", logoutText: "Đăng xuất", startDate: "Ngày bắt đầu", changePin: "Đổi PIN", createNew: "Tạo tài khoản mới", backToLogin: "Quay lại đăng nhập", paid: "Đã trả", pending: "Chờ xử lý" },
    Thai: { ...defaultTrans, login: "เข้าสู่ระบบ", register: "ลงทะเบียน", forgotPassword: "ลืมรหัสผ่าน?", email: "อีเมล", phone: "เบอร์โทร", pin: "PIN", verify: "ยืนยัน", bankName: "ธนาคาร", principal: "เงินต้น", rate: "ดอกเบี้ย", months: "เดือน", emi: "ผ่อนชำระ", saveFile: "บันทึก", downloadExcel: "ดาวน์โหลด Excel", downloadPDF: "ดาวน์โหลด PDF", firstName: "ชื่อ", lastName: "นามสกุล", designedBy: "AjD Group Of Company | ออกแบบโดย", back: "กลับ", saveBtn: "บันทึก", monthHeader: "เดือน", dateHeader: "วันที่", begBalanceHeader: "ยอดคงเหลือยกมา", interestHeader: "ดอกเบี้ย", principalHeader: "เงินต้น", reqPaymentHeader: "ยอดชำระที่กำหนด", actualPaid: "ชำระจริง", status: "สถานะ", newLoan: "เงินกู้ใหม่", logoutText: "ออกจากระบบ", startDate: "วันที่เริ่ม", changePin: "เปลี่ยน PIN", createNew: "สร้างบัญชีใหม่", backToLogin: "กลับสู่ระบบ", paid: "จ่ายแล้ว", pending: "รอดำเนินการ" },
    Indonesian: { ...defaultTrans, login: "Masuk", register: "Daftar", forgotPassword: "Lupa Kata Sandi?", email: "Email", phone: "Ponsel", pin: "PIN", verify: "Verifikasi", bankName: "Bank", principal: "Pokok", rate: "Bunga", months: "Bulan", emi: "Cicilan", saveFile: "Simpan", downloadExcel: "Unduh Excel", downloadPDF: "Unduh PDF", firstName: "Nama Depan", lastName: "Nama Belakang", designedBy: "AjD Group Of Company | Dirancang Oleh", back: "Kembali", saveBtn: "Simpan", monthHeader: "Bulan", dateHeader: "Tanggal", begBalanceHeader: "Saldo Awal", interestHeader: "Bunga", principalHeader: "Pokok", reqPaymentHeader: "Pembayaran Req.", actualPaid: "Bayar Aktual", status: "Status", newLoan: "Pinjaman Baru", logoutText: "Keluar", startDate: "Tanggal Mulai", changePin: "Ganti PIN", createNew: "Buat Akun Baru", backToLogin: "Kembali ke Masuk", paid: "Lunas", pending: "Pending" },
    Dutch: { ...defaultTrans, login: "Inloggen", register: "Registreren", forgotPassword: "Wachtwoord vergeten?", email: "E-mail", phone: "Mobiel", pin: "PIN", verify: "Verifiëren", bankName: "Bank", principal: "Hoofdsom", rate: "Rente", months: "Maanden", emi: "Termijn", saveFile: "Opslaan", downloadExcel: "Excel Downloaden", downloadPDF: "PDF Downloaden", firstName: "Vorname", lastName: "Achternaam", designedBy: "AjD Group Of Company | Ontworpen door", back: "Terug", saveBtn: "Opslaan", monthHeader: "Maand", dateHeader: "Datum", begBalanceHeader: "Beginsaldo", interestHeader: "Rente", principalHeader: "Hoofdsom", reqPaymentHeader: "Ver. Betaling", actualPaid: "Werk. Betaald", status: "Status", newLoan: "Nieuwe Lening", logoutText: "Uitloggen", startDate: "Startdatum", changePin: "PIN Wijzigen", createNew: "Nieuw Account", backToLogin: "Terug naar Login", paid: "Betaald", pending: "In afwachting" },
  };
  
  const formatCurrency = (amount: number | string | undefined | null) => {
    if (amount === null || amount === undefined || amount === "") return "";
    const num = Number(amount);
    if (isNaN(num)) return amount;
    return num.toFixed(0);
  };

  // --- State ---
  const [lang, setLang] = useState<LangKey>(() => (localStorage.getItem("language") as LangKey) || "English");
  const t = translations[lang] ?? translations.English;
  const [theme, setTheme] = useState<'light' | 'dark'>(() => (localStorage.getItem("theme") as 'light' | 'dark') || 'light');
  
  // Auth State
  const [currentUserKey, setCurrentUserKey] = useState<string | null>(() => localStorage.getItem("currentSessionUser") || null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => !!localStorage.getItem("currentSessionUser"));
  const [authMode, setAuthMode] = useState<AuthMode>("LOGIN"); 
  const [forgotStep, setForgotStep] = useState<ForgotStep>("METHOD_SELECT");
  const [loginMethod, setLoginMethod] = useState<LoginMethod>("EMAIL");
  const [forgotMethod, setForgotMethod] = useState<LoginMethod>("EMAIL");
  
  // Form Inputs
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [countryCode, setCountryCode] = useState<string>("+977");
  const [phone, setPhone] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [retype, setRetype] = useState<string>("");
  const [pin, setPin] = useState<string>("");
  const [retypePin, setRetypePin] = useState<string>("");
  
  const [notificationMessage, setNotificationMessage] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [libsLoaded, setLibsLoaded] = useState(false);

  // Modal States
  const [showLanguageModal, setShowLanguageModal] = useState(false);

  // User Data Storage
  const [users, setUsers] = useState<Record<string, UserData>>(() => {
      const raw = getStorage("app_users", {});
      const migrated: Record<string, UserData> = {};
      Object.keys(raw).forEach(key => {
          if (typeof raw[key] === 'string') {
              migrated[key] = { email: key, phone: "", password: raw[key] as string, pin: "0000" };
          } else {
              migrated[key] = { ...raw[key], email: raw[key].email || key, phone: raw[key].phone || "" };
          }
      });
      return migrated;
  });

  // App Data
  const [bankName, setBankName] = useState<string>("");
  const [principal, setPrincipal] = useState<number | string>("");
  const [annualRate, setAnnualRate] = useState<number | string>("");
  const [months, setMonths] = useState<number | string>("");
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [actualPayments, setActualPayments] = useState<Record<number, string | number>>(() => getStorage("actualPayments", {}));
  const [statuses, setStatuses] = useState<Record<number, string>>(() => getStorage("statuses", {}));
  
  // File management
  const [savedFiles, setSavedFiles] = useState<SavedFile[]>([]);
  const [showFileDrawer, setShowFileDrawer] = useState(false);
  const [viewDeleted, setViewDeleted] = useState(false);
  const [editingNameId, setEditingNameId] = useState<string | null>(null);
  const [tempName, setTempName] = useState("");
  const [currentFileId, setCurrentFileId] = useState<string | null>(null);
  const [showSettingsDrawer, setShowSettingsDrawer] = useState(false);
  
  // Settings Modes
  const [showChangePin, setShowChangePin] = useState(false);
  const [newPinInput, setNewPinInput] = useState("");
  
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [newPasswordInput, setNewPasswordInput] = useState("");
  const [retypePasswordInput, setRetypePasswordInput] = useState("");

  const [showChangePhone, setShowChangePhone] = useState(false);
  const [newPhoneInput, setNewPhoneInput] = useState("");
  const [newPhoneCode, setNewPhoneCode] = useState("+977");

  // --- Effects ---
  useEffect(() => { localStorage.setItem("language", lang); }, [lang]);
  useEffect(() => { localStorage.setItem("theme", theme); }, [theme]);
  useEffect(() => { localStorage.setItem("actualPayments", JSON.stringify(actualPayments)); }, [actualPayments]);
  useEffect(() => { localStorage.setItem("statuses", JSON.stringify(statuses)); }, [statuses]);
  useEffect(() => { localStorage.setItem("app_users", JSON.stringify(users)); }, [users]);

  useEffect(() => {
    if (currentUserKey) {
        const key = `saved_loan_files_${currentUserKey}`;
        setSavedFiles(getStorage(key, []));
    } else {
        setSavedFiles([]);
    }
  }, [currentUserKey]);

  useEffect(() => {
    if (currentUserKey) {
        const key = `saved_loan_files_${currentUserKey}`;
        localStorage.setItem(key, JSON.stringify(savedFiles));
    }
  }, [savedFiles, currentUserKey]);

  useEffect(() => {
    if (!isLoggedIn) return;
    let inactivityTimer: number;
    const resetInactivityTimer = () => {
      clearTimeout(inactivityTimer);
      inactivityTimer = window.setTimeout(() => {
        handleLogout();
        alert("Session expired due to 5 minutes of inactivity.");
      }, 5 * 60 * 1000);
    };
    const activityEvents = ["mousedown", "mousemove", "keypress", "scroll", "touchstart", "click"];
    activityEvents.forEach((ev) => document.addEventListener(ev, resetInactivityTimer));
    resetInactivityTimer();
    return () => {
      clearTimeout(inactivityTimer);
      activityEvents.forEach((ev) => document.removeEventListener(ev, resetInactivityTimer));
    };
  }, [isLoggedIn]);

  useEffect(() => {
    const handleCloseLogout = () => {
      localStorage.removeItem("currentSessionUser");
    };
    window.addEventListener("beforeunload", handleCloseLogout);
    return () => window.removeEventListener("beforeunload", handleCloseLogout);
  }, []);

  useEffect(() => {
      const TWENTY_NINE_DAYS = 29 * 24 * 60 * 60 * 1000;
      const now = Date.now();
      const cleanedFiles = savedFiles.filter(f => {
          if (f.deletedAt) {
              return (now - f.deletedAt) < TWENTY_NINE_DAYS;
          }
          return true;
      });
      if (cleanedFiles.length !== savedFiles.length) setSavedFiles(cleanedFiles);
  }, [savedFiles]);

  useEffect(() => {
    Promise.all([
      loadScript("https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"),
      loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"),
    ]).then(() => {
        return loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.29/jspdf.plugin.autotable.min.js");
      }).then(() => setLibsLoaded(true))
      .catch((err) => console.error(err));
  }, []);

  function showNotification(message: string, type: 'success' | 'error' | 'info' = 'info') {
    setNotificationMessage({ message, type });
    setTimeout(() => setNotificationMessage(null), 4000);
  }
  
  const Notification = () => {
    if (!notificationMessage) return null;
    const { message, type } = notificationMessage;
    let colorClass = type === 'success' ? 'bg-green-100 text-green-800 border-green-500' : type === 'error' ? 'bg-red-100 text-red-800 border-red-500' : 'bg-blue-100 text-blue-800 border-blue-500';
    return (
        <div className={`fixed top-4 right-4 z-[70] p-4 rounded-lg shadow-xl border-t-4 ${colorClass} transition-opacity`}>
            <p className="font-medium text-sm">{message}</p>
        </div>
    );
  };

  // --- Calculations ---
  const principalNum = Number(principal) || 0;
  const rateNum = Number(annualRate) || 0;
  const monthsNum = Number(months) || 0;
  const monthlyRate = useMemo(() => rateNum / 12 / 100, [rateNum]);
  const emi = useMemo(() => {
    if (monthsNum === 0 || principalNum === 0) return 0;
    if (monthlyRate === 0) return principalNum / monthsNum;
    return (principalNum * monthlyRate * Math.pow(1 + monthlyRate, monthsNum)) / (Math.pow(1 + monthlyRate, monthsNum) - 1);
  }, [principalNum, monthlyRate, monthsNum]);

  const schedule = useMemo<ScheduleRow[]>(() => {
    if (principalNum <= 0 || monthsNum <= 0) return [];
    const rows: ScheduleRow[] = [];
    let balance = principalNum;
    for (let i = 0; i < monthsNum; i++) {
      const idx = i + 1;
      const dateObj = new Date(startDate);
      dateObj.setMonth(dateObj.getMonth() + i);
      const date = dateObj.toISOString().slice(0, 10);
      const interest = balance * monthlyRate;
      const requiredFinal = balance + interest;
      const userValue = actualPayments[idx];
      const hasUserOverride = userValue !== undefined && userValue !== "";
      const rawPaid = hasUserOverride ? Number(userValue) : emi;
      const interestPaid = Math.min(rawPaid, interest);
      const principalPaid = Math.max(0, rawPaid - interestPaid);
      const beginningBalance = balance;
      balance = Math.max(0, balance - principalPaid);

      rows.push({
        month: idx, date, beginningBalanceRounded: Math.round(beginningBalance),
        interestRounded: Math.round(interestPaid), principalPaidRounded: Math.round(principalPaid),
        scheduledEmiRounded: Math.round(emi), requiredFinalRounded: Math.round(requiredFinal),
        actualPaidRounded: hasUserOverride ? Math.round(Number(userValue)) : "", actualPaidRaw: rawPaid,
        status: statuses[idx] || t.pending,
      });
      if (balance <= 0) break;
    }
    return rows;
  }, [principalNum, monthsNum, startDate, actualPayments, statuses, emi, monthlyRate, t.pending, t.paid]);

  // --- Handlers ---
  function handleGenericNumberInput(value: string, setter: (v: string | number) => void) {
    if (value === "" || /^\d*\.?\d*$/.test(value)) setter(value);
  }
  function handleActualPaidChange(month: number, value: string) {
    if (value === "") { setActualPayments(p => { const c = { ...p }; delete c[month]; return c; }); return; }
    if (/^\d*\.?\d*$/.test(value)) setActualPayments(p => ({ ...p, [month]: value }));
  }
  function handleStatusClick(month: number) {
    setStatuses(p => ({ ...p, [month]: p[month] === t.paid ? t.pending : t.paid }));
  }
  function handleNewLoan() {
    setBankName(""); setPrincipal(""); setAnnualRate(""); setMonths(""); setStartDate(new Date().toISOString().slice(0, 10)); setActualPayments({}); setStatuses({}); setCurrentFileId(null);
    showNotification("New loan calculation started.", 'info');
  }

  // --- File System ---
  function handleSaveFile() {
    const timestamp = Date.now();
    const fileName = `Loan Amortization - ${bankName || "Untitled"}`;
    const newFile: SavedFile = { id: timestamp.toString(), name: fileName, timestamp, data: { bankName, principal, annualRate, months, startDate, actualPayments, statuses } };
    setSavedFiles(p => [newFile, ...p]);
    setCurrentFileId(newFile.id);
    showNotification("File saved successfully!", 'success');
  }
  function handleUpdateFile() {
      if (!currentFileId) return;
      setSavedFiles(p => p.map(f => f.id === currentFileId ? { ...f, timestamp: Date.now(), data: { bankName, principal, annualRate, months, startDate, actualPayments, statuses } } : f));
      showNotification("File updated successfully!", 'success');
  }
  function handleUnifiedSave() {
    if (currentFileId) handleUpdateFile();
    else handleSaveFile();
  }
  function handleLoadFile(file: SavedFile) {
    if (file.deletedAt) return;
    setBankName(file.data.bankName); setPrincipal(file.data.principal); setAnnualRate(file.data.annualRate); setMonths(file.data.months); setStartDate(file.data.startDate); setActualPayments(file.data.actualPayments || {}); setStatuses(file.data.statuses || {});
    setCurrentFileId(file.id);
    showNotification(`Loaded: ${file.name}`, 'success');
    setShowFileDrawer(false);
  }
  function handleSoftDeleteFile(id: string, e: React.MouseEvent) {
    e.stopPropagation(); setSavedFiles(p => p.map(f => f.id === id ? { ...f, deletedAt: Date.now() } : f));
    if (id === currentFileId) setCurrentFileId(null);
    showNotification("File moved to Deleted History.", 'info');
  }
  function handleRestoreFile(id: string, e: React.MouseEvent) {
    e.stopPropagation(); setSavedFiles(p => p.map(f => f.id === id ? { ...f, deletedAt: undefined } : f));
    showNotification("File restored.", 'success');
  }
  function handlePermanentDeleteFile(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    if (window.confirm("Delete permanently?")) { setSavedFiles(p => p.filter(f => f.id !== id)); showNotification("Deleted forever.", 'error'); }
  }
  function startRenaming(file: SavedFile, e: React.MouseEvent) { e.stopPropagation(); setEditingNameId(file.id); setTempName(file.name); }
  function saveRenaming(id: string) { setSavedFiles(p => p.map(f => f.id === id ? { ...f, name: tempName } : f)); setEditingNameId(null); }

  const activeFilesList = useMemo(() => savedFiles.filter(f => !f.deletedAt), [savedFiles]);
  const summaryTotals = useMemo(() => {
    let pSum = 0;
    let rSum = 0;
    activeFilesList.forEach(file => {
      const p = Number(file.data.principal) || 0;
      pSum += p;
      const r = Number(file.data.annualRate) || 0;
      const m = Number(file.data.months) || 0;
      const mRate = r / 12 / 100;
      const emiVal = mRate === 0 ? p / m : (p * mRate * Math.pow(1 + mRate, m)) / (Math.pow(1 + mRate, m) - 1);
      
      let balance = p;
      let unpaidFound = false;
      for (let i = 1; i <= m; i++) {
        const statusVal = file.data.statuses?.[i];
        const isPaid = Object.values(translations).some(tr => tr.paid === statusVal) || statusVal === "Paid";
        if (isPaid) {
          const userVal = file.data.actualPayments?.[i];
          const paidAmt = (userVal !== undefined && userVal !== "") ? Number(userVal) : emiVal;
          const interest = balance * mRate;
          const principalPaid = Math.max(0, paidAmt - interest);
          balance = Math.max(0, balance - principalPaid);
        } else {
          rSum += balance;
          unpaidFound = true;
          break;
        }
        if (balance <= 0) break;
      }
      if (!unpaidFound && balance > 0) rSum += balance;
    });
    return { pSum, rSum };
  }, [activeFilesList, translations]);

  // --- Auth Handlers ---
  function findUserByPhone(fullPhone: string): UserData | undefined {
    return Object.values(users).find(u => u.phone === fullPhone);
  }

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    let user: UserData | undefined;
    let foundKey: string | undefined;

    if (loginMethod === "EMAIL") {
        if (!email) { showNotification("Please provide email", 'error'); return; }
        if (users[email]) {
            user = users[email];
            foundKey = email;
        }
    } else {
        if (!phone) { showNotification("Please provide phone number", 'error'); return; }
        const fullPhone = countryCode + phone;
        user = findUserByPhone(fullPhone);
        if(user) foundKey = user.email || user.phone;
    }

    if (user && user.password === password) {
      localStorage.setItem("currentSessionUser", foundKey!);
      setCurrentUserKey(foundKey!);
      setIsLoggedIn(true);
      showNotification("Login successful!", 'success');
      setEmail(""); setPassword(""); setPhone("");
    } else {
      showNotification("Invalid credentials.", 'error');
    }
  }

  function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (!firstName || !lastName) { showNotification("First & Last Name required", 'error'); return; }
    if (!email && !phone) { showNotification(t.emailOrPhoneRequired, 'error'); return; }
    if (!password || !pin) { showNotification("Password and PIN required", 'error'); return; }
    if (password !== retype) { showNotification("Passwords do not match", 'error'); return; }
    if (pin.length !== 4 || isNaN(Number(pin))) { showNotification("PIN must be 4 digits", 'error'); return; }
    if (pin !== retypePin) { showNotification("PINs do not match", 'error'); return; }
    
    if (email && users[email]) {
      showNotification("Email already registered.", 'error'); return;
    }
    const fullPhone = phone ? countryCode + phone : "";
    if (fullPhone && findUserByPhone(fullPhone)) {
      showNotification("Phone already registered.", 'error'); return;
    }

    const primaryKey = email || fullPhone;
    const newUser: UserData = { firstName, lastName, email, phone: fullPhone, password, pin };
    setUsers(prev => ({ ...prev, [primaryKey]: newUser }));
    
    showNotification("Account created! Login now.", 'success');
    setAuthMode("LOGIN"); setPassword(""); setRetype(""); setPin(""); setRetypePin(""); setFirstName(""); setLastName("");
  }
  
  function handleForgotPasswordSubmit(e: React.FormEvent) {
      e.preventDefault();
      if (forgotStep === "METHOD_SELECT" || forgotStep === "VERIFY_USER") {
          let user: UserData | undefined;
          if (forgotMethod === "EMAIL") {
             if(users[email]) { user = users[email]; }
          } else {
             const fullPhone = countryCode + phone;
             user = findUserByPhone(fullPhone);
          }
          if (user) setForgotStep("PIN");
          else showNotification(t.userNotFound, 'error');
      } 
      else if (forgotStep === "PIN") {
          let user: UserData | undefined;
           if (forgotMethod === "EMAIL") user = users[email];
           else user = findUserByPhone(countryCode + phone);

          if (user && user.pin === pin) setForgotStep("RESET");
          else showNotification(t.invalidPin, 'error');
      } 
      else if (forgotStep === "RESET") {
          if (password !== retype) { showNotification("Passwords do not match", 'error'); return; }
          let uKey = forgotMethod === "EMAIL" ? email : (findUserByPhone(countryCode + phone)?.email || (countryCode+phone));
          if(uKey) {
            setUsers(prev => ({ ...prev, [uKey]: { ...prev[uKey], password: password } }));
            showNotification("Password reset successfully.", 'success');
            setAuthMode("LOGIN"); setForgotStep("METHOD_SELECT");
            setPassword(""); setRetype(""); setPin("");
          }
      }
  }

  function handleChangePin(e: React.FormEvent) {
      e.preventDefault();
      if(!currentUserKey) return;
      if(newPinInput.length !== 4 || isNaN(Number(newPinInput)) || newPinInput !== retypePin) {
          showNotification("Invalid New PIN", 'error'); return;
      }
      setUsers(prev => ({ ...prev, [currentUserKey]: { ...prev[currentUserKey], pin: newPinInput } }));
      showNotification(t.pinChanged, 'success');
      setShowChangePin(false); setNewPinInput(""); setRetypePin("");
  }

  function handleChangePassword(e: React.FormEvent) {
      e.preventDefault();
      if(!currentUserKey) return;
      if(newPasswordInput !== retypePasswordInput) {
          showNotification("Passwords do not match", 'error'); return;
      }
      if(!newPasswordInput) {
          showNotification("Password cannot be empty", 'error'); return;
      }
      setUsers(prev => ({ ...prev, [currentUserKey]: { ...prev[currentUserKey], password: newPasswordInput } }));
      showNotification(t.passwordChanged, 'success');
      setShowChangePassword(false); setNewPasswordInput(""); setRetypePasswordInput("");
  }

  function handleChangePhone(e: React.FormEvent) {
      e.preventDefault();
      if(!currentUserKey) return;
      const fullPhone = newPhoneCode + newPhoneInput;
      if(newPhoneInput.length < 5) {
          showNotification("Invalid phone number", 'error'); return;
      }
      const existingUser = findUserByPhone(fullPhone);
      if(existingUser) {
          showNotification("Phone number already registered", 'error'); return;
      }
      setUsers(prev => ({ ...prev, [currentUserKey]: { ...prev[currentUserKey!], phone: fullPhone } }));
      showNotification(t.phoneChanged, 'success');
      setShowChangePhone(false); setNewPhoneInput("");
  }

  function handleLogout() {
    localStorage.removeItem("currentSessionUser");
    setIsLoggedIn(false); setCurrentUserKey(null);
    showNotification("Logged out.", 'info');
  }

  function downloadExcel() {
    const w = window as any;
    if (!libsLoaded || !w.XLSX) return;
    const data = schedule.map(r => ({ [t.monthHeader]: r.month, [t.dateHeader]: r.date, [t.begBalanceHeader]: r.beginningBalanceRounded, [t.interestHeader]: r.interestRounded, [t.principalHeader]: r.principalPaidRounded, [t.emi]: r.scheduledEmiRounded, [t.reqPaymentHeader]: r.requiredFinalRounded, [t.actualPaid]: r.actualPaidRounded === "" ? r.scheduledEmiRounded : r.actualPaidRounded, [t.status]: r.status }));
    const ws = w.XLSX.utils.json_to_sheet(data, { origin: "A2" });
    w.XLSX.utils.sheet_add_aoa(ws, [[`${t.bankName}: ${bankName}`]], { origin: "A1" });
    const wb = w.XLSX.utils.book_new(); w.XLSX.utils.book_append_sheet(wb, ws, "Schedule");
    w.XLSX.writeFile(wb, `Loan_${bankName || 'Schedule'}.xlsx`);
  }

  function downloadPDF() {
    const w = window as any;
    if (!libsLoaded || !w.jspdf) return;
    const doc = new w.jspdf.jsPDF({ unit: "pt", orientation: "landscape" });
    doc.setFontSize(12); doc.text("Loan Amortization", 40, 40); doc.setFontSize(10); doc.text(`${t.bankName}: ${bankName}`, 40, 55);
    doc.autoTable({ startY: 65, head: [[t.monthHeader, t.dateHeader, t.begBalanceHeader, t.interestHeader, t.principalHeader, t.emi, t.reqPaymentHeader, t.actualPaid, t.status]], body: schedule.map(r => [r.month, r.date, formatCurrency(r.beginningBalanceRounded), formatCurrency(r.interestRounded), formatCurrency(r.principalPaidRounded), formatCurrency(r.scheduledEmiRounded), formatCurrency(r.requiredFinalRounded), formatCurrency(r.actualPaidRounded === "" ? r.scheduledEmiRounded : r.actualPaidRounded), r.status]), styles: { fontSize: 8 }, headStyles: { fontStyle: 'bold' } });
    doc.save(`Loan_${bankName || 'Schedule'}.pdf`);
  }

  // --- Render ---
  
  if (!isLoggedIn) {
    const bg = theme === 'dark' ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 to-indigo-100';
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center p-4 font-sans ${bg} ${theme === 'dark' ? 'dark' : ''}`}>
        <Notification />
        <LanguageModal isOpen={showLanguageModal} onClose={() => setShowLanguageModal(false)} onSelect={setLang} currentLang={lang} searchPlaceholder={t.searchCountry} selectTitle={t.selectLanguage} noResults={t.noResults} />

        <div className="w-full max-w-md bg-white/95 rounded-2xl shadow-2xl p-8 relative dark:bg-gray-800/95 dark:text-gray-100 backdrop-blur-sm border border-white/20">
          <button onClick={() => setShowLanguageModal(true)} className="absolute right-4 top-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-2xl transition-all" title="Select Language">🌐</button>
          
          <h2 className="text-2xl font-bold text-center mb-6 text-gray-900 dark:text-white">
            {authMode === "LOGIN" && t.login}
            {authMode === "REGISTER" && t.register}
            {authMode === "FORGOT_PASSWORD" && t.resetPassword}
          </h2>

          {authMode === "LOGIN" && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="flex rounded-lg bg-gray-100 p-1 mb-4 dark:bg-gray-700">
                  <button type="button" onClick={() => setLoginMethod("EMAIL")} className={`flex-1 py-1 text-sm rounded-md transition-colors ${loginMethod === "EMAIL" ? 'bg-white shadow text-blue-600 font-semibold dark:bg-gray-600 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>{t.email}</button>
                  <button type="button" onClick={() => setLoginMethod("PHONE")} className={`flex-1 py-1 text-sm rounded-md transition-colors ${loginMethod === "PHONE" ? 'bg-white shadow text-blue-600 font-semibold dark:bg-gray-600 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>{t.phone}</button>
              </div>

              {loginMethod === "EMAIL" ? (
                  <input type="email" placeholder={t.email} value={email} onChange={e => setEmail(e.target.value)} required className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none bg-white text-black dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
              ) : (
                  <div className="flex gap-2">
                      <CountrySelector selectedCode={countryCode} onChange={setCountryCode} placeholder={t.searchCountry} />
                      <input type="tel" placeholder={t.phone} value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, ''))} required className="flex-1 p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none bg-white text-black dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                  </div>
              )}

              <PasswordInput placeholder={t.enterPassPlaceholder} value={password} onChange={(e: any) => setPassword(e.target.value)} required className="p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none bg-white text-black dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
              
              <div className="flex justify-end"><button type="button" onClick={() => { setAuthMode("FORGOT_PASSWORD"); setForgotStep("METHOD_SELECT"); }} className="text-sm text-blue-600 hover:underline dark:text-blue-400">{t.forgotPassword}</button></div>
              <button type="submit" className="w-full bg-blue-600 text-white p-3 rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-md">{t.login}</button>
              <div className="text-center mt-4"><button type="button" onClick={() => { setAuthMode("REGISTER"); setEmail(""); setPhone(""); }} className="text-blue-600 text-sm hover:underline dark:text-blue-400">{t.createNew}</button></div>
            </form>
          )}

          {authMode === "REGISTER" && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                  <input type="text" placeholder={t.firstName} value={firstName} onChange={e => setFirstName(e.target.value)} required className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none bg-white text-black dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                  <input type="text" placeholder={t.lastName} value={lastName} onChange={e => setLastName(e.target.value)} required className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none bg-white text-black dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
              </div>
              <input type="email" placeholder={t.email} value={email} onChange={e => setEmail(e.target.value)} className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none bg-white text-black dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
              <div className="flex gap-2">
                  <CountrySelector selectedCode={countryCode} onChange={setCountryCode} placeholder={t.searchCountry} />
                  <input type="tel" placeholder={t.phone} value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, ''))} className="flex-1 p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none bg-white text-black dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
              </div>
              <PasswordInput placeholder={t.enterPassPlaceholder} value={password} onChange={(e: any) => setPassword(e.target.value)} required className="p-3 rounded-lg border border-gray-300 outline-none bg-white text-black dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
              <PasswordInput placeholder={t.enterRetypePlaceholder} value={retype} onChange={(e: any) => setRetype(e.target.value)} required className="p-3 rounded-lg border border-gray-300 outline-none bg-white text-black dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
              <div className="grid grid-cols-2 gap-4">
                  <PasswordInput maxLength={4} placeholder={t.enterPinPlaceholder} value={pin} onChange={(e: any) => setPin(e.target.value.replace(/\D/g, ''))} required className="p-3 rounded-lg border border-gray-300 outline-none bg-white text-black dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                  <PasswordInput maxLength={4} placeholder={t.retypePin} value={retypePin} onChange={(e: any) => setRetypePin(e.target.value.replace(/\D/g, ''))} required className="p-3 rounded-lg border border-gray-300 outline-none bg-white text-black dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white p-3 rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-md">{t.register}</button>
              <div className="text-center mt-2"><button type="button" onClick={() => setAuthMode("LOGIN")} className="text-blue-600 text-sm hover:underline dark:text-blue-400">{t.backToLogin}</button></div>
            </form>
          )}

          {authMode === "FORGOT_PASSWORD" && (
             <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                {(forgotStep === "METHOD_SELECT" || forgotStep === "VERIFY_USER") && (
                    <>
                        <div className="flex rounded-lg bg-gray-100 p-1 mb-4 dark:bg-gray-700">
                            <button type="button" onClick={() => setForgotMethod("EMAIL")} className={`flex-1 py-1 text-sm rounded-md transition-colors ${forgotMethod === "EMAIL" ? 'bg-white shadow text-blue-600 font-semibold dark:bg-gray-600 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>{t.useEmail}</button>
                            <button type="button" onClick={() => setForgotMethod("PHONE")} className={`flex-1 py-1 text-sm rounded-md transition-colors ${forgotMethod === "PHONE" ? 'bg-white shadow text-blue-600 font-semibold dark:bg-gray-600 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>{t.usePhone}</button>
                        </div>
                        {forgotMethod === "EMAIL" ? (
                            <input type="email" placeholder={t.enterEmail} value={email} onChange={e => setEmail(e.target.value)} required className="w-full p-3 rounded-lg border border-gray-300 bg-white text-black dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                        ) : (
                            <div className="flex gap-2">
                                <CountrySelector selectedCode={countryCode} onChange={setCountryCode} placeholder={t.searchCountry} />
                                <input type="tel" placeholder={t.enterPhone} value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, ''))} required className="flex-1 p-3 rounded-lg border border-gray-300 bg-white text-black dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                            </div>
                        )}
                        <button type="submit" className="w-full bg-blue-600 text-white p-3 rounded-lg font-bold hover:bg-blue-700 shadow-md">{t.next}</button>
                    </>
                )}
                {forgotStep === "PIN" && (
                    <>
                        <p className="text-sm text-center text-gray-700 dark:text-gray-300">{t.enterPin}</p>
                        <PasswordInput maxLength={4} placeholder="PIN" value={pin} onChange={(e: any) => setPin(e.target.value.replace(/\D/g, ''))} required className="p-3 rounded-lg border border-gray-300 text-center tracking-[1em] bg-white text-black dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                        <button type="submit" className="w-full bg-blue-600 text-white p-3 rounded-lg font-bold hover:bg-blue-700 shadow-md">{t.verify}</button>
                    </>
                )}
                {forgotStep === "RESET" && (
                    <>
                         <PasswordInput placeholder={t.newPin} value={password} onChange={(e: any) => setPassword(e.target.value)} required className="p-3 rounded-lg border border-gray-300 bg-white text-black dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                         <PasswordInput placeholder={t.retype} value={retype} onChange={(e: any) => setRetype(e.target.value)} required className="p-3 rounded-lg border border-gray-300 bg-white text-black dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                         <button type="submit" className="w-full bg-green-600 text-white p-3 rounded-lg font-bold hover:bg-green-700 shadow-md">{t.submit}</button>
                    </>
                )}
                <div className="text-center mt-2"><button type="button" onClick={() => { setAuthMode("LOGIN"); setForgotStep("METHOD_SELECT"); }} className="text-blue-600 text-sm hover:underline dark:text-blue-400">{t.backToLogin}</button></div>
             </form>
          )}

          <div className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400 border-t pt-4 dark:border-gray-700">
             <p>{t.designedBy}</p>
             <p>{t.contact}: aryaldipesh248@gmail.com</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-4 sm:p-6 font-sans ${theme === 'dark' ? 'bg-gray-900 text-gray-100 dark' : 'bg-gradient-to-br from-blue-50 to-indigo-100 text-gray-800'}`}>
      <Notification />
      <LanguageModal isOpen={showLanguageModal} onClose={() => setShowLanguageModal(false)} onSelect={setLang} currentLang={lang} searchPlaceholder={t.searchCountry} selectTitle={t.selectLanguage} noResults={t.noResults} />
      
      {/* Floating Action Group (Minimalist Icons Only, Vertical) */}
      <div className="fixed bottom-8 right-6 z-40 flex flex-col gap-3">
            {/* Unified Save/Update Button (Top) */}
            <button 
                onClick={handleUnifiedSave} 
                title={currentFileId ? t.updateFile : t.saveFile}
                className={`w-14 h-14 flex items-center justify-center text-white font-bold rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all ${currentFileId ? 'bg-orange-500' : 'bg-green-600'}`}
            >
                {currentFileId ? <span className="text-2xl">🔄</span> : <span className="text-2xl">💾</span>}
            </button>

            {/* New Loan Button */}
            <button 
                onClick={handleNewLoan} 
                title={t.newLoan}
                className="w-14 h-14 flex items-center justify-center bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all border border-blue-100 dark:border-blue-900"
            >
                <span className="text-2xl">➕</span>
            </button>

            {/* Saved Files Button */}
            <button 
                onClick={() => setShowFileDrawer(true)} 
                title={t.savedFilesTitle}
                className="w-14 h-14 flex items-center justify-center bg-blue-600 text-white rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all"
            >
                <FileIcon />
            </button>
      </div>

      {/* Settings Drawer */}
      {showSettingsDrawer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowSettingsDrawer(false)}></div>
            <div className="relative bg-white w-full max-w-sm rounded-xl shadow-2xl p-6 dark:bg-gray-800 dark:text-gray-100">
                <div className="flex justify-between items-center mb-6 border-b pb-4 dark:border-gray-700">
                    <h2 className="text-xl font-bold flex items-center gap-2"><SettingsIcon/> {t.settingsTitle}</h2>
                    <button onClick={() => setShowSettingsDrawer(false)} className="text-2xl hover:text-red-500 transition-colors">&times;</button>
                </div>
                
                {!showChangePin && !showChangePassword && !showChangePhone && currentUserKey && users[currentUserKey] && (
                    <div className="mb-6 flex flex-col items-center p-4 bg-blue-50 dark:bg-gray-700 rounded-lg">
                        <UserIcon />
                        <h2 className="mt-2 text-lg font-bold text-gray-900 dark:text-white">
                            {users[currentUserKey].firstName || "User"} {users[currentUserKey].lastName || ""}
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{users[currentUserKey].email || users[currentUserKey].phone}</p>
                    </div>
                )}

                {!showChangePin && !showChangePassword && !showChangePhone ? (
                    <div className="space-y-3">
                        <div className="p-3 bg-gray-50 rounded-lg dark:bg-gray-700">
                            <label className="block text-xs font-bold mb-1">{t.language}</label>
                            <button onClick={() => { setShowSettingsDrawer(false); setShowLanguageModal(true); }} className="w-full p-2 rounded border bg-white dark:bg-gray-600 text-left flex justify-between items-center transition-colors hover:border-blue-400">
                              <span className="text-xs text-black dark:text-white">{LANGUAGES_LIST.find(l => l.code === lang)?.native}</span>
                              <span className="text-xs">🌐</span>
                            </button>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg flex justify-between items-center dark:bg-gray-700">
                            <span className="font-bold text-xs">{theme === 'dark' ? t.dark : t.light}</span>
                            <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} className={`w-10 h-5 rounded-full p-1 transition-colors ${theme === 'dark' ? 'bg-blue-600' : 'bg-gray-300'}`}><div className={`w-3 h-3 rounded-full bg-white transition-transform ${theme === 'dark' ? 'translate-x-5' : ''}`}></div></button>
                        </div>
                        <button onClick={() => setShowChangePassword(true)} className="w-full p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors shadow-sm text-sm">{t.changePassword}</button>
                        <button onClick={() => setShowChangePin(true)} className="w-full p-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors shadow-sm text-sm">{t.changePin}</button>
                        <button onClick={() => setShowChangePhone(true)} className="w-full p-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors shadow-sm text-sm">{t.changePhone}</button>
                    </div>
                ) : showChangePin ? (
                    <form onSubmit={handleChangePin} className="space-y-4">
                         <h3 className="font-bold">{t.changePin}</h3>
                         <PasswordInput maxLength={4} placeholder={t.newPin} value={newPinInput} onChange={(e: any) => setNewPinInput(e.target.value.replace(/\D/g, ''))} className="p-3 rounded-lg border bg-white text-black dark:bg-gray-700 dark:text-white" required />
                         <PasswordInput maxLength={4} placeholder={t.retypePin} value={retypePin} onChange={(e: any) => setRetypePin(e.target.value.replace(/\D/g, ''))} className="p-3 rounded-lg border bg-white text-black dark:bg-gray-700 dark:text-white" required />
                         <div className="flex gap-2"><button type="button" onClick={() => setShowChangePin(false)} className="flex-1 bg-gray-300 p-3 rounded-lg text-black hover:bg-gray-400 transition-colors">{t.back}</button><button type="submit" className="flex-1 bg-green-600 text-white p-3 rounded-lg hover:bg-green-700 transition-colors">{t.saveBtn}</button></div>
                    </form>
                ) : showChangePassword ? (
                    <form onSubmit={handleChangePassword} className="space-y-4">
                         <h3 className="font-bold">{t.changePassword}</h3>
                         <PasswordInput placeholder={t.enterNewPass} value={newPasswordInput} onChange={(e: any) => setNewPasswordInput(e.target.value)} className="p-3 rounded-lg border bg-white text-black dark:bg-gray-700 dark:text-white" required />
                         <PasswordInput placeholder={t.retype} value={retypePasswordInput} onChange={(e: any) => setRetypePasswordInput(e.target.value)} className="p-3 rounded-lg border bg-white text-black dark:bg-gray-700 dark:text-white" required />
                         <div className="flex gap-2"><button type="button" onClick={() => setShowChangePassword(false)} className="flex-1 bg-gray-300 p-3 rounded-lg text-black hover:bg-gray-400 transition-colors">{t.back}</button><button type="submit" className="flex-1 bg-green-600 text-white p-3 rounded-lg hover:bg-green-700 transition-colors">{t.saveBtn}</button></div>
                    </form>
                ) : (
                    <form onSubmit={handleChangePhone} className="space-y-4">
                        <h3 className="font-bold">{t.changePhone}</h3>
                        <div className="flex gap-2">
                            <CountrySelector selectedCode={newPhoneCode} onChange={setNewPhoneCode} placeholder={t.searchCountry} />
                            <input type="tel" placeholder={t.newPhone} value={newPhoneInput} onChange={e => setNewPhoneInput(e.target.value.replace(/\D/g, ''))} required className="flex-1 p-3 rounded-lg border border-gray-300 bg-white text-black dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                        </div>
                        <div className="flex gap-2"><button type="button" onClick={() => setShowChangePhone(false)} className="flex-1 bg-gray-300 p-3 rounded-lg text-black hover:bg-gray-400 transition-colors">{t.back}</button><button type="submit" className="flex-1 bg-green-600 text-white p-3 rounded-lg hover:bg-green-700 transition-colors">{t.saveBtn}</button></div>
                    </form>
                )}
            </div>
        </div>
      )}

      {/* File Drawer */}
      {showFileDrawer && (
        <div className="fixed inset-0 z-50 flex justify-end">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowFileDrawer(false)}></div>
            <div className="relative bg-white w-full max-w-sm h-full p-6 dark:bg-gray-800 dark:text-gray-100 flex flex-col shadow-2xl">
                <div className="flex justify-between items-center mb-4"><h2 className="text-xl font-bold">{viewDeleted ? t.recycleBinTitle : t.savedFilesTitle}</h2><button onClick={() => setShowFileDrawer(false)} className="text-2xl hover:text-red-500 transition-colors">&times;</button></div>
                <div className="flex mb-4 border rounded-lg overflow-hidden dark:border-gray-700"><button onClick={() => setViewDeleted(false)} className={`flex-1 p-2 transition-colors ${!viewDeleted ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'}`}>{t.savedFiles}</button><button onClick={() => setViewDeleted(true)} className={`flex-1 p-2 transition-colors ${viewDeleted ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'}`}>🗑 {t.recycleBin}</button></div>
                
                {!viewDeleted && activeFilesList.length > 0 && (
                  <div className="mb-6 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800 shadow-sm animate-fade-in">
                      <div className="flex justify-between items-center mb-2 pb-2 border-b border-blue-100/50 dark:border-blue-800/50">
                          <span className="text-xs font-bold text-blue-800 dark:text-blue-300 uppercase tracking-tighter">{t.totalLoanAmount}</span>
                          <span className="text-sm font-black text-blue-900 dark:text-white">{formatCurrency(summaryTotals.pSum)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-green-800 dark:text-green-300 uppercase tracking-tighter">{t.totalRemaining}</span>
                          <span className="text-sm font-black text-green-900 dark:text-white">{formatCurrency(summaryTotals.rSum)}</span>
                      </div>
                  </div>
                )}

                <div className="space-y-3 flex-1 overflow-y-auto">
                    {savedFiles.filter(f => viewDeleted ? !!f.deletedAt : !f.deletedAt).length === 0 ? <p className="text-center text-gray-500 mt-10">{viewDeleted ? t.noDeletedFiles : t.noSavedFiles}</p> : 
                    savedFiles.filter(f => viewDeleted ? !!f.deletedAt : !f.deletedAt).sort((a,b) => b.timestamp - a.timestamp).map(file => (
                        <div key={file.id} onClick={() => !viewDeleted && handleLoadFile(file)} className={`border rounded-lg p-3 cursor-pointer group hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700 ${viewDeleted ? 'border-red-200' : ''} transition-all shadow-sm`}>
                             <div className="flex justify-between">
                                 <div className="flex-1">
                                    {editingNameId === file.id ? <div className="flex gap-1" onClick={e => e.stopPropagation()}><input value={tempName} onChange={e => setTempName(e.target.value)} className="w-full border p-1 rounded text-sm bg-white text-black dark:bg-gray-600 dark:text-white focus:ring-1 focus:ring-blue-500 outline-none" autoFocus /><button onClick={() => saveRenaming(file.id)} className="text-green-600 hover:text-green-700 font-bold">✓</button></div> : 
                                    <h3 className="font-semibold text-gray-900 dark:text-white truncate max-w-[200px]">{file.name} {!viewDeleted && <span onClick={e => startRenaming(file, e)} className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-blue-500 text-xs ml-2 transition-all">✎</span>}</h3>}
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(file.timestamp).toLocaleDateString()}</p>
                                 </div>
                                 <div className="flex flex-col gap-1 pl-2">
                                     {viewDeleted ? <><button onClick={e => handleRestoreFile(file.id, e)} className="text-xs text-green-600 font-bold hover:scale-110 transition-transform" title={t.restore}>♻</button><button onClick={e => handlePermanentDeleteFile(file.id, e)} className="text-xs text-red-600 font-bold hover:scale-110 transition-transform" title={t.deletePerm}>✕</button></> : <button onClick={e => handleSoftDeleteFile(file.id, e)} className="text-red-400 hover:text-red-600 transition-colors">🗑</button>}
                                 </div>
                             </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-6xl mx-auto bg-white/90 rounded-2xl shadow-xl border border-white/20 p-4 sm:p-8 dark:bg-gray-800/90 dark:border-gray-700">
         <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
             <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Loan Amortization</h1>
             <div className="flex gap-2">
                 <button onClick={() => setShowSettingsDrawer(true)} className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 transition-colors shadow-sm" title={t.settings}><SettingsIcon/></button>
                 <button onClick={handleLogout} className="px-4 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 font-medium transition-colors shadow-sm">{t.logoutText}</button>
             </div>
         </div>

         <div className="flex flex-col lg:flex-row gap-6 mb-8 items-start">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-gray-50 p-6 rounded-xl dark:bg-gray-700/50 border border-gray-100 dark:border-gray-600 flex-1 shadow-inner w-full">
                <label className="flex flex-col text-sm font-medium text-gray-600 dark:text-gray-300 gap-1">{t.bankName}<input value={bankName} onChange={e => setBankName(e.target.value)} className="p-2 rounded border bg-white text-black border-gray-300 dark:bg-gray-600 dark:border-gray-500 dark:text-white focus:ring-1 focus:ring-blue-500 outline-none transition-all" /></label>
                <label className="flex flex-col text-sm font-medium text-gray-600 dark:text-gray-300 gap-1">{t.principal}<input inputMode="decimal" value={principal} onChange={e => handleGenericNumberInput(e.target.value, setPrincipal)} className="p-2 rounded border bg-white text-black border-gray-300 dark:bg-gray-600 dark:border-gray-500 dark:text-white focus:ring-1 focus:ring-blue-500 outline-none transition-all" /></label>
                <label className="flex flex-col text-sm font-medium text-gray-600 dark:text-gray-300 gap-1">{t.rate}<input inputMode="decimal" value={annualRate} onChange={e => handleGenericNumberInput(e.target.value, setAnnualRate)} className="p-2 rounded border bg-white text-black border-gray-300 dark:bg-gray-600 dark:border-gray-500 dark:text-white focus:ring-1 focus:ring-blue-500 outline-none transition-all" /></label>
                <label className="flex flex-col text-sm font-medium text-gray-600 dark:text-gray-300 gap-1">{t.months}<input inputMode="numeric" value={months} onChange={e => handleGenericNumberInput(e.target.value, setMonths)} className="p-2 rounded border bg-white text-black border-gray-300 dark:bg-gray-600 dark:border-gray-500 dark:text-white focus:ring-1 focus:ring-blue-500 outline-none transition-all" /></label>
            </div>
         </div>

         {/* Unified Summary Bar with Start Date relocated */}
         <div className="flex flex-col lg:flex-row gap-4 justify-between items-center mb-6 bg-blue-50 p-4 rounded-xl dark:bg-gray-700/50 border border-blue-100 dark:border-gray-600 shadow-sm transition-all hover:bg-blue-100/50">
             <div className="text-blue-800 dark:text-blue-200 text-lg font-medium whitespace-nowrap">
                {t.emi}: <span className="font-bold text-xl ml-2">{formatCurrency(Math.round(emi))}</span>
             </div>
             
             <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                 <div className="flex items-center gap-2 bg-white/50 dark:bg-gray-600/50 p-1.5 rounded-lg border border-blue-100 dark:border-blue-800 shadow-inner">
                    <span className="text-[10px] font-bold uppercase text-blue-600 dark:text-blue-400 tracking-wider ml-1">{t.startDate}:</span>
                    <CustomDatePicker value={startDate} onChange={setStartDate} isCompact={true} />
                 </div>

                 <div className="flex gap-2 w-full sm:w-auto">
                    <button onClick={downloadExcel} disabled={!libsLoaded} title={t.downloadExcel} className="flex-1 sm:flex-none bg-emerald-500 text-white px-3 py-2 rounded-lg hover:bg-emerald-600 disabled:opacity-50 shadow-sm font-medium transition-all text-sm flex items-center justify-center gap-1">
                        📊 <span className="hidden sm:inline">Excel</span>
                    </button>
                    <button onClick={downloadPDF} disabled={!libsLoaded} title={t.downloadPDF} className="flex-1 sm:flex-none bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 disabled:opacity-50 shadow-sm font-medium transition-all text-sm flex items-center justify-center gap-1">
                        📄 <span className="hidden sm:inline">PDF</span>
                    </button>
                 </div>
             </div>
         </div>

         <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm bg-white dark:bg-gray-800">
             <table className="w-full text-sm text-left">
                 <thead className="bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-300 font-bold uppercase tracking-wider">
                     <tr>
                         <th className="p-3">{t.monthHeader}</th><th className="p-3">{t.dateHeader}</th><th className="p-3 text-right">{t.begBalanceHeader}</th><th className="p-3 text-right">{t.interestHeader}</th>
                         <th className="p-3 text-right">{t.principalHeader}</th><th className="p-3 text-right">{t.emi}</th><th className="p-3 text-right">{t.reqPaymentHeader}</th><th className="p-3 text-center">{t.actualPaid}</th><th className="p-3 text-center">{t.status}</th>
                     </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                     {schedule.map(r => (
                         <tr key={r.month} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                             <td className="p-3 text-gray-700 dark:text-gray-200 font-medium">{r.month}</td><td className="p-3 text-gray-700 dark:text-gray-200">{r.date}</td>
                             <td className="p-3 text-right font-mono text-gray-700 dark:text-gray-200">{formatCurrency(r.beginningBalanceRounded)}</td><td className="p-3 text-right font-mono text-gray-700 dark:text-gray-200">{formatCurrency(r.interestRounded)}</td>
                             <td className="p-3 text-right font-mono text-gray-700 dark:text-gray-200">{formatCurrency(r.principalPaidRounded)}</td><td className="p-3 text-right font-mono text-gray-700 dark:text-gray-200">{formatCurrency(r.scheduledEmiRounded)}</td>
                             <td className="p-3 text-right font-mono text-gray-700 dark:text-gray-200 font-semibold">{formatCurrency(r.requiredFinalRounded)}</td>
                             <td className="p-2 text-center"><input inputMode="decimal" value={actualPayments[r.month] ?? ""} onChange={e => handleActualPaidChange(r.month, e.target.value)} className={`w-20 p-1 rounded text-center border focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all ${actualPayments[r.month] ? "border-blue-400 bg-blue-50 text-blue-900 dark:bg-blue-900/20 dark:text-white" : "bg-white text-black border-gray-300 dark:bg-gray-600 dark:border-gray-500 dark:text-gray-200"}`} /></td>
                             <td className="p-2 text-center"><button onClick={() => handleStatusClick(r.month)} className={`px-3 py-1 rounded-full text-xs font-bold transition-all shadow-sm ${statuses[r.month] === t.paid ? "bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/50 dark:text-green-200" : "bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900/50 dark:text-red-200"}`}>{statuses[r.month] === t.paid ? t.paid : t.pending}</button></td>
                         </tr>
                     ))}
                 </tbody>
             </table>
         </div>
      </div>
      <div className="mt-12 mb-20 text-center"><p className="text-xs text-gray-400">{t.designedBy}</p><p className="text-xs text-gray-400 mt-1">{t.contact}: aryaldipesh248@gmail.com</p></div>
    </div>
  );
}
