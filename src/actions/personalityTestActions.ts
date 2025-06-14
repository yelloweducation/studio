
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
      console.log(`[ServerAction serverSubmitMbtiResult] Checking existence for userId: "${data.userId}"`);
      let userExistsPrismaResult = null;
      try {
        userExistsPrismaResult = await prisma.user.findUnique({
          where: { id: data.userId },
          select: { id: true } 
        });
        console.log(`[ServerAction serverSubmitMbtiResult] prisma.user.findUnique result for ID "${data.userId}":`, JSON.stringify(userExistsPrismaResult));
      } catch (userFindError: any) {
        console.error(`[ServerAction serverSubmitMbtiResult] Error during prisma.user.findUnique for ID "${data.userId}":`, userFindError.message);
        // If findUnique itself fails, we treat the user as not found for this submission.
        finalUserId = null; 
        console.warn(`[ServerAction serverSubmitMbtiResult] Due to error checking user, treating userId "${data.userId}" as not found. Saving MBTI result as unlinked.`);
      }

      // This condition ensures finalUserId is nulled if userExistsPrismaResult is null 
      // AND finalUserId hasn't already been nulled by the catch block above.
      if (userExistsPrismaResult === null && finalUserId !== null) { 
        console.warn(`[ServerAction serverSubmitMbtiResult] Provided userId "${data.userId}" does not exist in User table (userExistsPrismaResult is null). Saving MBTI result as unlinked.`);
        finalUserId = null;
      } else if (userExistsPrismaResult !== null) {
        console.log(`[ServerAction serverSubmitMbtiResult] User with ID "${data.userId}" verified. Proceeding to link MBTI result.`);
        // finalUserId remains data.userId here
      }
      // If finalUserId was nulled by the catch block or the condition above, it's correctly null.
    } else {
      console.log("[ServerAction serverSubmitMbtiResult] No userId provided. Saving MBTI result as unlinked.");
    }

    console.log(`[ServerAction serverSubmitMbtiResult] finalUserId before creating MbtiQuizResult: "${finalUserId}"`);

    const newResult = await prisma.mbtiQuizResult.create({
      data: {
        userId: finalUserId, 
        mbtiType: data.mbti_type,
        scoreEI_E: data.score_breakdown.E,
        scoreEI_I: data.score_breakdown.I,
        scoreSN_S: data.score_breakdown.S,
        scoreSN_N: data.score_breakdown.N,
        scoreTF_T: data.score_breakdown.T,
        scoreTF_F: data.score_breakdown.F,
        scoreJP_J: data.score_breakdown.J,
        scoreJP_P: data.score_breakdown.P,
        // submittedAt is handled by @default(now())
      },
    });
    console.log('[ServerAction serverSubmitMbtiResult] Result saved to DB with ID:', newResult.id, "Linked to userId:", newResult.userId);
    console.log('============================================================');
    return newResult;
  } catch (error: any) {
    console.error('============================================================');
    console.error('[ServerAction serverSubmitMbtiResult] Error in serverSubmitMbtiResult. Full error details below.');
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
    
