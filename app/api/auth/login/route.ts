import { NextResponse } from 'next/server';

// Dockerコンテナ内からホストマシンのAPIにアクセス
const API_BASE_URL = process.env.API_URL ?? 'http://host.docker.internal:8000';

export async function GET() {
  try {
    console.log('Fetching login URL from:', `${API_BASE_URL}/auth/login`);

    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend error:', errorText);
      return NextResponse.json(
        { error: 'Failed to get login URL', details: errorText },
        { status: response.status }
      );
    }

    const data: unknown = await response.json();
    console.log('Login URL retrieved successfully');
    return NextResponse.json(data);
  } catch (error) {
    console.error('Login URL error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
