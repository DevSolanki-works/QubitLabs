import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     * - live2d/ (static Live2D runtime and model assets)
     * - public assets like images, gltf models, fonts, scripts, etc.
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|live2d/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|hdr|glb|gltf|moc3|wasm|js|css|json|woff|woff2|ttf)$).*)",
  ],
};
