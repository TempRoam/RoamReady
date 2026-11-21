//this is needed to run on the server before a page loads 
//every request passes through here first, and we get a chance to
//inspect, change, and redirect it before the page is shown

/* import { type NextRequest } from "next/server"
import { createClient } from "@/utils/supabase/middleware"

export async function proxy(request: NextRequest) {
    return await createClient(request)
}

export const config = {
    matcher: [ "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)" ] // matcher is used to specify which request paths that middleware will run on
}
    */