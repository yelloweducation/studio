
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
    let finalUserId: string | null = data.userId || null;

    if (data.userId) {
      const userExists = await prisma.user.findUnique({
        where: { id: data.userId },
        select: { id: true } // Select only id for efficiency, we just need to check existence
      });
      if (!userExists) {
        console.warn(`[ServerAction serverSubmitMbtiResult] Provided userId "${data.userId}" does not exist in User table. Saving MBTI result as unlinked.`);
        finalUserId = null; // User does not exist, so save result without linking
      } else {
        console.log(`[ServerAction serverSubmitMbtiResult] User with ID "${data.userId}" verified. Proceeding to link MBTI result.`);
      }
    } else {
      console.log("[ServerAction serverSubmitMbtiResult] No userId provided. Saving MBTI result as unlinked.");
    }

    const newResult = await prisma.mbtiQuizResult.create({
      data: {
        userId: finalUserId, // Use the verified or nulled-out userId
        mbtiType: data.mbti_type,
        scoreEI_E: data.score_breakdown.E,
        scoreEI_I: data.score_breakdown.I,
        scoreSN_S: data.score_breakdown.S,
        scoreSN_N: data.score_breakdown.N,
        scoreTF_T: data.score_breakdown.T,
        scoreTF_F: data.score_breakdown.F,
        scoreJP_J: data.score_breakdown.J,
        scoreJP_P: data.score_breakdown.P,
        // submittedAt is handled by @default(now()) in Prisma schema
      },
    });
    console.log('[ServerAction serverSubmitMbtiResult] Result saved to DB with ID:', newResult.id, "Linked to userId:", newResult.userId);
    console.log('============================================================');
    return newResult;
  } catch (error: any) {
    console.error('============================================================');
    console.error('[ServerAction serverSubmitMbtiResult] Error calling prisma.mbtiQuizResult.create. Full error details below.');
    let detailedErrorMessage = "Failed to submit MBTI results.";
    if (error instanceof Error) {
        console.error('[ServerAction serverSubmitMbtiResult] Error Name:', error.name);
        console.error('[ServerAction serverSubmitMbtiResult] Error Message:', error.message);
        console.error('[ServerAction serverSubmitMbtiResult] Error Stack:', error.stack);
        detailedErrorMessage = error.message;
    } else {
        console.error('[ServerAction serverSubmitMbtiResult] Non-Error object thrown:', error);
    }

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
    const newError = new Error(`ServerAction serverSubmitMbtiResult failed: ${detailedErrorMessage}`);
    // @ts-ignore
    newError.digest = error.digest || error.code || `serverSubmitMbtiResult-error-${Date.now()}`;
    throw newError;
  }
}
    
