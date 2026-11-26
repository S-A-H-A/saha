import { IvacCenterInfo, VisaStatusCategory } from "../types/visa";

export const IVAC_CENTERS: IvacCenterInfo[] = [
  {
    prefix: "BGDD",
    name: "IVAC Dhaka (Jamuna Future Park)",
    shortName: "Dhaka (JFP)",
    city: "Dhaka",
    division: "Dhaka",
    address: "Level G, Jamuna Future Park, Kuril, Pragati Sarani, Dhaka 1229",
    hours: "Sun–Thu · 08:00 – 16:00",
  },
  {
    prefix: "BGDC",
    name: "IVAC Chittagong",
    shortName: "Chittagong",
    city: "Chattogram",
    division: "Chattogram",
    address: "2111 Zakir Hossain Road, East Nasirabad, Chattogram 4000",
    hours: "Sun–Thu · 08:30 – 16:00",
  },
  {
    prefix: "BGDS",
    name: "IVAC Sylhet",
    shortName: "Sylhet",
    city: "Sylhet",
    division: "Sylhet",
    address: "Nirer Pukur Par, Mendibagh, Sylhet 3100",
    hours: "Sun–Thu · 08:30 – 16:00",
  },
  {
    prefix: "BGDR",
    name: "IVAC Rajshahi",
    shortName: "Rajshahi",
    city: "Rajshahi",
    division: "Rajshahi",
    address: "House 280/3, East Terakhadia, Rajpara, Rajshahi 6000",
    hours: "Sun–Thu · 08:30 – 16:00",
  },
  {
    prefix: "BGDK",
    name: "IVAC Khulna",
    shortName: "Khulna",
    city: "Khulna",
    division: "Khulna",
    address: "75 KDA Avenue, Shibbari More, Khulna 9100",
    hours: "Sun–Thu · 08:30 – 16:00",
  },
  {
    prefix: "BGDP",
    name: "IVAC Khulna (Alt Prefix)",
    shortName: "Khulna",
    city: "Khulna",
    division: "Khulna",
    address: "75 KDA Avenue, Shibbari More, Khulna 9100",
    hours: "Sun–Thu · 08:30 – 16:00",
  },
  {
    prefix: "BGDB",
    name: "IVAC Barishal",
    shortName: "Barishal",
    city: "Barishal",
    division: "Barishal",
    address: "Bogra Road, Alekanda, Barishal 8200",
    hours: "Sun–Thu · 08:30 – 15:30",
  },
  {
    prefix: "BGDJ",
    name: "IVAC Jashore",
    shortName: "Jashore",
    city: "Jashore",
    division: "Khulna",
    address: "Mk Road, Monihar Cinema Hall Area, Jashore 7400",
    hours: "Sun–Thu · 08:30 – 15:30",
  },
  {
    prefix: "BGDM",
    name: "IVAC Mymensingh",
    shortName: "Mymensingh",
    city: "Mymensingh",
    division: "Mymensingh",
    address: "21/A Maskanda, Mymensingh 2200",
    hours: "Sun–Thu · 08:30 – 15:30",
  },
  {
    prefix: "BGDN",
    name: "IVAC Noakhali",
    shortName: "Noakhali",
    city: "Maijdee",
    division: "Chattogram",
    address: "Main Road, Maijdee Court, Noakhali 3800",
    hours: "Sun–Thu · 08:30 – 15:30",
  },
  {
    prefix: "BGDT",
    name: "IVAC Thakurgaon",
    shortName: "Thakurgaon",
    city: "Thakurgaon",
    division: "Rangpur",
    address: "College Para, Thakurgaon Sadar, Thakurgaon 5100",
    hours: "Sun–Thu · 08:30 – 15:30",
  },
  {
    prefix: "BGDF",
    name: "IVAC Faridpur",
    shortName: "Faridpur",
    city: "Faridpur",
    division: "Dhaka",
    address: "Jiltuli, Faridpur Sadar, Faridpur 7800",
    hours: "Sun–Thu · 08:30 – 15:30",
  },
  {
    prefix: "BGDH",
    name: "IVAC Brahmanbaria",
    shortName: "Brahmanbaria",
    city: "Brahmanbaria",
    division: "Chattogram",
    address: "T.A. Road, Brahmanbaria 3400",
    hours: "Sun–Thu · 08:30 – 15:30",
  },
  {
    prefix: "BGDU",
    name: "IVAC Kushtia",
    shortName: "Kushtia",
    city: "Kushtia",
    division: "Khulna",
    address: "NS Road, Thanapara, Kushtia 7000",
    hours: "Sun–Thu · 08:30 – 15:30",
  },
  {
    prefix: "BGDL",
    name: "IVAC Bogura",
    shortName: "Bogura",
    city: "Bogura",
    division: "Rajshahi",
    address: "Sherpur Road, Sutrapur, Bogura 5800",
    hours: "Sun–Thu · 08:30 – 15:30",
  },
  {
    prefix: "BGDO",
    name: "IVAC Satkhira",
    shortName: "Satkhira",
    city: "Satkhira",
    division: "Khulna",
    address: "Khulna Road More, Satkhira 9400",
    hours: "Sun–Thu · 08:30 – 15:30",
  },
  {
    prefix: "BGDE",
    name: "IVAC Rangpur",
    shortName: "Rangpur",
    city: "Rangpur",
    division: "Rangpur",
    address: "Jail Road, Dhap, Rangpur 5400",
    hours: "Sun–Thu · 08:30 – 15:30",
  },
];

export function resolveIvacCenter(appId: string): IvacCenterInfo | null {
  if (!appId || appId.trim().length < 4) return null;
  const prefix = appId.trim().substring(0, 4).toUpperCase();
  return IVAC_CENTERS.find((c) => c.prefix === prefix) ?? null;
}

export function getBilingualVisaGuidance(category?: VisaStatusCategory): {
  enTitle: string;
  enDetail: string;
  bnDetail: string;
} {
  switch (category) {
    case "processed_printed":
      return {
        enTitle: "Visa Approved & Printed",
        enDetail:
          "Your Indian visa has been processed and printed onto your passport. Monitor the IVAC Delivery Tracker for 'Ready For Delivery' before visiting your center.",
        bnDetail:
          "আপনার ভিসা প্রসেস এবং প্রিন্ট সম্পন্ন হয়েছে (ভিসা হয়েছে)। পাসপোর্ট সংগ্রহের আগে আইভ্যাক ডেলিভারি ট্র্যাকারে 'Ready For Delivery' স্ট্যাটাস নিশ্চিত হয়ে সংশ্লিষ্ট অফিসে যোগাযোগ করুন।",
      };
    case "granted_not_printed":
      return {
        enTitle: "Granted (Awaiting Print)",
        enDetail:
          "Your visa application has been approved (Granted), and the sticker print queue is pending. Once printed, your passport will be dispatched back to IVAC.",
        bnDetail:
          "আপনার ভিসা অনুমোদন (Granted) করা হয়েছে, তবে এখনো প্রিন্ট সম্পন্ন হয়নি (Not-Printed)। ভিসা প্রিন্ট সম্পন্ন হলে পরবর্তী কর্মদিবসে পাসপোর্ট আইভ্যাকে পাঠানো হবে।",
      };
    case "under_processing":
      return {
        enTitle: "Under Consular Processing",
        enDetail:
          "Your application is actively under review at the Indian High Commission / Mission. Continue monitoring via live refresh.",
        bnDetail:
          "আপনার ভিসা অ্যাপ্লিকেশনটি বর্তমানে ভারতীয় হাইকমিশনে প্রক্রিয়াধীন (Under Processing) রয়েছে। নিয়মিত আপডেট দেখতে রিফ্রেশ করুন।",
      };
    case "attention_required":
      return {
        enTitle: "Contact Respective Office",
        enDetail:
          "The portal advises contacting your respective IVAC / Indian Mission office. Usually this indicates an ungranted passport or documentation query ready for pickup.",
        bnDetail:
          "অনুগ্রহ করে পরবর্তী কর্মদিবসে সংশ্লিষ্ট আইভ্যাক বা ভারতীয় ভিসা অফিসে যোগাযোগ করে আপনার পাসপোর্ট ও বিস্তারিত তথ্য সংগ্রহ করুন।",
      };
    case "closed":
      return {
        enTitle: "Application Closed",
        enDetail:
          "This file is marked Closed in the Visa Online database. Please contact the respective IVAC center on the next working day.",
        bnDetail:
          "আপনার ভিসা অ্যাপ্লিকেশনের স্ট্যাটাস 'Closed' হিসেবে প্রদর্শিত হচ্ছে। বিস্তারিত তথ্যের জন্য পরবর্তী কর্মদিবসে সংশ্লিষ্ট অফিসে যোগাযোগ করুন।",
      };
    case "not_found":
      return {
        enTitle: "Record Not Found",
        enDetail:
          "No matching record was found in the Indian Visa Online database. Double-check your 12-character Application ID and Passport Number.",
        bnDetail:
          "আপনার প্রদানকৃত তথ্যটি ভিসা পোর্টাল ডাটাবেজে পাওয়া যায়নি। অনুগ্রহ করে সঠিক ১২ অক্ষরের অ্যাপ্লিকেশন আইডি ও পাসপোর্ট নম্বর দিয়ে আবার চেষ্টা করুন।",
      };
    default:
      return {
        enTitle: "Status Retrieved",
        enDetail:
          "Official response retrieved from the Indian Visa Online Status Enquiry system.",
        bnDetail:
          "ভারতীয় ভিসা পোর্টাল থেকে প্রাপ্ত সর্বশেষ তথ্য উপরে প্রদর্শিত হয়েছে।",
      };
  }
}

export const TOURIST_VISA_REQUIREMENTS = {
  en: [
    {
      step: "01",
      title: "Original Passport",
      items: [
        "Minimum 6 months validity remaining from the application submission date.",
        "At least two blank pages available for visa endorsement.",
        "Submit all previous/old passports. If an old passport is lost, attach a GD copy, Lost Circular, and notarized affidavit.",
      ],
    },
    {
      step: "02",
      title: "Recent Photograph",
      items: [
        "One recent 2 inch × 2 inch (51mm × 51mm) color photograph on a plain white background.",
        "Must match the digital photo uploaded on the online visa application form.",
      ],
    },
    {
      step: "03",
      title: "Identity & Address Proof",
      items: [
        "Copy of National ID (NID) card or Birth Registration Certificate (for minors).",
        "Copy of a recent utility bill (electricity, gas, water, or telephone) from the last 3 months confirming current residence.",
      ],
    },
    {
      step: "04",
      title: "Financial Solvency",
      items: [
        "Last 6 months bank statement with bank seal and signature (recommended minimum closing balance BDT 20,000+ per applicant).",
        "Or an international credit/travel card with USD endorsement seal in the passport.",
      ],
    },
    {
      step: "05",
      title: "Profession Proof",
      items: [
        "Employed: NOC (No Objection Certificate) on company letterhead & office ID copy.",
        "Business owners: Updated Trade License copy.",
        "Students: Student ID card & school/university leave letter.",
      ],
    },
    {
      step: "06",
      title: "Online Application & IVAC VPF",
      items: [
        "Completed and signed Indian Visa Online application printed from indianvisaonline.gov.in.",
        "India charges zero visa fee for Bangladeshi passport holders; IVAC charges a Visa Processing Fee (VPF) of BDT 1,500 via the appointment portal.",
      ],
    },
  ],
  bn: [
    {
      step: "01",
      title: "মূল পাসপোর্ট",
      items: [
        "আবেদন জমা দেওয়ার তারিখ থেকে কমপক্ষে ৬ মাস মেয়াদ থাকতে হবে।",
        "ভিসা স্টিকার ও সিলের জন্য কমপক্ষে দুটি খালি পৃষ্ঠা থাকতে হবে।",
        "সকল পুরাতন পাসপোর্ট সাথে জমা দিতে হবে। পুরাতন পাসপোর্ট হারিয়ে গেলে জিডি কপি, লস্ট সার্কুলার ও এফিডেভিট জমা দিতে হবে।",
      ],
    },
    {
      step: "02",
      title: "সাম্প্রতিক পাসপোর্ট সাইজ ছবি",
      items: [
        "সাদা ব্যাকগ্রাউন্ডে তোলা ২ ইঞ্চি × ২ ইঞ্চি রঙিন ছবি (১ কপি)।",
        "ছবিটি অনলাইন আবেদনপত্রে আপলোড করা ছবির সাথে মিল থাকতে হবে।",
      ],
    },
    {
      step: "03",
      title: "পরিচয়পত্র ও ঠিকানার প্রমাণ",
      items: [
        "জাতীয় পরিচয়পত্র (NID) অথবা জন্ম নিবন্ধন সনদের ফটোকপি (অপ্রাপ্তবয়স্কদের জন্য)।",
        "বর্তমান ঠিকানা নিশ্চিত করার জন্য সর্বশেষ ৩ মাসের মধ্যে ইস্যুকৃত বিদ্যুৎ, গ্যাস, পানি বা টেলিফোন বিলের কপি।",
      ],
    },
    {
      step: "04",
      title: "আর্থিক সচ্ছলতার প্রমাণ",
      items: [
        "ব্যাংকের সিল ও স্বাক্ষরসহ সর্বশেষ ৬ মাসের ব্যাংক স্টেটমেন্ট (ন্যূনতম ২০,০০০+ টাকা ব্যালেন্স থাকা উত্তম)।",
        "অথবা পাসপোর্টে ডলার এন্ডোর্সমেন্ট সিলসহ আন্তর্জাতিক ক্রেডিট/ট্রাভেল কার্ড।",
      ],
    },
    {
      step: "05",
      title: "পেশাগত প্রমাণপত্র",
      items: [
        "চাকরিজীবী: অফিসের লেটারহেডে এনওসি (NOC) এবং অফিস আইডি কার্ডের কপি।",
        "ব্যবসায়ী: হালনাগাদ ট্রেড লাইসেন্সের কপি।",
        "শিক্ষার্থী: স্টুডেন্ট আইডি কার্ড এবং শিক্ষাপ্রতিষ্ঠানের ছুটির/অনুমতি পত্র।",
      ],
    },
    {
      step: "06",
      title: "অনলাইন আবেদন ও আইভ্যাক ভিপিএফ",
      items: [
        "indianvisaonline.gov.in থেকে পূরণকৃত ও স্বাক্ষরিত প্রিন্টেড আবেদন ফর্ম।",
        "বাংলাদেশি পাসপোর্টধারীদের জন্য ভারতের কোনো ভিসা ফি নেই; তবে আইভ্যাক প্রসেসিং ফি (VPF) ১,৫০০ টাকা অ্যাপয়েন্টমেন্ট পোর্টালের মাধ্যমে পরিশোধ করতে হয়।",
      ],
    },
  ],
};
