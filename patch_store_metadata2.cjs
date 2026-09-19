const fs = require('fs');
let code = fs.readFileSync('src/services/stateStore.tsx', 'utf-8');

const targetStr2 = `    const txReceiver: WalletTransaction = {
      id: \`tx_\${Date.now()}_recv\`,
      userId: receiver.id,
      type: 'gift_received',
      currency: 'DIAMONDS',
      amount: finalHostDiamonds,
      direction: 'CREDIT',
      balanceAfter: updatedReceiver.diamonds,
      referenceId: \`gift_\${gift.id}_x\${count}\`,
      description: transactionDetails,
      status: 'SUCCESS',
      createdAt: new Date().toISOString(),
    };`;

const replaceStr2 = `    const txReceiver: WalletTransaction = {
      id: \`tx_\${Date.now()}_recv\`,
      userId: receiver.id,
      type: 'gift_received',
      currency: 'DIAMONDS',
      amount: finalHostDiamonds,
      direction: 'CREDIT',
      balanceAfter: updatedReceiver.diamonds,
      referenceId: \`gift_\${gift.id}_x\${count}\`,
      description: transactionDetails,
      status: 'SUCCESS',
      metadata: { roomId: targetRoomId, senderId: currentUser.id, giftId: gift.id, count },
      createdAt: new Date().toISOString(),
    };`;

code = code.replace(targetStr2, replaceStr2);

fs.writeFileSync('src/services/stateStore.tsx', code);
console.log('patched metadata 2');
