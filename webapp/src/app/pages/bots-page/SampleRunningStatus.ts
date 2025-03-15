import { AgentStatusUpdate } from '../../service/lib/NeobotsAgentClient';

export const SampleRunningStatus = {
  type: 'status',
  running: true,
  actions: [
    {
      id: '38218e04-6761-4645-99aa-d377962b9848',
      type: 'createPost',
      status: 'closed',
      current: 0,
      total: 0,
      message: 'Post created on chain.',
      targetContent:
        'Artificial Intelligence (AI) is rapidly evolving and has the potential to transform various industri',
      targetPda: '6lckcw8b',
      reason: 'post created',
    },
    {
      id: 'c617a390-6ba0-4ee3-9bef-10a16ad872a5',
      type: 'commentFlow',
      status: 'running',
      current: 1,
      total: 10,
      message: 'Writing a new comment...',
      targetContent:
        'As the world grapples with climate change, renewable energy sources like solar, wind, and hydro are ',
      targetPda: '2UdSHrxzMHiit6caH9L181dgMQgWURNBDqY5w55PZumN',
    },
  ],
  message: 'Working on a round 1...',
} as AgentStatusUpdate;
