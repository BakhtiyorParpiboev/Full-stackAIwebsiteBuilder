import { Request, Response } from "express";
import prisma from "../lib/prisma";
import openai from "../configs/openai";

/**
 * Validates the owner and prompt, reserves five credits, then asks the AI to revise
 * the current HTML. Saves a version and conversation entries; refunds on failure.
 */
export const makeRevision = async (req: Request, res: Response) => {
  const userId = req.userId;
  let creditsDeducted = false;
  try {
    const { projectId } = req.params;
    if (typeof projectId !== "string" || !projectId) {
      return res.status(400).json({ message: "Project ID is required" });
    }
    // message from req.body
    const { message } = req.body ?? {};
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!userId || !user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    if (user.credits < 5) {
      return res.status(403).json({
        message: "Insufficient credits. Add more credits to your account.",
      });
    }
    if (typeof message !== "string" || message.trim() === "") {
      return res.status(400).json({ message: "Please enter valid prompt." });
    }
    const currentProject = await prisma.websiteProject.findUnique({
      where: { id: projectId, userId },
      include: { versions: true },
    });
    if (!currentProject) {
      return res.status(404).json({ message: "Project not found" });
    }
    await prisma.conversation.create({
      data: {
        role: "user",
        content: message,
        projectId,
      },
    });
    // update user credits -5
    const charge = await prisma.user.updateMany({
      where: { id: userId, credits: { gte: 5 } },
      data: { credits: { decrement: 5 } },
    });
    if (charge.count === 0) {
      return res.status(403).json({ message: "Insufficient credits" });
    }
    creditsDeducted = true;

    // Enhance user prompt
    // {role:'user', content: User's request message}
    const promptEnhanceResponse = await openai.chat.completions.create({
      model: "nvidia/nemotron-3-ultra-550b-a55b:free",
      messages: [
        {
          role: "system",
          content: `You are a prompt enhancement specialist. The user wants to make changes to their website. Enhance their request to be more specific and actionable for a web developer.
                  Enhance this by:
                  1. Being specific about what elements to change
                  2. Mentioning design details (colors, spacing, sizes)
                  3. Clarifying the desired outcome
                  4. Using clear technical terms

              Return ONLY the enhanced request, nothing else. Keep it concise (1-2 sentences).`,
        },
        {
          role: "user",
          content: `User's request: ${message}`,
        },
      ],
    });
    const enhancedPrompt = promptEnhanceResponse.choices[0]?.message.content?.trim();
    if (!enhancedPrompt) throw new Error("AI returned an empty enhanced prompt");
    await prisma.conversation.create({
      data: {
        role: "assistant",
        content: `I've enhanced your prompt to "${enhancedPrompt}".`,
        projectId,
      },
    });
    await prisma.conversation.create({
      data: {
        role: "assistant",
        content: `Now making changes to your website.`,
        projectId,
      },
    });

    // Generate website code
    const codeGenerationResponse = await openai.chat.completions.create({
      model: "nvidia/nemotron-3-ultra-550b-a55b:free",
      messages: [
        {
          role: "system",
          content: `You are an expert web developer. 
                  CRITICAL REQUIREMENTS:
                  - Return ONLY the complete updated HTML code with the requested changes.
                  - Use Tailwind CSS for ALL styling (NO custom CSS).
                  - Use Tailwind utility classes for all styling changes.
                  - Include all JavaScript in <script> tags before closing </body>
                  - Make sure it's a complete, standalone HTML document with Tailwind CSS
                  - Return the HTML Code Only, nothing else

                  Apply the requested changes while maintaining the Tailwind CSS styling approach.`,
        },
        {
          role: "user",
          content: `Here is the current website code: ${currentProject.current_code}. 
                    User wants this request: ${enhancedPrompt}`,
        },
      ],
    });

    const code = (codeGenerationResponse.choices[0]?.message.content || "")
      .replace(/^```[a-z]*\s*/i, "")
      .replace(/```\s*$/, "")
      .trim();
    
    // Credits returned when Code is not generated
    if (!code) {
      await prisma.conversation.create({
        data: {
          role: "assistant",
          content: `Unable to generate the code, Please try again`,
          projectId,
        },
      });
      await prisma.user.update({
        where: { id: userId },
        data: { credits: { increment: 5 } }
      });
    }

    const version = await prisma.version.create({
      data: {
        code: code,
        description: "changes made",
        projectId,
      },
    });
    await prisma.conversation.create({
      data: {
        role: "assistant",
        content: `I've made the changes to your website. You can now preview it.`,
        projectId,
      },
    });
    await prisma.websiteProject.update({
      where: { id: projectId },
      data: {
        current_code: code,
        current_version_index: version.id,
      },
    });

    creditsDeducted = false;
    res.json({ message: "Changes made successfully." });
  } catch (error: any) {
    if (creditsDeducted && userId) {
      await prisma.user.update({
        where: { id: userId },
        data: { credits: { increment: 5 } },
      }).catch((refundError) => console.error("Credit refund failed:", refundError));
    }
    res.status(500).json({ message: error.message });
  }
};

/**
 * Checks project ownership and finds the requested version within that project.
 * Restores its HTML and records the rollback in the conversation.
 */
export const rollbackToVersion = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const { projectId, versionId } = req.params;
    if (typeof projectId !== "string" || !projectId) {
      return res.status(400).json({ message: "Project ID is required" });
    }
    if (typeof versionId !== "string" || !versionId) {
      return res.status(400).json({ message: "Version ID is required" });
    }

    const project = await prisma.websiteProject.findUnique({
      where: { id: projectId, userId },
      include: { versions: true },
    });
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    const version = project.versions.find(
      (version) => version.id === versionId,
    );
    if (!version) {
      return res.status(404).json({ message: "Version not found" });
    }
    await prisma.websiteProject.update({
      where: { id: projectId, userId },
      data: {
        current_code: version.code,
        current_version_index: version.id,
      },
    });
    // create conversation - role: 'assistant', content: 'I've rolled back your website to version ${versionId}. You can view it in the project versions.', projectId
    await prisma.conversation.create({
      data: {
        role: "assistant",
        content: `I've rolled back your website to version ${versionId}. You can view it in the project versions.`,
        projectId,
      },
    });
    res.json({ message: `Rolled back to version ${versionId} successfully.` });
  } catch (error: any) {
    console.log(error.code || error.message);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Requires an authenticated owner and deletes their project. Related versions
 * and conversations are removed by the database cascade; missing projects return 404.
 */
export const deleteProject = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { projectId } = req.params;
    if (typeof projectId !== "string" || !projectId) {
      return res.status(400).json({ message: "Project ID is required" });
    }

    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    const deleted = await prisma.websiteProject.deleteMany({
      where: { id: projectId, userId },
    });
    if (deleted.count === 0) return res.status(404).json({ message: "Project not found" });
    res.json({ message: "Project deleted successfully." });
  } catch (error: any) {
    console.log(error.code || error.message);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Returns an authenticated owner’s project and versions for preview.
 * Returns 401 without authentication or 404 when the project is not theirs.
 */
export const getPreviewProject = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { projectId } = req.params;
    if (typeof projectId !== "string" || !projectId) {
      return res.status(400).json({ message: "Project ID is required" });
    }
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const project = await prisma.websiteProject.findFirst({
      where: { id: projectId, userId },
      include: { versions: true },
    });
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    res.json({ project });
  } catch (error: any) {
    console.log(error.code || error.message);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Lists published projects with public author details for the community page.
 */
export const getPublishedProjects = async (req: Request, res: Response) => {
  try {
    const projects = await prisma.websiteProject.findMany({
      where: { isPublished: true },
      include: { user: { select: { id: true, name: true, image: true } } },
    });
    res.json({ projects });
  }
  catch (error: any) {
    console.log(error.code || error.message);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Returns the HTML of a published project by ID. Private, missing, or empty
 * projects return 404 instead of exposing their code.
 */
export const getProjectById = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    if (typeof projectId !== "string" || !projectId) {
      return res.status(400).json({ message: "Project ID is required" });
    }
    if (!projectId) {
      return res.status(400).json({ message: "Project ID is required" });
    }
    const project = await prisma.websiteProject.findFirst({
      where: { id: projectId},
    });
    if (!project || project.isPublished === false || !project?.current_code) {
      return res.status(404).json({ message: "Project not found" });
    }
    res.json({ code: project.current_code });
  }
  catch (error: any) {
    console.log(error.code || error.message);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Validates ownership and nonempty HTML, then saves the manually edited code.
 * Clears the selected version because this edit is not a generated version.
 */
export const saveProjectCode = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { projectId } = req.params;
    if (typeof projectId !== "string" || !projectId) {
      return res.status(400).json({ message: "Project ID is required" });
    }
    const { code } = req.body ?? {};
    
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    if (typeof code !== "string" || code.trim() === "") {
      return res.status(400).json({ message: "Code cannot be empty" });
    }
    if (!projectId) {
      return res.status(400).json({ message: "Project ID is required" });
    }
    const project = await prisma.websiteProject.findUnique({
      where: { id: projectId, userId },
    });
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    await prisma.websiteProject.update({
      where: { id: projectId, userId },
      data: {current_code: code, current_version_index: ''},
    })
    return res.json({ message: "Project code saved successfully." });
  }
  catch (error: any) { 
    console.log(error.code || error.message);
    res.status(500).json({ message: error.message });
  }
}
