import { DbUser } from "@/types/user";

export interface MatchResult {
  score: number;
  explanation: string[];
}

/**
 * Computes a compatibility score between two users based on a rule-based matching algorithm.
 */
export function calculateMatchScore(currentUser: DbUser, otherUser: DbUser): MatchResult {
  let skillOverlapScore = 0;
  let experienceScore = 0;
  let completenessScore = 0;
  const explanation: string[] = [];

  // Helper mapping for levels
  const levelValue = {
    beginner: 1,
    intermediate: 2,
    expert: 3,
  };

  // --- 1. Skill Overlap (70% Max) ---
  // Peer teaches what Current User wants to learn (35% Max)
  const peerTeachesMatchingSkills = otherUser.skillsCanTeach.filter((peerSkill) =>
    currentUser.skillsWantToLearn.some(
      (mySkill) => mySkill.skillName.toLowerCase() === peerSkill.skillName.toLowerCase()
    )
  );

  const peerTeachesPoints = Math.min(35, peerTeachesMatchingSkills.length * 17.5);
  skillOverlapScore += peerTeachesPoints;

  if (peerTeachesMatchingSkills.length > 0) {
    const skillList = peerTeachesMatchingSkills.map((s) => s.skillName).join(", ");
    explanation.push(
      `They can teach you: ${skillList} (+${peerTeachesPoints.toFixed(0)}% Skill Overlap)`
    );
  } else {
    explanation.push("They don't teach any skills you want to learn (0% Overlap)");
  }

  // Current User teaches what Peer wants to learn (35% Max)
  const currentUserTeachesMatchingSkills = currentUser.skillsCanTeach.filter((mySkill) =>
    otherUser.skillsWantToLearn.some(
      (peerSkill) => peerSkill.skillName.toLowerCase() === mySkill.skillName.toLowerCase()
    )
  );

  const myTeachesPoints = Math.min(35, currentUserTeachesMatchingSkills.length * 17.5);
  skillOverlapScore += myTeachesPoints;

  if (currentUserTeachesMatchingSkills.length > 0) {
    const skillList = currentUserTeachesMatchingSkills.map((s) => s.skillName).join(", ");
    explanation.push(
      `You can teach them: ${skillList} (+${myTeachesPoints.toFixed(0)}% Skill Overlap)`
    );
  } else {
    explanation.push("You don't teach any skills they want to learn (0% Overlap)");
  }

  // --- 2. Experience Compatibility (20% Max) ---
  // We award up to 10 points for peer's teaching compatibility, and up to 10 points for your teaching compatibility.
  let peerTeachCompatibilityPoints = 0;
  if (peerTeachesMatchingSkills.length > 0) {
    let totalComp = 0;
    peerTeachesMatchingSkills.forEach((peerSkill) => {
      // Find current user's target level for this skill
      const myTarget = currentUser.skillsWantToLearn.find(
        (ms) => ms.skillName.toLowerCase() === peerSkill.skillName.toLowerCase()
      );
      if (myTarget) {
        const peerLevel = levelValue[peerSkill.experienceLevel] || 1;
        const myTargetLevel = levelValue[myTarget.targetLevel] || 1;
        
        if (peerLevel >= myTargetLevel) {
          totalComp += 10; // Fully compatible or exceeds
        } else {
          const diff = myTargetLevel - peerLevel;
          if (diff === 1) totalComp += 7; // Slightly below
          else totalComp += 4; // Significantly below
        }
      }
    });
    peerTeachCompatibilityPoints = totalComp / peerTeachesMatchingSkills.length;
    experienceScore += peerTeachCompatibilityPoints;
    explanation.push(
      `Their experience levels fit your learning targets (+${peerTeachCompatibilityPoints.toFixed(0)}% Experience Fit)`
    );
  }

  let myTeachCompatibilityPoints = 0;
  if (currentUserTeachesMatchingSkills.length > 0) {
    let totalComp = 0;
    currentUserTeachesMatchingSkills.forEach((mySkill) => {
      // Find peer's target level for this skill
      const peerTarget = otherUser.skillsWantToLearn.find(
        (ps) => ps.skillName.toLowerCase() === mySkill.skillName.toLowerCase()
      );
      if (peerTarget) {
        const myLevel = levelValue[mySkill.experienceLevel] || 1;
        const peerTargetLevel = levelValue[peerTarget.targetLevel] || 1;
        
        if (myLevel >= peerTargetLevel) {
          totalComp += 10; // Fully compatible
        } else {
          const diff = peerTargetLevel - myLevel;
          if (diff === 1) totalComp += 7;
          else totalComp += 4;
        }
      }
    });
    myTeachCompatibilityPoints = totalComp / currentUserTeachesMatchingSkills.length;
    experienceScore += myTeachCompatibilityPoints;
    explanation.push(
      `Your experience levels fit their learning targets (+${myTeachCompatibilityPoints.toFixed(0)}% Experience Fit)`
    );
  }

  if (peerTeachesMatchingSkills.length === 0 && currentUserTeachesMatchingSkills.length === 0) {
    explanation.push("No overlapping skills to evaluate experience compatibility (0% Experience Fit)");
  }

  // --- 3. Profile Completeness (10% Max) ---
  let completenessPoints = 0;
  if (otherUser.avatar) completenessPoints += 2;
  if (otherUser.bio) completenessPoints += 2;
  if (otherUser.college) completenessPoints += 2;
  if (otherUser.degree) completenessPoints += 1;
  if (otherUser.github) completenessPoints += 1;
  if (otherUser.linkedin) completenessPoints += 1;
  if (otherUser.portfolio) completenessPoints += 1;

  completenessScore = completenessPoints;
  explanation.push(
    `Their profile setup is complete (+${completenessScore}% Profile Completeness)`
  );

  const totalScore = Math.round(skillOverlapScore + experienceScore + completenessScore);

  return {
    score: totalScore,
    explanation,
  };
}
