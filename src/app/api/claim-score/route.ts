import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { score, address } = await request.json();

    if (!score || !address) {
      return NextResponse.json(
        { error: 'Score and wallet address are required' },
        { status: 400 }
      );
    }

    // TODO: Implement contract interaction here
    // This endpoint can be used for backend validation or additional logic
    // The main claiming happens on the client side using wagmi
    
    return NextResponse.json({
      success: true,
      message: 'Score claim initiated',
      score,
      address,
    });
  } catch (error) {
    console.error('Error in claim-score API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
