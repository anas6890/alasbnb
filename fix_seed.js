const fs = require('fs');
let c = fs.readFileSync('app/api/seed/route.ts', 'utf8');

c = c.replace(/listingId: ([^,]+),\r?\n\s*checkIn/g, 'type: "LISTING",\n        listingId: $1,\n        checkIn');
c = c.replace(/sessionId: ([^,]+),\r?\n\s*checkIn/g, 'type: "EXPERIENCE",\n        sessionId: $1,\n        checkIn');

fs.writeFileSync('app/api/seed/route.ts', c);