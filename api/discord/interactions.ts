// Vercel Serverless Function: Discord Slash Commands Interactions Webhook
import type { VercelRequest, VercelResponse } from '@vercel/node';

// PING type 1, APPLICATION_COMMAND type 2
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const interaction = req.body;

    // Discord Ping Verification
    if (interaction?.type === 1) {
      return res.status(200).json({ type: 1 });
    }

    // Application Commands
    if (interaction?.type === 2) {
      const commandName = interaction.data?.name;
      const callerUser = interaction.user || interaction.member?.user || { username: 'Developer' };

      if (commandName === 'help') {
        return res.status(200).json({
          type: 4,
          data: {
            embeds: [
              {
                title: '⚔️ DEVARENA Discord Bot Commands',
                description: 'Social DSA Battles, Daily Problems & Leaderboards',
                color: 0x00E5FF,
                fields: [
                  { name: '/daily', value: "View today's scheduled DSA challenges", inline: true },
                  { name: '/challenge', value: 'Fetch a live coding problem to solve', inline: true },
                  { name: '/leaderboard', value: 'Inspect top global Elo ratings', inline: true },
                  { name: '/profile', value: 'Show linked developer profile & rank', inline: true },
                  { name: '/streak', value: 'Check your current problem-solving streak', inline: true },
                  { name: '/link <code>', value: 'Link Discord tag to DEVARENA account', inline: true }
                ],
                footer: { text: 'DEVARENA Platform • https://devarena.io/app/connect' }
              }
            ]
          }
        });
      }

      if (commandName === 'daily' || commandName === 'challenge') {
        return res.status(200).json({
          type: 4,
          data: {
            content: `🎯 **Today's Challenge for ${callerUser.username}:**`,
            embeds: [
              {
                title: 'Two Sum (Easy)',
                url: 'https://devarena.io/app/arena?problem=two-sum',
                description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\n\n👉 [**Solve on Code Arena**](https://devarena.io/app/arena?problem=two-sum)',
                color: 0x22C55E,
                fields: [
                  { name: 'Difficulty', value: '🟢 Easy', inline: true },
                  { name: 'Topic', value: 'Arrays & Hashing', inline: true },
                  { name: 'Example', value: 'nums = [2, 7, 11, 15], target = 9 ➔ [0, 1]', inline: false }
                ],
                footer: { text: 'DEVARENA • Beat your friends. Prove your skills.' }
              }
            ],
            components: [
              {
                type: 1,
                components: [
                  {
                    type: 2,
                    style: 5,
                    label: 'Solve on DEVARENA',
                    url: 'https://devarena.io/app/arena?problem=two-sum'
                  }
                ]
              }
            ]
          }
        });
      }

      return res.status(200).json({
        type: 4,
        data: {
          content: `Hello ${callerUser.username}! DEVARENA received command \`/${commandName}\`.`
        }
      });
    }

    return res.status(200).json({ message: 'Unhandled interaction' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
