import type { Plugin } from "@opencode-ai/plugin";

export const AiRefPlugin: Plugin = async ({
  client,
  directory,
  worktree,
}) => {
  await client.app.log({
    service: "ai-ref",
    level: "info",
    message: "AI-REF plugin initialized",
    extra: { directory, worktree },
  });

  return {
    "session.created": async () => {
      await client.app.log({
        service: "ai-ref",
        level: "debug",
        message: "New session created",
      });
    },

    "file.edited": async ({ event }) => {
      const filePath = (event as { path?: string }).path || "";

      if (filePath.endsWith("SKILL.md")) {
        await client.app.log({
          service: "ai-ref",
          level: "info",
          message: `Skill file edited: ${filePath}`,
        });
      }

      if (filePath.includes("/agents/") && filePath.endsWith(".md")) {
        await client.app.log({
          service: "ai-ref",
          level: "info",
          message: `Agent definition edited: ${filePath}`,
        });
      }
    },

    "tool.execute.before": async (input, output) => {
      if (input.tool === "Write" || input.tool === "Edit") {
        const filePath = output.args?.filePath as string | undefined;
        if (filePath?.includes("/skills/") || filePath?.includes("/agents/")) {
          await client.app.log({
            service: "ai-ref",
            level: "debug",
            message: `Modifying skill/agent: ${filePath}`,
          });
        }
      }
    },

    "session.idle": async () => {
      await client.app.log({
        service: "ai-ref",
        level: "debug",
        message: "Session idle",
      });
    },
  };
};

export default AiRefPlugin;
