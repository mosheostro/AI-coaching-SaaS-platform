/** Single source of truth for founder / business contact info. */

export const FOUNDER = {
  name: "Moshe Ostrovsky",
  email: "Moshe.Svarga@gmail.com",
  phone: "+972 54-998-9627",
  phoneHref: "+972549989627",
  website: "https://www.svarga-om.com",
  telegram: "https://t.me/+2Vk8kbR_70kyN2Qy",
  socials: [
    { key: "instagram", label: "Instagram", href: "https://www.instagram.com/mosheostrovsky/" },
    { key: "youtube", label: "YouTube", href: "https://m.youtube.com/@MosheOstrovsky" },
    { key: "tiktok", label: "TikTok", href: "https://www.tiktok.com/@moshe.svarga.om" },
    { key: "facebook", label: "Facebook", href: "https://www.facebook.com/mosheostrovsky" },
    { key: "telegram", label: "Telegram", href: "https://t.me/+2Vk8kbR_70kyN2Qy" },
  ],
  /** Digital business cards — language-specific only (no English version). */
  businessCard: {
    ru: "https://get-marketing.net/moshe-om/",
    he: "https://get-marketing.co.il/moshe-om/",
  } as Record<string, string>,
} as const;
