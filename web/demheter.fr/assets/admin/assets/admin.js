Log.pushHandler(UI.notifyHandler);

let admin = false;
let news = null;

async function start() {
    try {
        news = await Net.get('api.php?method=news');
        admin = true;
    } catch (err) {
        if (err.status != 401)
            throw err;
    }

    await run();
}

async function run() {
    if (admin) {
        if (news == null)
            news = await Net.get('api.php?method=news');
        renderNews();
    } else {
        renderLogin();
    }

    document.body.classList.remove('loading');
}

function renderLogin() {
    let page_el = document.querySelector('#page');

    render(html`
        <div class="dialog screen">
            <form @submit=${UI.wrap(login)}>
                <div class="title">Back-office DEMHETER</div>
                <div class="main">
                    <label>
                        <span>Mot de passe</span>
                        <input name="password" type="password" />
                    </label>
                </div>

                <div class="footer">
                    <button>Valider</button>
                </div>
            </form>
        </div>
    `, page_el);
}

async function login(e) {
    let target = e.target;
    let password = target.elements.password.value;

    await Net.post('api.php?method=login', { password: password });
    admin = true;

    run();
}

async function resetNews() {
    news = await Net.get('api.php?method=news');
    run();
}

async function submitNews(e) {
    let target = e.target;
    let payload = [];

    for (let tr of target.querySelectorAll('tbody > tr')) {
        let item = {
            image: tr.querySelector('.image').value,
            title: tr.querySelector('.title').value,
            content: tr.querySelector('.content').value
        };

        payload.push(item);
    }

    news = await Net.post('api.php?method=news', { news: payload });

    run();
}

function renderNews() {
    let page_el = document.querySelector('#page');

    render(html`
        <div class="dialog screen">
            <form @submit=${UI.wrap(submitNews)}>
                <div class="title">
                    News DEMHETER
                    <div style="flex: 1;"></div>
                    <button type="button" class="secondary" @click=${UI.wrap(addNews)}>Ajouter</button>
                </div>

                <div class="main">
                    <table style="table-layout: fixed;">
                        <colgroup>
                            <col>
                            <col>
                            <col>
                            <col class="check">
                        </colgroup>

                        <thead>
                            <th>Image (URL)</th>
                            <th>Titre</th>
                            <th>Contenu</th>
                            <th></th>
                        </thead>

                        <tbody>
                            ${news.map(item => html`
                                <tr>
                                    <td><input class="image" type="text" value=${item.image}></td>
                                    <td><input class="title" type="text" value=${item.title}></td>
                                    <td><textarea class="content" style="width: 100%";" rows="5">${item.content}</textarea></td>
                                    <td class="right">
                                        <button type="button" class="small"
                                                @click=${UI.wrap(e => deleteNews(item))}><img src="assets/delete.webp" alt="Supprimer" /></button>
                                    </td>
                                </tr>
                            `)}
                            ${!news.length ? html`<tr><td colspan="4" style="text-align: center;">Aucun contenu à afficher</td></tr>` : ''}
                        </tbody>
                    </table>
                </div>
                <div class="footer">
                    <button type="button" class="danger" @click=${UI.wrap(resetNews)}>Annuler</button>
                    <button type="submit">Valider</button>
                </div>
            </form>
        </div>
    `, page_el);
}

function addNews(e) {
    let item = {
        image: '',
        title: '',
        content: ''
    };
    news.push(item);

    run();
}

function deleteNews(item) {
    news = news.filter(it => it !== item);
    run();
}