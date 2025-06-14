
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
  console.log('[ServerAction serverSubmitMbtiResult] Received data for submission:', data);
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
    return newResult;
  } catch (error) {
    console.error('[ServerAction serverSubmitMbtiResult] Error saving MBTI result to DB:', error);
    // Consider how to handle this error. Re-throwing might be appropriate,
    // or returning null and letting the client show a generic error.
    // For now, re-throw to make sure server errors are visible.
    if (error instanceof Error) {
        throw new Error(`Failed to save MBTI result: ${error.message}`);
    }
    throw new Error('An unknown error occurred while saving MBTI result.');
  }
}

    