const fs = require('fs');
let code = fs.readFileSync('src/components/mobile/RoomLeaderboardModal.tsx', 'utf-8');
code = code.replace(/\\\$/g, '$');
fs.writeFileSync('src/components/mobile/RoomLeaderboardModal.tsx', code);
console.log('fixed escaping');
