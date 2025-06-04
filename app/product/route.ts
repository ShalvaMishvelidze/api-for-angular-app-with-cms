import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

const PAGE_SIZE = 12;
const ALLOWED_SORT_FIELDS = ["name", "price"];
const ALLOWED_ORDER_VALUES = ["asc", "desc"];

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const rawPage = parseInt(searchParams.get("page") || "1");
    const page = Math.max(1, rawPage);
    const category = searchParams.get("category") || "all";
    const rawSearch = searchParams.get("search")?.trim() || "";
    const search = rawSearch.length > 100 ? rawSearch.slice(0, 100) : rawSearch;
    const rawSort = searchParams.get("sort") || "";
    const sort = ALLOWED_SORT_FIELDS.includes(rawSort) ? rawSort : "";
    const rawOrder = searchParams.get("order") || "asc";
    const order = ALLOWED_ORDER_VALUES.includes(rawOrder) ? rawOrder : "asc";

    const categoriesResult = await prisma.product.findMany({
      select: { category: true },
      distinct: ["category"],
    });

    const categories = [
      "all",
      ...categoriesResult.map((c: { category: string }) =>
        c.category.toLowerCase()
      ),
    ];

    if (!categories.includes(category)) {
      return NextResponse.json({ error: "Invalid category." }, { status: 400 });
    }

    console.log(
      `category: ${category}, search: ${search}, sort: ${sort}, order: ${order}, page: ${page}`
    );

    const filter: any = {
      ...(search && {
        name: { contains: search, mode: "insensitive" },
      }),
      ...(category !== "all" && {
        category: { equals: category, mode: "insensitive" },
      }),
    };

    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        category: true,
        thumbnail: true,
        images: true,
        discount: true,
        stock: true,
        rating: true,
      },
      where: filter,
      orderBy: sort ? { [sort]: order } : undefined,
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    });

    const totalCount = await prisma.product.count({ where: filter });
    const totalPages = Math.ceil(totalCount / PAGE_SIZE);

    const formattedProducts = products.map((product) => {
      return {
        ...product,
        images: JSON.parse(product.images || "[]"),
      };
    });

    return NextResponse.json({
      products: formattedProducts,
      pages: totalPages,
      categories,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    );
  }
}
