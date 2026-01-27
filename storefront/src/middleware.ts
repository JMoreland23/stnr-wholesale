import { HttpTypes } from "@medusajs/types"
import { NextRequest, NextResponse } from "next/server"

// Use MEDUSA_BACKEND_URL for server-side requests, fallback to NEXT_PUBLIC_MEDUSA_BACKEND_URL
const BACKEND_URL = process.env.MEDUSA_BACKEND_URL || process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL
const PUBLISHABLE_API_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
const DEFAULT_REGION = process.env.NEXT_PUBLIC_DEFAULT_REGION || "us"

const regionMapCache = {
  regionMap: new Map<string, HttpTypes.StoreRegion>(),
  regionMapUpdated: Date.now(),
}

async function getRegionMap(cacheId: string) {
  const { regionMap, regionMapUpdated } = regionMapCache

  if (
    !regionMap.keys().next().value ||
    regionMapUpdated < Date.now() - 3600 * 1000
  ) {
    // Fetch regions from Medusa. We can't use the JS client here because middleware is running on Edge and the client needs a Node environment.
    try {
      const { regions } = await fetch(`${BACKEND_URL}/store/regions`, {
        headers: {
          "x-publishable-api-key": PUBLISHABLE_API_KEY!,
        },
        next: {
          revalidate: 3600,
          tags: [`regions-${cacheId}`],
        },
      }).then(async (response) => {
        const json = await response.json()

        if (!response.ok) {
          throw new Error(json.message)
        }

        return json
      })

      if (!regions?.length) {
        throw new Error(
          "Middleware.ts: No regions found. Did you set up regions in your Medusa Admin?"
        )
      }

      regions.forEach((region: HttpTypes.StoreRegion) => {
        region.countries?.forEach((country) => {
          regionMap.set(country.iso_2, region)
        })
      })

      regionMapCache.regionMap = regionMap
      regionMapCache.regionMapUpdated = Date.now()
    } catch (error) {
      console.warn(
        "Middleware.ts: Could not fetch regions from backend. Using default region. Error:",
        error instanceof Error ? error.message : String(error)
      )
      // Fallback: if regions can't be fetched, just use the default region
      // This allows the storefront to work even if the backend is not ready
      regionMap.set(DEFAULT_REGION, { id: "default", name: "Default" } as any)
      regionMapCache.regionMap = regionMap
      regionMapCache.regionMapUpdated = Date.now()
    }
  }

  return regionMapCache.regionMap
}

async function getCountryCode(
  request: NextRequest,
  regionMap: Map<string, HttpTypes.StoreRegion>
): Promise<string> {
  let countryCode: string | null = null

  const searchParams = request.nextUrl.searchParams
  if (searchParams.has("country")) {
    countryCode = searchParams.get("country") as string
  }

  if (!countryCode) {
    const cookieCountry = request.cookies.get("_medusa_country")?.value
    countryCode = cookieCountry || DEFAULT_REGION
  }

  if (!regionMap.has(countryCode)) {
    const firstRegion = regionMap.values().next().value
    countryCode = firstRegion?.countries?.[0]?.iso_2 || DEFAULT_REGION
  }

  return countryCode
}

export async function middleware(request: NextRequest) {
  const cacheId = "medusa-regions"
  const regionMap = await getRegionMap(cacheId)
  const countryCode = await getCountryCode(request, regionMap)

  const response = NextResponse.next()
  response.cookies.set("_medusa_country", countryCode, { maxAge: 31536000 })

  const pathname = request.nextUrl.pathname
  const pathnameHasCountry = regionMap.has(pathname.split("/")[1])

  if (!pathnameHasCountry) {
    const pathWithCountry = `/${countryCode}${pathname}`
    return NextResponse.rewrite(
      new URL(pathWithCountry, request.url),
      response
    )
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api|_next/static|_next/image|favicon.ico|public).*)",
  ],
}
