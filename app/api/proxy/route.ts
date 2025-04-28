
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const fileUrl = url.searchParams.get('fileUrl');

  if (!fileUrl) {
    return NextResponse.json({ error: 'File URL is required' }, { status: 400 });
  }

  try {
    const options = {headers: request.headers}
    const response = await fetch(fileUrl,options);
    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch the file' }, { status: response.status });
    }

    const fileStream = response.body;
    const headers = new Headers(response.headers);
    headers.set("Content-Type", "video/mp4")

    return new NextResponse(fileStream, {
      headers,
      status: response.status,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}

