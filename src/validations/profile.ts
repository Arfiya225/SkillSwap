import { z } from "zod";

export const skillCanTeachSchema = z.object({
  skillName: z.string().min(1, "Skill name is required").max(100),
  experienceLevel: z.enum(["beginner", "intermediate", "expert"]),
  yearsOfExperience: z.number().min(0).max(50),
});

export const skillWantToLearnSchema = z.object({
  skillName: z.string().min(1, "Skill name is required").max(100),
  targetLevel: z.enum(["beginner", "intermediate", "expert"]),
});

export const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50),
  avatar: z.string().optional(),
  bio: z.string().max(300, "Bio must be 300 characters or less").optional(),
  college: z.string().max(100, "College name must be 100 characters or less").optional(),
  degree: z.string().max(100, "Degree description must be 100 characters or less").optional(),
  
  skillsCanTeach: z.array(skillCanTeachSchema),
  skillsWantToLearn: z.array(skillWantToLearnSchema),
  
  github: z.string().max(150, "Github link must be 150 characters or less").optional(),
  linkedin: z.string().max(150, "LinkedIn link must be 150 characters or less").optional(),
  portfolio: z.string().max(150, "Portfolio link must be 150 characters or less").optional(),
});

export type ProfileInput = z.infer<typeof profileSchema>;
