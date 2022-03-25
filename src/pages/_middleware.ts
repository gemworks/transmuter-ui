import { NextResponse, NextRequest } from "next/server";
export async function middleware(req, ev) {
	const { pathname } = req.nextUrl;
	if (pathname == "/") {
		return NextResponse.redirect("/transmuters");
	}
	return NextResponse.next();
}
