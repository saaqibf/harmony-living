import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';
import { uploadIntroMedia, UploadError } from '@/lib/s3/upload';
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

  try {
    const formData = await req.formData();
    const file = formData.get('file');
    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    mimeType = file.type;
    buffer = Buffer.from(await file.arrayBuffer());
  } catch {
    return NextResponse.json({ error: 'Invalid form data' }, { status: 400 });
  }

  try {
    const { url, mediaType } = await uploadIntroMedia(user.id, buffer, mimeType);

    await prisma.profile.update({
      where: { userId: user.id },
      data: { introMediaUrl: url, introMediaType: mediaType },
    });

    return NextResponse.json({ url, mediaType });
  } catch (err) {
    if (err instanceof UploadError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    log.error('intro-media upload failed', { userId: user.id, err: String(err) });
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
