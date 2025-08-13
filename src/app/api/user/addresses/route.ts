import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, createUserAddress } from '@/models/user';

// GET /api/user/addresses - Fetch all user addresses
export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Return addresses directly from the user object
    return NextResponse.json(currentUser.addresses || [], { status: 200 });
  } catch (error) {
    console.error('Error fetching user addresses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch addresses' },
      { status: 500 }
    );
  }
}

// POST /api/user/addresses - Create new address
export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { label, address, city, province, postalCode, isDefault } = body;

    // Validate required fields
    if (!label || !address || !city || !province || !postalCode) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Create the new address
    const newAddress = await createUserAddress(currentUser.id, {
      label,
      address,
      city,
      province,
      postalCode,
      isDefault: Boolean(isDefault),
    });

    return NextResponse.json(newAddress, { status: 201 });
  } catch (error) {
    console.error('Error creating address:', error);
    return NextResponse.json(
      { error: 'Failed to create address' },
      { status: 500 }
    );
  }
}
