import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import formidable, { Fields, Files, File } from 'formidable';
import fs from 'fs';
import { createShop } from '@/models/shop';

export const config = {
  api: {
    bodyParser: false,
  },
};

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      // GET /api/shop?userId=2
      const userId = Number(req.query.userId);
      if (!userId || isNaN(userId)) {
        return res.status(400).json({ error: 'Valid userId is required' });
      }
      try {
        const { getShopByUserId } = await import('@/models/shop');
        const shop = await getShopByUserId(userId);
        if (!shop) {
          return res.status(404).json({ error: 'Shop not found for this user' });
        }
        return res.status(200).json({ shop });
      } catch (err) {
        console.error('Error fetching shop:', err);
        return res.status(500).json({ error: 'Failed to fetch shop' });
      }
    }

    if (req.method === 'POST') {
      // ...existing POST logic...
      // Parse form data
      const form = formidable();
      let fields: Fields;
      let files: Files;

      try {
        const result = await new Promise<{ fields: Fields; files: Files }>((resolve, reject) => {
          form.parse(req, (err, parsedFields, parsedFiles) => {
            if (err) {
              reject(err);
            } else {
              resolve({ fields: parsedFields, files: parsedFiles });
            }
          });
        });
        fields = result.fields;
        files = result.files;
      } catch (parseError) {
        console.error('Form parsing error:', parseError);
        return res.status(400).json({ error: 'Failed to parse form data' });
      }

      // Handle image upload
      let imageUrl = '';
      const imageFile = files.image;
      
      if (imageFile) {
        let file: File;
        
        // Handle both single file and array of files
        if (Array.isArray(imageFile)) {
          file = imageFile[0];
        } else {
          file = imageFile;
        }

        // Validate file exists and has required properties
        if (file && file.filepath && file.originalFilename && file.mimetype) {
          try {
            // Check if file exists
            if (!fs.existsSync(file.filepath)) {
              return res.status(400).json({ error: 'Uploaded file not found' });
            }

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
              return res.status(500).json({ error: `Image upload failed: ${error.message}` });
            }

            if (data) {
              const publicUrlRes = supabase.storage.from('bucketimage').getPublicUrl(data.path);
              imageUrl = publicUrlRes.data.publicUrl;
            }

            // Clean up temporary file
            try {
              fs.unlinkSync(file.filepath);
            } catch (unlinkError) {
              console.warn('Failed to clean up temporary file:', unlinkError);
            }
          } catch (fileError) {
            console.error('File processing error:', fileError);
            return res.status(500).json({ error: 'Failed to process uploaded image' });
          }
        }
      }

      // Extract and validate form fields
      const getUserId = (field: string | string[] | undefined): number => {
        const value = Array.isArray(field) ? field[0] : field;
        const parsed = Number(value);
        if (isNaN(parsed) || parsed <= 0) {
          throw new Error('Invalid userId');
        }
        return parsed;
      };

      const getStringField = (field: string | string[] | undefined): string => {
        return Array.isArray(field) ? field[0] || '' : field || '';
      };

      let userId: number;
      try {
        userId = getUserId(fields.userId);
      } catch (userIdError) {
        return res.status(400).json({ error: 'Valid userId is required' });
      }

      const shopName = getStringField(fields.shopName);
      const description = getStringField(fields.description);

      // Validate required fields
      if (!shopName.trim()) {
        return res.status(400).json({ error: 'Shop name is required' });
      }

      // Create shop
      try {
        const shop = await createShop({
          userId,
          shopName: shopName.trim(),
          description: description.trim(),
          imageUrl,
        });

        return res.status(201).json({ shop });
      } catch (createShopError) {
        console.error('Create shop error:', createShopError);
        return res.status(500).json({ error: 'Failed to create shop' });
      }
    }

    // Method not allowed
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Unexpected error in shop creation:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}