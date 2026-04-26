import { NextResponse } from 'next/server'

function notUsed() {
  return NextResponse.json({ message: 'Proxy route disabled. Use direct backend requests.' }, { status: 410 })
}

export async function GET() {
  return notUsed()
}

export async function POST() {
  return notUsed()
}

export async function PUT() {
  return notUsed()
}

export async function PATCH() {
  return notUsed()
}

export async function DELETE() {
  return notUsed()
}
