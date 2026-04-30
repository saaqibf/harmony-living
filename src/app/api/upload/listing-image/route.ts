import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';
import { uploadListingImage, UploadError } from '@/lib/s3/upload';
import { log } from '@/lib/log';

export async function POST(req: NextRequest) {
  const auth = await requireUser();

  const user = await prisma.user.findUnique({
    where: { cognitoSub: auth.cognitoSub },
    select: { id: true },
  });
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  let buffer: Buffer;
  let mimeType: string;
  let listingId: string;
  let orderIdx: number;

  try {
    const formData = await req.formData();
    const file = formData.get('file');
    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    listingId = String(formData.get('listingId') ?? '');
    orderIdx = Number(formData.get('orderIdx') ?? 0);
    if (!listingId) return NextResponse.json({ error: 'listingId required' }, { status: 400 });
    mimeType = file.type;
    buffer = Buffer.from(await file.arrayBuffer());
  } catch {
    return NextResponse.json({ error: 'Invalid form data' }, { status: 400 });
  }

  const listing = await prisma.listing.findFirst({
    where: { id: listingId, deletedAt: null },
    select: { ownerId: true },
  });
  if (!listing || listing.ownerId !== user.id) {
    return NextResponse.json({ error: 'Listing not found or not yours' }, { status: 403 });
  }

  try {
    const url = await uploadListingImage(listingId, buffer, mimeType, orderIdx);

    const image = await prisma.listingImage.create({
      data: { listingId, url, orderIdx },
    });

    return NextResponse.json({ url, id: image.id });
  } catch (err) {
    if (err instanceof UploadError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    log.error('listing-image upload failed', { userId: user.id, listingId, err: String(err) });
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
