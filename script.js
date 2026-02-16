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

const projects = [
    'badsh1mmer',
    'baddieapple',
    'sh1ttyOOBE',
    'sh1ttyexec',
    'badbr0ker',
    'crosbreaker.dev'
];

async function loadMember(id) {
    try {
        const res = await fetch(`https://api.lanyard.rest/v1/users/${id}`);
        const { data } = await res.json();
        const card = document.createElement('div');
        card.className = 'mem-card';
        
        const avHash = data.discord_user.avatar;
        const avUrl = `https://cdn.discordapp.com/avatars/${id}/${avHash}.png?size=128`;
        const s = data.discord_status;
        const sClass = s === 'dnd' ? 'dnd' : s;
        const sLabel = s === 'dnd' ? 'do not disturb' : s;
        const oStatus = data.activities?.find(a => a.type === 4);
        const cText = oStatus?.state || oStatus?.emoji?.name || '';

        card.innerHTML = `
        <img class="mem-avatar" src="${avUrl}" alt="member">
        <div class="mem-info">
            <span class="mem-name">${data.discord_user.display_name || data.discord_user.username}</span>
            <span class="mem-status ${sClass}">${sLabel}</span>
            ${cText ? `<span class="mem-ostatus">${cText}</span>` : ""}
        </div>`;
        document.querySelector('.mem-grid').appendChild(card);
    } catch (e) { console.error(e); }
}

async function loadProjects() {
    const grid = document.querySelector('.proj-grid');
    grid.innerHTML = '';

    const promises = projects.map(repoName => 
        fetch(`https://api.github.com/repos/crosbreaker/${repoName}`).then(res => res.json())
    );

    try {
        const repos = await Promise.all(promises);

        repos.forEach(repo => {
            if (repo.message === "Not Found") return;

            const card = document.createElement('div');
            card.className = 'proj-card';
            card.innerHTML = `
                <div class="proj-top">
                    <div class="proj-icon">
                        <i data-lucide="code"></i>
                    </div>
                </div>
                <span class="proj-name">${repo.name}</span>
                <p class="proj-desc">${repo.description || 'No description available.'}</p>
                <a class="proj-btn" href="${repo.html_url}" target="_blank">
                    <i data-lucide="github"></i>
                    open in github
                </a>
            `;
            grid.appendChild(card);
        });

        lucide.createIcons();
    } catch (e) { console.error("Error fetching projects:", e); }
}

mems.forEach(loadMember);
loadProjects();