import middleware from "next-auth/middleware";

export default function proxy(req: any) {
  return middleware(req);
}

export const config = {
  matcher: ["/trips", "/reservations", "/properties", "/favorites"],
};
