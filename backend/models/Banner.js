// Homepage hero banners, stored in memory (reset on restart).
let banners = [
  {
    id: "banner-1",
    eyebrow: "Limited-Time Offer",
    title: "Festive sparkle,",
    accent: "special prices",
    description: "Discover statement jewellery for every celebration.",
    buttonLabel: "Shop the Festive Edit",
    buttonLink: "/shop?isNew=true",
    image: "https://picsum.photos/seed/radha-festive/1600/850",
    active: true,
    order: 1,
  },
];
let counter = 1;

const clone = (b) => (b ? { ...b } : b);

export async function getAll() {
  return banners.map(clone).sort((a, b) => a.order - b.order);
}

export async function getActive() {
  return banners.filter((b) => b.active).map(clone).sort((a, b) => a.order - b.order);
}

export async function getById(id) {
  return clone(banners.find((b) => b.id === id) || null);
}

export async function create(data) {
  counter += 1;
  const banner = {
    id: data.id || `banner-${counter}`,
    eyebrow: data.eyebrow,
    title: data.title,
    accent: data.accent || "",
    description: data.description || "",
    buttonLabel: data.buttonLabel,
    buttonLink: data.buttonLink,
    image: data.image,
    active: data.active !== false,
    order: Number(data.order) || banners.length + 1,
  };
  banners.push(banner);
  return clone(banner);
}

export async function update(id, data) {
  const banner = banners.find((b) => b.id === id);
  if (!banner) return null;
  Object.assign(banner, {
    eyebrow: data.eyebrow,
    title: data.title,
    accent: data.accent || "",
    description: data.description || "",
    buttonLabel: data.buttonLabel,
    buttonLink: data.buttonLink,
    image: data.image,
    active: !!data.active,
    order: Number(data.order),
  });
  return clone(banner);
}

export async function remove(id) {
  const before = banners.length;
  banners = banners.filter((b) => b.id !== id);
  return banners.length < before;
}
