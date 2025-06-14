
'use server';
import prisma from '@/lib/prisma';
import type { MbtiQuizResult } from '@prisma/client';

interface SubmitMbtiResultData {
  mbti_type: string;
  score_breakdown: {
    E: number; I: number;
    S: number; N: number;
    T: number; F: number;
    J: number; P: number;
  };
  userId?: string; // Optional: if the user is logged in
}

export async function serverSubmitMbtiResult(data: SubmitMbtiResultData): Promise<MbtiQuizResult | null> {
  console.log('============================================================');
  console.log('[ServerAction serverSubmitMbtiResult] ACTION CALLED. Received data:', JSON.stringify(data, null, 2));
  try {
    const newResult = await prisma.mbtiQuizResult.create({
      data: {
        userId: data.userId || null, // Store null if userId is not provided
        mbtiType: data.mbti_type,
        scoreEI_E: data.score_breakdown.E,
        scoreEI_I: data.score_breakdown.I,
        scoreSN_S: data.score_breakdown.S,
        scoreSN_N: data.score_breakdown.N,
        scoreTF_T: data.score_breakdown.T,
        scoreTF_F: data.score_breakdown.F,
        scoreJP_J: data.score_breakdown.J,
        scoreJP_P: data.score_breakdown.P,
        submittedAt: new Date(),
      },
    });
    console.log('[ServerAction serverSubmitMbtiResult] Result saved to DB with ID:', newResult.id);
    console.log('============================================================');
    return newResult;
  } catch (error: any) {
    console.error('============================================================');
    console.error('[ServerAction serverSubmitMbtiResult] Error calling prisma.mbtiQuizResult.create. Full error details below.');
    if (error instanceof Error) {
        console.error('[ServerAction serverSubmitMbtiResult] Error Name:', error.name);
        console.error('[ServerAction serverSubmitMbtiResult] Error Message:', error.message);
        console.error('[ServerAction serverSubmitMbtiResult] Error Stack:', error.stack);
    } else {
        console.error('[ServerAction serverSubmitMbtiResult] Non-Error object thrown:', error);
    }
    
    let detailedErrorMessage = error instanceof Error ? error.message : String(error);
    if (error.code) { 
        console.error("[ServerAction serverSubmitMbtiResult] Prisma Error Code (from caught error):", error.code); 
        detailedErrorMessage += ` (Prisma Code: ${error.code}`;
        if (error.meta) {
            console.error("[ServerAction serverSubmitMbtiResult] Prisma Error Meta (from caught error):", JSON.stringify(error.meta, null, 2)); 
            detailedErrorMessage += `, Meta: ${JSON.stringify(error.meta)}`;
        }
        detailedErrorMessage += `)`;
    }
    if (error.clientVersion) { console.error("[ServerAction serverSubmitMbtiResult] Prisma Client Version (from caught error):", error.clientVersion); }
    if (error.digest) { console.error("[ServerAction serverSubmitMbtiResult] Error Digest:", error.digest); }
    
    console.error('============================================================');
    // Re-throw a new error with potentially more details to aid client-side debugging if possible
    const newError = new Error(`ServerAction serverSubmitMbtiResult failed: ${detailedErrorMessage}`);
    // @ts-ignore
    newError.digest = error.digest || error.code || `serverSubmitMbtiResult-error-${Date.now()}`;
    throw newError;
  }
}

    
