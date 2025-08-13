import { createClient } from '@supabase/supabase-js';
import formidable, { Fields, Files, File } from 'formidable';
import fs from 'fs';
import { createShop } from '@/models/shop';
import { Readable } from 'stream';
import { IncomingMessage } from 'http';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function toNodeRequest(req: Request): Promise<IncomingMessage> {
  const body = Readable.from(Buffer.from(await req.arrayBuffer()));
  const headers = Object.fromEntries(req.headers.entries());

  const fakeReq = Object.assign(body, {
    headers,
    method: req.method,
    url: '', // optional
  });

  return fakeReq as IncomingMessage;
}

function getFieldString(field: string | string[] | undefined): string {
  return Array.isArray(field) ? field[0] || '' : field || '';
}
function getFieldNumber(field: string | string[] | undefined): number {
  const value = Array.isArray(field) ? field[0] : field;
  const parsed = Number(value);
  if (isNaN(parsed)) throw new Error('Invalid number');
  return parsed;
}

export async function POST(req: Request) {
  try {
    const nodeReq = await toNodeRequest(req);
    const form = formidable({ multiples: false });
    const { fields, files } = await new Promise<{
      fields: Fields;
      files: Files;
    }>((resolve, reject) => {
      form.parse(nodeReq, (err, fields, files) => {
        if (err) reject(err);
        else resolve({ fields, files });
      });
    });
    let userId: string;
    try {
      userId = fields.userId;
    } catch {
      return Response.json(
        { error: 'Valid userId is required' },
        { status: 400 }
      );
    }

    const shopName = getFieldString(fields.shopName).trim();
    const description = getFieldString(fields.description).trim();

    if (!shopName) {
      return Response.json({ error: 'Shop name is required' }, { status: 400 });
    }
    let imageUrl = '';
    const imageFile = files.image;

    if (imageFile) {
      const file = Array.isArray(imageFile) ? imageFile[0] : imageFile;

      if (file && file.filepath && file.originalFilename && file.mimetype) {
        try {
          const fileBuffer = fs.readFileSync(file.filepath);
          const fileName = `shops/${Date.now()}_${file.originalFilename}`;

          const { data, error } = await supabase.storage
            .from('bucketimage')
            .upload(fileName, fileBuffer, {
              contentType: file.mimetype,
              upsert: true,
            });

          if (error) {
            console.error('Supabase upload error:', error);
            return Response.json(
              { error: 'Image upload failed' },
              { status: 500 }
            );
          }

          const { data: publicUrl } = supabase.storage
            .from('bucketimage')
            .getPublicUrl(data.path);
          imageUrl = publicUrl.publicUrl;

          // Hapus file temp
          fs.unlinkSync(file.filepath);
        } catch (fileError) {
          console.error('File upload error:', fileError);
          return Response.json(
            { error: 'Failed to process uploaded image' },
            { status: 500 }
          );
        }
      }
    }
    const shop = await createShop({
      userId,
      shopName,
      description,
      imageUrl,
    });

    return Response.json({ shop }, { status: 201 });
  } catch (err) {
    console.error('Unexpected error in POST /shop:', err);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
