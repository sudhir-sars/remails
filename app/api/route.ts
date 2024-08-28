import { NextResponse, NextRequest } from 'next/server';



// Keep the GET method if you need it for other purposes
export async function GET(req: NextRequest) {
  return NextResponse.json({abd:"adewqadwea"}, { status: 200 });
}