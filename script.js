const mems = [
    '1471366391943921746',
    '825790210960654336',
    '423971987208142849',
    '1426742678506311740',
    '1042919810469740625',
    '1101547649477386331',
    '821086846636916737',
    '1426598979302457446',
    '952792525637312552',
    '759683999810715648'
];

async function loadMember(id) {
    const res = await fetch(`https://api.lanyard.rest/v1/users/${id}`);
    const {data}=await res.json();
    const card=document.createElement('div');
    card.className = 'mem-card';
    const avHash  =data.discord_user.avatar;
    const avUrl = `https://cdn.discordapp.com/avatars/${id}/${avHash}.png?size=128`;
    const s =data.discord_status;
    const sLabel = s==='dnd'?'do not disturb':s;
    const sClass = s==='dnd'?'dnd':s;
    const oStatus = data.activities?.find(a=>a.type===4);
    const cText = oStatus?.state||oStatus?.emoji?.name || '';
    card.innerHTML = `
    <img class="mem-avatar" src="${avUrl}" alt="member">
    <div class="mem-info">
        <span class="mem-name">${data.discord_user.display_name||data.discord_user.username}</span>
        <span class="mem-status ${sClass}">${sLabel}</span>
        ${cText ?`<span class="mem-ostatus">${cText}</span>`:''}
    </div>`;
    document.querySelector('.mem-grid').appendChild(card);
}

mems.forEach(loadMember);