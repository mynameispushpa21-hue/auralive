const fs = require('fs');
let code = fs.readFileSync('src/services/stateStore.tsx', 'utf-8');

const targetStr = `  const sendGift = (giftId: string, receiverId: string, count = 1, roomId?: string): { success: boolean; message: string } => {
    const gift = gifts.find((g) => g.id === giftId);`;

const replaceStr = `  const sendGift = (giftId: string, receiverId: string, count = 1, roomId?: string): { success: boolean; message: string } => {
    const targetRoomId = roomId || activeRoom?.id;
    const gift = gifts.find((g) => g.id === giftId);`;

code = code.replace(targetStr, replaceStr);

// Then remove the duplicate declarations
code = code.replace(`      const targetRoomId = roomId || activeRoom?.id;
      
      const newProgresses`, `      const newProgresses`);

code = code.replace(`    // Add to Room Chat Feed if in room
    const targetRoomId = roomId || activeRoom?.id;
    if (targetRoomId) {`, `    // Add to Room Chat Feed if in room
    if (targetRoomId) {`);

fs.writeFileSync('src/services/stateStore.tsx', code);
console.log('fixed targetRoomId');
