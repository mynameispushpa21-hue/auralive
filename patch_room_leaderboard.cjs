const fs = require('fs');
let code = fs.readFileSync('src/components/mobile/VoiceRoomScreen.tsx', 'utf-8');

// 1. Add Trophy to imports
code = code.replace(
  `import { ShareRoomModal } from './ShareRoomModal';`,
  `import { ShareRoomModal } from './ShareRoomModal';
import { RoomLeaderboardModal } from './RoomLeaderboardModal';`
);
code = code.replace(
  `import { Settings } from 'lucide-react';`,
  `import { Settings, Trophy } from 'lucide-react';`
);

// 2. Add showLeaderboard state
code = code.replace(
  `  const [showShareModal, setShowShareModal] = useState(false);`,
  `  const [showShareModal, setShowShareModal] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);`
);

// 3. Add Leaderboard button before Share button
const targetBtn = `          <button
            onClick={() => setShowShareModal(true)}
            className="p-1.5 rounded-full bg-[#1A1A24] hover:bg-[#232332] border border-[#232332] text-slate-300 transition-colors"
            title="Share Room"
          >
            <Share2 className="w-4 h-4" />
          </button>`;

const replaceBtn = `          <button
            onClick={() => setShowLeaderboard(true)}
            className="p-1.5 rounded-full bg-amber-500/20 hover:bg-amber-500/40 border border-amber-500/40 text-amber-300 transition-colors"
            title="Room Leaderboard"
          >
            <Trophy className="w-4 h-4" />
          </button>

          <button
            onClick={() => setShowShareModal(true)}
            className="p-1.5 rounded-full bg-[#1A1A24] hover:bg-[#232332] border border-[#232332] text-slate-300 transition-colors"
            title="Share Room"
          >
            <Share2 className="w-4 h-4" />
          </button>`;
code = code.replace(targetBtn, replaceBtn);

// 4. Add Leaderboard modal component at the end
const targetEnd = `      <ShareRoomModal isOpen={showShareModal} onClose={() => setShowShareModal(false)} room={activeRoom} />
      <RoomAudienceModal isOpen={showAudienceModal} onClose={() => setShowAudienceModal(false)} />
    </div>
  );
};`;

const replaceEnd = `      <ShareRoomModal isOpen={showShareModal} onClose={() => setShowShareModal(false)} room={activeRoom} />
      <RoomAudienceModal isOpen={showAudienceModal} onClose={() => setShowAudienceModal(false)} />
      {showLeaderboard && <RoomLeaderboardModal roomId={activeRoom.id} onClose={() => setShowLeaderboard(false)} />}
    </div>
  );
};`;
code = code.replace(targetEnd, replaceEnd);

fs.writeFileSync('src/components/mobile/VoiceRoomScreen.tsx', code);
console.log('patched VoiceRoomScreen');
