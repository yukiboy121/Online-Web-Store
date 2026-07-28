import { NextResponse } from "next/server";
import { db } from "@/db";
import { users, categories, products } from "@/db/schema";
import { hashPassword } from "@/lib/auth";
import { sql } from "drizzle-orm";

interface ProductSeed {
  name: string;
  slug: string;
  brand: string;
  sku: string;
  categoryId: number;
  price: string;
  discountPrice?: string | null;
  stock: number;
  warranty: string;
  description: string;
  images: string[];
  specs: Record<string, string>;
  compatibility: Record<string, string>;
  isFeatured?: boolean;
  isBestSeller?: boolean;
  isNewArrival?: boolean;
  rating: string;
  reviewCount: number;
}

export async function POST() {
  try {
    const existingProducts = await db.select({ c: sql<number>`count(*)` }).from(products);
    if (Number(existingProducts[0].c) > 0) {
      return NextResponse.json({ message: "Already seeded" });
    }

    const adminPwd = await hashPassword("admin123");
    await db.insert(users).values([
      { email: "admin@nexuspc.com", password: adminPwd, name: "Admin", role: "admin" },
      { email: "manager@nexuspc.com", password: adminPwd, name: "Manager", role: "manager" },
    ]).onConflictDoNothing();

    const cats = await db.insert(categories).values([
      { name: "Processors", slug: "processors", icon: "Cpu", sortOrder: 1, description: "CPUs from Intel and AMD" },
      { name: "Graphics Cards", slug: "graphics-cards", icon: "Monitor", sortOrder: 2, description: "GPUs for gaming and workstations" },
      { name: "Motherboards", slug: "motherboards", icon: "Layers", sortOrder: 3, description: "ATX, Micro-ATX, Mini-ITX" },
      { name: "RAM", slug: "ram", icon: "MemoryStick", sortOrder: 4, description: "DDR4 and DDR5 memory" },
      { name: "Storage", slug: "storage", icon: "HardDrive", sortOrder: 5, description: "SSDs and HDDs" },
      { name: "Power Supplies", slug: "power-supplies", icon: "Zap", sortOrder: 6, description: "PSUs for every build" },
      { name: "PC Cases", slug: "pc-cases", icon: "Box", sortOrder: 7, description: "Tower and compact cases" },
      { name: "Cooling", slug: "cooling", icon: "Wind", sortOrder: 8, description: "Air and liquid cooling" },
      { name: "Gaming Accessories", slug: "gaming-accessories", icon: "Gamepad2", sortOrder: 9, description: "Peripherals and gear" },
      { name: "Laptops", slug: "laptops", icon: "Laptop", sortOrder: 10, description: "Gaming and work laptops" },
    ]).returning();

    const catMap: Record<string, number> = {};
    for (const c of cats) catMap[c.slug] = c.id;

    const productData: ProductSeed[] = [
      { name: "Intel Core i9-14900K", slug: "intel-core-i9-14900k", brand: "Intel", sku: "INT-CPU-14900K", categoryId: catMap["processors"], price: "589.99", discountPrice: "549.99", stock: 45, warranty: "3 Years", description: "24-core (8P+16E) processor with up to 6.0 GHz boost.", images: [], specs: { Cores: "24 (8P+16E)", Threads: "32", "Base Clock": "3.2 GHz", "Boost Clock": "6.0 GHz", TDP: "125W", Socket: "LGA 1700", Cache: "36MB L3" }, compatibility: { socket: "LGA 1700", type: "cpu" }, isFeatured: true, isBestSeller: true, isNewArrival: true, rating: "4.80", reviewCount: 234 },
      { name: "AMD Ryzen 9 7950X", slug: "amd-ryzen-9-7950x", brand: "AMD", sku: "AMD-CPU-7950X", categoryId: catMap["processors"], price: "699.99", discountPrice: "599.99", stock: 32, warranty: "3 Years", description: "16-core, 32-thread processor with Zen 4 architecture.", images: [], specs: { Cores: "16", Threads: "32", "Base Clock": "4.5 GHz", "Boost Clock": "5.7 GHz", TDP: "170W", Socket: "AM5", Cache: "64MB L3" }, compatibility: { socket: "AM5", type: "cpu" }, isFeatured: true, isBestSeller: true, rating: "4.85", reviewCount: 189 },
      { name: "Intel Core i7-14700K", slug: "intel-core-i7-14700k", brand: "Intel", sku: "INT-CPU-14700K", categoryId: catMap["processors"], price: "419.99", discountPrice: "389.99", stock: 67, warranty: "3 Years", description: "20-core processor for high-performance gaming.", images: [], specs: { Cores: "20 (8P+12E)", Threads: "28", "Base Clock": "3.4 GHz", "Boost Clock": "5.6 GHz", TDP: "125W", Socket: "LGA 1700", Cache: "33MB L3" }, compatibility: { socket: "LGA 1700", type: "cpu" }, isFeatured: true, rating: "4.70", reviewCount: 156 },
      { name: "AMD Ryzen 7 7800X3D", slug: "amd-ryzen-7-7800x3d", brand: "AMD", sku: "AMD-CPU-7800X3D", categoryId: catMap["processors"], price: "449.99", discountPrice: null, stock: 28, warranty: "3 Years", description: "The ultimate gaming CPU with 3D V-Cache technology.", images: [], specs: { Cores: "8", Threads: "16", "Base Clock": "4.2 GHz", "Boost Clock": "5.0 GHz", TDP: "120W", Socket: "AM5", Cache: "96MB L3" }, compatibility: { socket: "AM5", type: "cpu" }, isBestSeller: true, rating: "4.90", reviewCount: 312 },
      { name: "Intel Core i5-14600K", slug: "intel-core-i5-14600k", brand: "Intel", sku: "INT-CPU-14600K", categoryId: catMap["processors"], price: "319.99", discountPrice: "289.99", stock: 89, warranty: "3 Years", description: "14-core mid-range powerhouse.", images: [], specs: { Cores: "14 (6P+8E)", Threads: "20", "Base Clock": "3.5 GHz", "Boost Clock": "5.3 GHz", TDP: "125W", Socket: "LGA 1700", Cache: "24MB L3" }, compatibility: { socket: "LGA 1700", type: "cpu" }, isNewArrival: true, rating: "4.65", reviewCount: 198 },

      { name: "NVIDIA RTX 4090 Founders Edition", slug: "nvidia-rtx-4090-fe", brand: "NVIDIA", sku: "NVD-GPU-4090FE", categoryId: catMap["graphics-cards"], price: "1599.99", discountPrice: null, stock: 12, warranty: "3 Years", description: "The ultimate GPU. 24GB GDDR6X, Ada Lovelace architecture.", images: [], specs: { VRAM: "24GB GDDR6X", "Boost Clock": "2520 MHz", "CUDA Cores": "16384", TDP: "450W", Interface: "PCIe 4.0 x16", Length: "336mm" }, compatibility: { type: "gpu", minPSU: "850", length: "336" }, isFeatured: true, isBestSeller: true, isNewArrival: true, rating: "4.95", reviewCount: 567 },
      { name: "AMD Radeon RX 7900 XTX", slug: "amd-radeon-rx-7900-xtx", brand: "AMD", sku: "AMD-GPU-7900XTX", categoryId: catMap["graphics-cards"], price: "999.99", discountPrice: "949.99", stock: 23, warranty: "3 Years", description: "24GB GDDR6, RDNA 3 architecture.", images: [], specs: { VRAM: "24GB GDDR6", "Boost Clock": "2500 MHz", "Stream Processors": "6144", TDP: "355W", Interface: "PCIe 4.0 x16", Length: "287mm" }, compatibility: { type: "gpu", minPSU: "800", length: "287" }, isFeatured: true, rating: "4.75", reviewCount: 234 },
      { name: "NVIDIA RTX 4070 Ti SUPER", slug: "nvidia-rtx-4070-ti-super", brand: "NVIDIA", sku: "NVD-GPU-4070TIS", categoryId: catMap["graphics-cards"], price: "799.99", discountPrice: null, stock: 34, warranty: "3 Years", description: "16GB GDDR6X for enthusiast 1440p and 4K gaming.", images: [], specs: { VRAM: "16GB GDDR6X", "Boost Clock": "2610 MHz", "CUDA Cores": "8448", TDP: "285W", Interface: "PCIe 4.0 x16", Length: "304mm" }, compatibility: { type: "gpu", minPSU: "700", length: "304" }, isBestSeller: true, rating: "4.80", reviewCount: 345 },
      { name: "NVIDIA RTX 4060 Ti", slug: "nvidia-rtx-4060-ti", brand: "NVIDIA", sku: "NVD-GPU-4060TI", categoryId: catMap["graphics-cards"], price: "399.99", discountPrice: null, stock: 56, warranty: "3 Years", description: "8GB GDDR6 for smooth 1080p and 1440p gaming.", images: [], specs: { VRAM: "8GB GDDR6", "Boost Clock": "2535 MHz", "CUDA Cores": "4352", TDP: "160W", Interface: "PCIe 4.0 x16", Length: "240mm" }, compatibility: { type: "gpu", minPSU: "550", length: "240" }, isNewArrival: true, rating: "4.60", reviewCount: 432 },

      { name: "ASUS ROG Maximus Z790 Hero", slug: "asus-rog-maximus-z790-hero", brand: "ASUS", sku: "ASU-MB-Z790H", categoryId: catMap["motherboards"], price: "629.99", discountPrice: null, stock: 18, warranty: "3 Years", description: "Premium Z790 ATX motherboard for Intel 12th/13th/14th Gen.", images: [], specs: { Chipset: "Z790", Socket: "LGA 1700", "Form Factor": "ATX", "RAM Slots": "4x DDR5", "Max RAM": "128GB", "M.2 Slots": "5", WiFi: "WiFi 6E" }, compatibility: { socket: "LGA 1700", type: "motherboard", formFactor: "ATX", ramType: "DDR5" }, isFeatured: true, rating: "4.85", reviewCount: 123 },
      { name: "MSI MPG X670E Carbon WiFi", slug: "msi-mpg-x670e-carbon-wifi", brand: "MSI", sku: "MSI-MB-X670EC", categoryId: catMap["motherboards"], price: "479.99", discountPrice: "429.99", stock: 25, warranty: "3 Years", description: "Premium AM5 motherboard for Ryzen 7000 series.", images: [], specs: { Chipset: "X670E", Socket: "AM5", "Form Factor": "ATX", "RAM Slots": "4x DDR5", "Max RAM": "128GB", "M.2 Slots": "4", WiFi: "WiFi 6E" }, compatibility: { socket: "AM5", type: "motherboard", formFactor: "ATX", ramType: "DDR5" }, isFeatured: true, isBestSeller: true, rating: "4.70", reviewCount: 89 },
      { name: "Gigabyte B650 AORUS Elite AX", slug: "gigabyte-b650-aorus-elite-ax", brand: "Gigabyte", sku: "GIG-MB-B650AE", categoryId: catMap["motherboards"], price: "229.99", discountPrice: null, stock: 42, warranty: "3 Years", description: "Mid-range AM5 board with premium features.", images: [], specs: { Chipset: "B650", Socket: "AM5", "Form Factor": "ATX", "RAM Slots": "4x DDR5", "Max RAM": "128GB", "M.2 Slots": "3", WiFi: "WiFi 6E" }, compatibility: { socket: "AM5", type: "motherboard", formFactor: "ATX", ramType: "DDR5" }, isNewArrival: true, rating: "4.55", reviewCount: 167 },

      { name: "G.Skill Trident Z5 RGB 32GB DDR5-6000", slug: "gskill-trident-z5-rgb-32gb", brand: "G.Skill", sku: "GSK-RAM-TZ5-32", categoryId: catMap["ram"], price: "129.99", discountPrice: null, stock: 78, warranty: "Lifetime", description: "32GB (2x16GB) DDR5-6000 CL30 with RGB lighting.", images: [], specs: { Capacity: "32GB (2x16GB)", Type: "DDR5", Speed: "6000 MHz", Latency: "CL30", Voltage: "1.35V", RGB: "Yes" }, compatibility: { type: "ram", ramType: "DDR5" }, isFeatured: true, isBestSeller: true, rating: "4.80", reviewCount: 456 },
      { name: "Corsair Vengeance DDR5-5600 64GB", slug: "corsair-vengeance-ddr5-5600-64gb", brand: "Corsair", sku: "COR-RAM-V5600-64", categoryId: catMap["ram"], price: "219.99", discountPrice: null, stock: 34, warranty: "Lifetime", description: "64GB (2x32GB) DDR5-5600 for workstation builds.", images: [], specs: { Capacity: "64GB (2x32GB)", Type: "DDR5", Speed: "5600 MHz", Latency: "CL36", Voltage: "1.25V", RGB: "No" }, compatibility: { type: "ram", ramType: "DDR5" }, rating: "4.70", reviewCount: 189 },

      { name: "Samsung 990 Pro 2TB NVMe SSD", slug: "samsung-990-pro-2tb", brand: "Samsung", sku: "SAM-SSD-990P-2T", categoryId: catMap["storage"], price: "179.99", discountPrice: "159.99", stock: 92, warranty: "5 Years", description: "PCIe 4.0 NVMe M.2 SSD with 7450MB/s read speeds.", images: [], specs: { Capacity: "2TB", Interface: "PCIe 4.0 x4", "Read Speed": "7450 MB/s", "Write Speed": "6900 MB/s", "Form Factor": "M.2 2280", Endurance: "1200 TBW" }, compatibility: { type: "storage" }, isFeatured: true, isBestSeller: true, isNewArrival: true, rating: "4.90", reviewCount: 678 },
      { name: "WD Black SN850X 1TB", slug: "wd-black-sn850x-1tb", brand: "Western Digital", sku: "WD-SSD-SN850X-1T", categoryId: catMap["storage"], price: "89.99", discountPrice: null, stock: 120, warranty: "5 Years", description: "PCIe 4.0 NVMe with Game Mode 2.0.", images: [], specs: { Capacity: "1TB", Interface: "PCIe 4.0 x4", "Read Speed": "7300 MB/s", "Write Speed": "6300 MB/s", "Form Factor": "M.2 2280" }, compatibility: { type: "storage" }, rating: "4.75", reviewCount: 345 },

      { name: "Corsair RM1000x 1000W 80+ Gold", slug: "corsair-rm1000x-1000w", brand: "Corsair", sku: "COR-PSU-RM1000X", categoryId: catMap["power-supplies"], price: "189.99", discountPrice: null, stock: 38, warranty: "10 Years", description: "Fully modular 1000W PSU for high-end builds.", images: [], specs: { Wattage: "1000W", Efficiency: "80+ Gold", Modular: "Fully Modular", Fan: "135mm", Connectors: "ATX 3.0, 12VHPWR" }, compatibility: { type: "psu", wattage: "1000" }, isFeatured: true, isBestSeller: true, rating: "4.85", reviewCount: 234 },
      { name: "EVGA SuperNOVA 850 G7", slug: "evga-supernova-850-g7", brand: "EVGA", sku: "EVG-PSU-850G7", categoryId: catMap["power-supplies"], price: "149.99", discountPrice: "129.99", stock: 52, warranty: "10 Years", description: "850W 80+ Gold fully modular power supply.", images: [], specs: { Wattage: "850W", Efficiency: "80+ Gold", Modular: "Fully Modular", Fan: "135mm" }, compatibility: { type: "psu", wattage: "850" }, rating: "4.70", reviewCount: 178 },

      { name: "Lian Li O11 Dynamic EVO", slug: "lian-li-o11-dynamic-evo", brand: "Lian Li", sku: "LLI-CASE-O11EVO", categoryId: catMap["pc-cases"], price: "169.99", discountPrice: null, stock: 29, warranty: "2 Years", description: "Premium mid-tower with dual-chamber design.", images: [], specs: { "Form Factor": "ATX Mid-Tower", "Max GPU Length": "420mm", "Max CPU Cooler": "167mm", "Drive Bays": "4x 2.5\", 2x 3.5\"", Material: "Aluminum/Glass" }, compatibility: { type: "case", maxGPU: "420", formFactor: "ATX" }, isFeatured: true, isBestSeller: true, rating: "4.90", reviewCount: 567 },
      { name: "NZXT H7 Flow RGB", slug: "nzxt-h7-flow-rgb", brand: "NZXT", sku: "NZX-CASE-H7FLW", categoryId: catMap["pc-cases"], price: "129.99", discountPrice: null, stock: 44, warranty: "2 Years", description: "High-airflow mid-tower with RGB fans included.", images: [], specs: { "Form Factor": "ATX Mid-Tower", "Max GPU Length": "400mm", "Max CPU Cooler": "185mm", "Drive Bays": "2x 2.5\", 2x 3.5\"", Material: "Steel/Glass" }, compatibility: { type: "case", maxGPU: "400", formFactor: "ATX" }, isNewArrival: true, rating: "4.65", reviewCount: 234 },

      { name: "NZXT Kraken X73 360mm AIO", slug: "nzxt-kraken-x73-360mm", brand: "NZXT", sku: "NZX-COOL-X73", categoryId: catMap["cooling"], price: "179.99", discountPrice: "159.99", stock: 36, warranty: "6 Years", description: "360mm AIO liquid cooler with LCD display.", images: [], specs: { Type: "AIO Liquid", "Radiator Size": "360mm", "Fan Speed": "500-1800 RPM", Noise: "21-36 dBA", Socket: "LGA 1700/AM5/AM4" }, compatibility: { type: "cooling" }, isFeatured: true, isBestSeller: true, rating: "4.80", reviewCount: 345 },
      { name: "Noctua NH-D15 chromax.black", slug: "noctua-nh-d15-chromax-black", brand: "Noctua", sku: "NOC-COOL-NHD15B", categoryId: catMap["cooling"], price: "109.99", discountPrice: null, stock: 58, warranty: "6 Years", description: "Premium dual-tower air cooler in black.", images: [], specs: { Type: "Air Cooler", Height: "165mm", "Fan Speed": "300-1500 RPM", Noise: "19.2-24.6 dBA", Socket: "LGA 1700/AM5/AM4" }, compatibility: { type: "cooling" }, rating: "4.90", reviewCount: 890 },

      { name: "Logitech G Pro X Superlight 2", slug: "logitech-g-pro-x-superlight-2", brand: "Logitech", sku: "LOG-MOUSE-GPXSL2", categoryId: catMap["gaming-accessories"], price: "159.99", discountPrice: null, stock: 67, warranty: "2 Years", description: "Ultra-lightweight wireless gaming mouse, 60g.", images: [], specs: { Sensor: "HERO 2", DPI: "32,000", Weight: "60g", Battery: "95 hours", Connection: "LIGHTSPEED Wireless" }, compatibility: { type: "accessory" }, isFeatured: true, isNewArrival: true, rating: "4.85", reviewCount: 456 },
      { name: "SteelSeries Apex Pro TKL", slug: "steelseries-apex-pro-tkl", brand: "SteelSeries", sku: "STL-KB-APTTKL", categoryId: catMap["gaming-accessories"], price: "189.99", discountPrice: null, stock: 41, warranty: "2 Years", description: "Adjustable mechanical keyboard with OmniPoint switches.", images: [], specs: { "Switch Type": "OmniPoint 2.0", Layout: "TKL", Connectivity: "USB-C/Wireless", RGB: "Per-key RGB" }, compatibility: { type: "accessory" }, rating: "4.75", reviewCount: 234 },

      { name: "ASUS ROG Zephyrus G16 (2024)", slug: "asus-rog-zephyrus-g16-2024", brand: "ASUS", sku: "ASU-LAP-G16-24", categoryId: catMap["laptops"], price: "2499.99", discountPrice: "2299.99", stock: 15, warranty: "2 Years", description: "16-inch gaming laptop with RTX 4070, Intel Core Ultra 9.", images: [], specs: { CPU: "Intel Core Ultra 9 185H", GPU: "RTX 4070 8GB", RAM: "32GB DDR5", Storage: "1TB NVMe", Display: "16\" 2560x1600 240Hz OLED", Battery: "90Wh" }, compatibility: { type: "laptop" }, isFeatured: true, isNewArrival: true, rating: "4.80", reviewCount: 123 },
    ];

    await db.insert(products).values(productData);

    return NextResponse.json({ message: "Seeded successfully", products: productData.length });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Seed failed: " + String(e) }, { status: 500 });
  }
}
