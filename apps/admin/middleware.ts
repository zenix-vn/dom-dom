import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

type CookieToSet = { name: string; value: string; options?: CookieOptions };

/**
 * Quản trị: chỉ cho phép vai trò teacher/admin. Học sinh/phụ huynh bị chặn.
 */
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isLogin = path.startsWith("/login");

  if (!user) {
    if (isLogin) return response;
    return redirectTo(request, "/login");
  }

  // Kiểm tra vai trò.
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  const role = (profile as { role?: string } | null)?.role;
  const allowed = role === "teacher" || role === "admin";

  if (!allowed) {
    if (isLogin) return response; // cho xem trang login để đăng nhập lại
    return redirectTo(request, "/login?denied=1");
  }

  if (isLogin) return redirectTo(request, "/"); // đã hợp lệ thì khỏi ở trang login
  return response;
}

function redirectTo(request: NextRequest, pathname: string) {
  const url = request.nextUrl.clone();
  const [p, search] = pathname.split("?");
  url.pathname = p!;
  url.search = search ? `?${search}` : "";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
